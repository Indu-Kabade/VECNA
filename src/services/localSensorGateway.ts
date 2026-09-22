import { 
  SensorReading, 
  AnomalyEvent, 
  ResourceType, 
  GatewayStats, 
  NetworkConnectionState 
} from '../types/offline';
import { 
  saveSensorReading, 
  saveAnomalyEvent, 
  getPendingSensorReadings, 
  getAllSensorReadings,
  getPendingAnomalyEvents 
} from './indexedDbService';
import { detectLocalAnomaly, SENSOR_BASELINES } from './anomalyDetection';
import { uploadTelemetryReadingToFirestore, uploadAnomalyToFirestore } from './firestoreTelemetry';

type ReadingListener = (reading: SensorReading) => void;
type AnomalyListener = (anomaly: AnomalyEvent) => void;
type StatsListener = (stats: GatewayStats) => void;

export class LocalSensorGatewayClass {
  private isOnline: boolean = true;
  private simulatorTimer: ReturnType<typeof setInterval> | null = null;
  private simulatorIntervalMs: number = 4000; // 4 seconds interval
  private readingListeners: Set<ReadingListener> = new Set();
  private anomalyListeners: Set<AnomalyListener> = new Set();
  private statsListeners: Set<StatsListener> = new Set();
  private lastSyncTime: string | null = null;
  private readingCounter: number = 0;

  // Predefined building sensors
  private sensorPool: Array<{
    sensorId: string;
    buildingId: string;
    floor: number;
    resourceType: ResourceType;
    baseline: number;
    unit: string;
    variancePercent: number;
  }> = [
    { sensorId: 'ELEC_F2_07', buildingId: 'tower_b', floor: 2, resourceType: 'electricity', baseline: 120, unit: 'kWh', variancePercent: 8 },
    { sensorId: 'WATER_F4_03', buildingId: 'tower_b', floor: 4, resourceType: 'water', baseline: 130, unit: 'L/h', variancePercent: 6 },
    { sensorId: 'ELEC_F1_LABS', buildingId: 'tower_b', floor: 1, resourceType: 'electricity', baseline: 95, unit: 'kWh', variancePercent: 5 },
    { sensorId: 'WATER_F0_MAIN', buildingId: 'tower_b', floor: 0, resourceType: 'water', baseline: 240, unit: 'L/h', variancePercent: 7 },
    { sensorId: 'TEMP_F2_01', buildingId: 'tower_b', floor: 2, resourceType: 'temperature', baseline: 22.5, unit: '°C', variancePercent: 4 },
    { sensorId: 'HVAC_F2_COMP', buildingId: 'tower_b', floor: 2, resourceType: 'hvac', baseline: 45, unit: 'kW', variancePercent: 6 },
    { sensorId: 'ELEC_F3_OFFICE', buildingId: 'tower_b', floor: 3, resourceType: 'electricity', baseline: 85, unit: 'kWh', variancePercent: 7 },
    { sensorId: 'OCC_F2_ZONE', buildingId: 'tower_b', floor: 2, resourceType: 'occupancy', baseline: 12, unit: 'people', variancePercent: 20 },
  ];

  constructor() {
    if (typeof navigator !== 'undefined') {
      this.isOnline = navigator.onLine;
    }
  }

  public setOnlineStatus(online: boolean) {
    this.isOnline = online;
    this.notifyStats();
  }

  public setLastSyncTime(time: string) {
    this.lastSyncTime = time;
    this.notifyStats();
  }

  public setSimulatorInterval(ms: number) {
    this.simulatorIntervalMs = ms;
    if (this.simulatorTimer) {
      this.stopSimulator();
      this.startSimulator();
    }
  }

  public onReading(listener: ReadingListener): () => void {
    this.readingListeners.add(listener);
    return () => this.readingListeners.delete(listener);
  }

  public onAnomaly(listener: AnomalyListener): () => void {
    this.anomalyListeners.add(listener);
    return () => this.anomalyListeners.delete(listener);
  }

  public onStats(listener: StatsListener): () => void {
    this.statsListeners.add(listener);
    return () => this.statsListeners.delete(listener);
  }

  /**
   * Core Local Sensor Gateway ingestion method.
   * Does NOT depend on the internet.
   * 1. Ingests reading.
   * 2. Immediately persists to IndexedDB.
   * 3. Evaluates local anomaly detection rule.
   * 4. If online, attempts instant cloud sync; if offline, remains in local buffer.
   */
  public async receiveReading(reading: SensorReading): Promise<void> {
    // 1. Assign network and initial sync status based on current gateway connection
    reading.networkStatus = this.isOnline ? 'online' : 'offline';
    reading.syncStatus = this.isOnline ? 'syncing' : 'pending';

    // 2. Persist IMMEDIATELY to IndexedDB
    await saveSensorReading(reading);

    // 3. Local Anomaly Detection (Always operates offline or online)
    const anomaly = detectLocalAnomaly(reading);
    if (anomaly) {
      anomaly.detectedOffline = !this.isOnline;
      anomaly.syncStatus = this.isOnline ? 'syncing' : 'pending';
      await saveAnomalyEvent(anomaly);

      // Notify anomaly listeners
      this.anomalyListeners.forEach((l) => l(anomaly));
    }

    // 4. If online, attempt direct background sync
    if (this.isOnline) {
      try {
        const upload = await uploadTelemetryReadingToFirestore(reading);
        if (upload.success) {
          reading.syncStatus = 'synced';
          reading.syncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          await saveSensorReading(reading);
        } else {
          reading.syncStatus = 'pending';
          await saveSensorReading(reading);
        }

        if (anomaly) {
          const anomUpload = await uploadAnomalyToFirestore(anomaly);
          if (anomUpload.success) {
            anomaly.syncStatus = 'synced';
            anomaly.syncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            await saveAnomalyEvent(anomaly);
          }
        }
      } catch (err) {
        console.warn('[LocalSensorGateway] Background sync error, kept in local buffer:', err);
        reading.syncStatus = 'pending';
        await saveSensorReading(reading);
      }
    }

    // 5. Notify reading listeners
    this.readingListeners.forEach((l) => l(reading));
    this.notifyStats();
  }

  /**
   * Starts simulated sensor generation at the configured interval.
   */
  public startSimulator(): void {
    if (this.simulatorTimer) return;

    // Immediately trigger one reading on start
    this.generatePeriodicReading();

    this.simulatorTimer = setInterval(() => {
      this.generatePeriodicReading();
    }, this.simulatorIntervalMs);
  }

  public stopSimulator(): void {
    if (this.simulatorTimer) {
      clearInterval(this.simulatorTimer);
      this.simulatorTimer = null;
    }
  }

  private generatePeriodicReading(): void {
    this.readingCounter++;
    // Cycle through sensor pool
    const sensorIndex = this.readingCounter % this.sensorPool.length;
    const config = this.sensorPool[sensorIndex];

    const now = new Date();
    // Normal noise: -variancePercent% to +variancePercent%
    const noisePct = (Math.random() * 2 - 1) * config.variancePercent;
    let actualVal = Math.round(config.baseline * (1 + noisePct / 100) * 10) / 10;
    if (config.resourceType === 'electricity' || config.resourceType === 'water') {
      actualVal = Math.round(actualVal);
    }

    const readingId = `reading_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const reading: SensorReading = {
      readingId,
      sensorId: config.sensorId,
      buildingId: config.buildingId,
      floor: config.floor,
      resourceType: config.resourceType,
      value: actualVal,
      unit: config.unit,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestampMs: now.getTime(),
      networkStatus: this.isOnline ? 'online' : 'offline',
      syncStatus: this.isOnline ? 'synced' : 'pending',
      baselineValue: config.baseline,
      deviationPercentage: Math.round(noisePct * 10) / 10,
    };

    this.receiveReading(reading);
  }

  /**
   * Generates a controlled abnormal reading for hackathon demonstration.
   * Specifically handles STEP 4:
   * Floor 2 electricity
   * Baseline: 120 kWh
   * Actual: 186 kWh
   * Deviation: +55%
   */
  public async injectAbnormalReading(params?: {
    sensorId?: string;
    floor?: number;
    resourceType?: 'electricity' | 'water';
    actualValue?: number;
    deviationPct?: number;
  }): Promise<SensorReading> {
    const floor = params?.floor ?? 2;
    const resourceType = params?.resourceType ?? 'electricity';
    const baseline = resourceType === 'electricity' ? 120 : 130;
    const unit = resourceType === 'electricity' ? 'kWh' : 'L/h';
    const sensorId = params?.sensorId ?? (resourceType === 'electricity' ? 'ELEC_F2_07' : 'WATER_F4_03');

    // Default to EXACT Step 4 demo scenario: 186 kWh (+55%)
    let actual = params?.actualValue;
    if (actual === undefined) {
      if (params?.deviationPct !== undefined) {
        actual = Math.round(baseline * (1 + params.deviationPct / 100));
      } else {
        actual = 186; // 186 kWh on Floor 2 (+55%)
      }
    }

    const deviationPct = Math.round(((actual - baseline) / baseline) * 100);
    const now = new Date();
    const readingId = `reading_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const reading: SensorReading = {
      readingId,
      sensorId,
      buildingId: 'tower_b',
      floor,
      resourceType,
      value: actual,
      unit,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestampMs: now.getTime(),
      networkStatus: this.isOnline ? 'online' : 'offline',
      syncStatus: 'pending',
      baselineValue: baseline,
      deviationPercentage: deviationPct,
      isAnomaly: true,
      severity: deviationPct > 25 ? 'high' : 'medium',
    };

    await this.receiveReading(reading);
    return reading;
  }

  public async getGatewayStats(): Promise<GatewayStats> {
    const all = await getAllSensorReadings(500);
    const pending = await getPendingSensorReadings();
    const pendingAnomalies = await getPendingAnomalyEvents();

    let networkState: NetworkConnectionState = 'ONLINE';
    if (!this.isOnline) {
      networkState = 'OFFLINE';
    }

    return {
      bufferedCount: all.length,
      pendingCount: pending.length + pendingAnomalies.length,
      syncedCount: all.filter((r) => r.syncStatus === 'synced').length,
      failedCount: all.filter((r) => r.syncStatus === 'failed').length,
      lastSyncTime: this.lastSyncTime,
      networkState,
    };
  }

  private async notifyStats(): Promise<void> {
    if (this.statsListeners.size === 0) return;
    try {
      const stats = await this.getGatewayStats();
      this.statsListeners.forEach((l) => l(stats));
    } catch {
      // Ignore
    }
  }
}

// Export singleton instance
export const LocalSensorGateway = new LocalSensorGatewayClass();
