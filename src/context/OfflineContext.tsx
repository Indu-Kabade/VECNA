import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useRef 
} from 'react';
import { 
  SensorReading, 
  AnomalyEvent, 
  OfflineEvent, 
  TelemetryReading, 
  NetworkConnectionState, 
  SyncProgress 
} from '../types/offline';
import { 
  getAllSensorReadings, 
  getPendingSensorReadings, 
  getAllAnomalyEvents, 
  getPendingAnomalyEvents, 
  getAllOfflineEvents, 
  markBatchAsSynced, 
  enrichEventWithAi 
} from '../services/indexedDbService';
import { LocalSensorGateway } from '../services/localSensorGateway';
import { runTelemetryResync } from '../services/telemetrySync';

export type SyncStateMode = 'idle' | 'syncing' | 'restored' | 'offline';

interface OfflineContextType {
  // Real Network & Gateway States
  networkState: NetworkConnectionState;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  bufferedCount: number;
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  lastSyncTime: string | null;
  syncProgress: SyncProgress | null;
  statusNotification: string | null;

  // Sensor Stream & Anomalies
  latestReading: SensorReading | null;
  readingsStream: SensorReading[];
  anomalyEvents: AnomalyEvent[];
  pendingAnomalies: AnomalyEvent[];
  latestOfflineAnomaly: AnomalyEvent | null;

  // Backward Compatibility for existing components
  syncState: SyncStateMode;
  events: OfflineEvent[];
  pendingEvents: OfflineEvent[];
  syncedEvents: OfflineEvent[];
  latestTelemetry: TelemetryReading | null;
  telemetryStream: TelemetryReading[];
  syncStatusMessage: string | null;
  isQueueModalOpen: boolean;
  setIsQueueModalOpen: (open: boolean) => void;
  selectedEventForLocalAi: OfflineEvent | null;
  setSelectedEventForLocalAi: (event: OfflineEvent | null) => void;

  // Actions
  simulateNetworkLoss: () => void;
  restoreConnection: () => Promise<void>;
  injectAbnormalReading: (preset?: {
    resource?: 'electricity' | 'water';
    floor?: number;
    actualValue?: number;
    deviation?: number;
    sensorId?: string;
  }) => Promise<void>;
  triggerSyncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const SIM_OFFLINE_STORAGE_KEY = 'ecotwin_simulated_offline';
const LAST_SYNC_STORAGE_KEY = 'ecotwin_last_sync_time';

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if simulated offline was active before (survives page refresh during outage)
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SIM_OFFLINE_STORAGE_KEY) === 'true';
    }
    return false;
  });

  // Real browser connectivity status
  const [browserOnline, setBrowserOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  // Effective online status
  const isOnline = browserOnline && !isSimulatedOffline;

  // Network State
  const [networkState, setNetworkState] = useState<NetworkConnectionState>(() =>
    !isOnline ? 'OFFLINE' : 'ONLINE'
  );

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LAST_SYNC_STORAGE_KEY) || '12:41 PM';
    }
    return '12:41 PM';
  });

  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState<boolean>(false);
  const [selectedEventForLocalAi, setSelectedEventForLocalAi] = useState<OfflineEvent | null>(null);

  // Sensor telemetry streams & anomaly states
  const [readingsStream, setReadingsStream] = useState<SensorReading[]>([]);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [anomalyEvents, setAnomalyEvents] = useState<AnomalyEvent[]>([]);
  const [pendingAnomalies, setPendingAnomalies] = useState<AnomalyEvent[]>([]);
  const [latestOfflineAnomaly, setLatestOfflineAnomaly] = useState<AnomalyEvent | null>(null);

  // Queue Counters
  const [bufferedCount, setBufferedCount] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncedCount, setSyncedCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);

  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;

  // Refresh counts and items from IndexedDB
  const refreshStorageState = useCallback(async () => {
    try {
      const allReadings = await getAllSensorReadings(100);
      const pendingReadings = await getPendingSensorReadings();
      const allAnoms = await getAllAnomalyEvents();
      const pendingAnoms = await getPendingAnomalyEvents();

      setReadingsStream(allReadings);
      if (allReadings.length > 0 && !latestReading) {
        setLatestReading(allReadings[0]);
      }
      setAnomalyEvents(allAnoms);
      setPendingAnomalies(pendingAnoms);

      const totalPending = pendingReadings.length + pendingAnoms.length;
      setBufferedCount(allReadings.length);
      setPendingCount(totalPending);
      setSyncedCount(allReadings.filter((r) => r.syncStatus === 'synced').length);
      setFailedCount(allReadings.filter((r) => r.syncStatus === 'failed').length);
    } catch (err) {
      console.warn('[EcoTwin OfflineContext] Error refreshing IndexedDB state:', err);
    }
  }, [latestReading]);

  // Initial load from IndexedDB
  useEffect(() => {
    refreshStorageState();
  }, [refreshStorageState]);

  // Synchronize LocalSensorGateway online state
  useEffect(() => {
    LocalSensorGateway.setOnlineStatus(isOnline);
    if (!isOnline) {
      setNetworkState('OFFLINE');
    } else if (networkState === 'OFFLINE') {
      setNetworkState('ONLINE');
    }
  }, [isOnline, networkState]);

  // Start the LocalSensorGateway background simulator on mount
  useEffect(() => {
    LocalSensorGateway.startSimulator();

    // Subscribe to incoming readings from gateway
    const unsubReading = LocalSensorGateway.onReading((reading) => {
      setLatestReading(reading);
      setReadingsStream((prev) => [reading, ...prev.slice(0, 49)]);
      setBufferedCount((prev) => prev + 1);
      if (reading.syncStatus === 'pending') {
        setPendingCount((prev) => prev + 1);
      } else if (reading.syncStatus === 'synced') {
        setSyncedCount((prev) => prev + 1);
      }
    });

    // Subscribe to anomaly detections from gateway
    const unsubAnomaly = LocalSensorGateway.onAnomaly((anomaly) => {
      setAnomalyEvents((prev) => [anomaly, ...prev]);
      if (anomaly.syncStatus === 'pending') {
        setPendingAnomalies((prev) => [anomaly, ...prev]);
        setPendingCount((prev) => prev + 1);
      }
      if (anomaly.detectedOffline) {
        setLatestOfflineAnomaly(anomaly);
        setStatusNotification(
          `UNUSUAL ${anomaly.resourceType.toUpperCase()} USAGE FOUND • LOCAL FALLBACK ANALYSIS (${anomaly.floorName ?? `Floor ${anomaly.floor}`} +${anomaly.deviationPercentage}% queued)`
        );
        setTimeout(() => setStatusNotification(null), 6500);
      }
    });

    // Subscribe to gateway stats
    const unsubStats = LocalSensorGateway.onStats((stats) => {
      setBufferedCount(stats.bufferedCount);
      setPendingCount(stats.pendingCount);
      setSyncedCount(stats.syncedCount);
      setFailedCount(stats.failedCount);
    });

    return () => {
      unsubReading();
      unsubAnomaly();
      unsubStats();
      LocalSensorGateway.stopSimulator();
    };
  }, []);

  // Trigger synchronization
  const triggerSyncNow = useCallback(async () => {
    if (!isOnlineRef.current) {
      setStatusNotification('Cannot synchronize: Network is currently offline');
      setTimeout(() => setStatusNotification(null), 4000);
      return;
    }

    setNetworkState('SYNCING');
    setSyncProgress({
      total: pendingCount,
      synced: 0,
      failed: 0,
      status: 'syncing',
      message: 'Connecting to Cloud Firestore...',
    });

    try {
      const result = await runTelemetryResync((prog) => {
        setSyncProgress(prog);
      });

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowTime);
      localStorage.setItem(LAST_SYNC_STORAGE_KEY, nowTime);
      LocalSensorGateway.setLastSyncTime(nowTime);

      if (result.readingsFailed > 0 || result.anomaliesFailed > 0) {
        setNetworkState('SYNC_ERROR');
      } else {
        setNetworkState('ONLINE');
      }

      await refreshStorageState();

      setStatusNotification(
        `✓ ${result.readingsSynced} readings & ${result.anomaliesSynced} anomalies synchronized • All sensor data is up to date.`
      );
      setTimeout(() => {
        setStatusNotification(null);
        setSyncProgress(null);
      }, 5000);
    } catch (err) {
      console.error('[EcoTwin] Sync execution error:', err);
      setNetworkState('SYNC_ERROR');
      setSyncProgress({
        total: pendingCount,
        synced: 0,
        failed: 1,
        status: 'error',
        message: 'Sync error: Retrying queued telemetry in next cycle.',
      });
    }
  }, [pendingCount, refreshStorageState]);

  // Simulate Network Loss
  const simulateNetworkLoss = useCallback(() => {
    setIsSimulatedOffline(true);
    localStorage.setItem(SIM_OFFLINE_STORAGE_KEY, 'true');
    setNetworkState('OFFLINE');
    LocalSensorGateway.setOnlineStatus(false);
    setStatusNotification(
      'OFFLINE MODE: IoT sensors are still collecting data. Data is being buffered locally until connectivity returns.'
    );
    setTimeout(() => setStatusNotification(null), 6000);
  }, []);

  // Restore Connection
  const restoreConnection = useCallback(async () => {
    setIsSimulatedOffline(false);
    localStorage.setItem(SIM_OFFLINE_STORAGE_KEY, 'false');
    LocalSensorGateway.setOnlineStatus(true);
    setNetworkState('SYNCING');
    setStatusNotification('CONNECTIVITY RESTORED • Synchronizing buffered sensor telemetry...');

    // Automatically begin synchronization
    await triggerSyncNow();
  }, [triggerSyncNow]);

  // Browser network event listeners
  useEffect(() => {
    const handleOnline = () => {
      setBrowserOnline(true);
      if (!isSimulatedOffline) {
        setStatusNotification('CONNECTIVITY RESTORED • Synchronizing sensor data...');
        triggerSyncNow();
      }
    };

    const handleOffline = () => {
      setBrowserOnline(false);
      setNetworkState('OFFLINE');
      LocalSensorGateway.setOnlineStatus(false);
      setStatusNotification('OFFLINE • Local Sensor Gateway buffering telemetry');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline, triggerSyncNow]);

  // Manual injection of abnormal readings for demo scenarios
  const injectAbnormalReading = useCallback(
    async (preset?: {
      resource?: 'electricity' | 'water';
      floor?: number;
      actualValue?: number;
      deviation?: number;
      sensorId?: string;
    }) => {
      await LocalSensorGateway.injectAbnormalReading({
        resourceType: preset?.resource ?? 'electricity',
        floor: preset?.floor ?? 2,
        actualValue: preset?.actualValue,
        deviationPct: preset?.deviation ?? 55, // Defaults to Floor 2 electricity 186 kWh (+55%)
        sensorId: preset?.sensorId,
      });
      await refreshStorageState();
    },
    [refreshStorageState]
  );

  // Backward-compatibility mapping for existing UI
  const syncState: SyncStateMode =
    networkState === 'OFFLINE'
      ? 'offline'
      : networkState === 'SYNCING'
      ? 'syncing'
      : syncProgress?.status === 'completed'
      ? 'restored'
      : 'idle';

  const events: OfflineEvent[] = anomalyEvents.map((a) => ({
    ...a,
    id: a.anomalyId,
    floorName: a.floorName ?? `Floor ${a.floor}`,
    actualConsumption: a.actualValue,
    expectedBaseline: a.baselineValue,
  }));

  const pendingEvents = events.filter((e) => e.syncStatus === 'pending');
  const syncedEvents = events.filter((e) => e.syncStatus === 'synced');

  const latestTelemetry: TelemetryReading | null = latestReading
    ? {
        ...latestReading,
        id: latestReading.readingId,
        building: latestReading.buildingId,
        floorName: `Floor ${latestReading.floor}`,
        actualValue: latestReading.value,
        baselineValue: latestReading.baselineValue ?? latestReading.value,
        isAbnormal: latestReading.isAnomaly ?? false,
      }
    : null;

  const telemetryStream: TelemetryReading[] = readingsStream.map((r) => ({
    ...r,
    id: r.readingId,
    building: r.buildingId,
    floorName: `Floor ${r.floor}`,
    actualValue: r.value,
    baselineValue: r.baselineValue ?? r.value,
    isAbnormal: r.isAnomaly ?? false,
  }));

  return (
    <OfflineContext.Provider
      value={{
        networkState,
        isOnline,
        isSimulatedOffline,
        bufferedCount,
        pendingCount,
        syncedCount,
        failedCount,
        lastSyncTime,
        syncProgress,
        statusNotification,

        latestReading,
        readingsStream,
        anomalyEvents,
        pendingAnomalies,
        latestOfflineAnomaly,

        syncState,
        events,
        pendingEvents,
        syncedEvents,
        latestTelemetry,
        telemetryStream,
        syncStatusMessage: statusNotification,
        isQueueModalOpen,
        setIsQueueModalOpen,
        selectedEventForLocalAi,
        setSelectedEventForLocalAi,

        simulateNetworkLoss,
        restoreConnection,
        injectAbnormalReading,
        triggerSyncNow,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
