export type ResourceType = 'electricity' | 'water' | 'temperature' | 'hvac' | 'occupancy';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export type NetworkConnectionState = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNC_ERROR';

export type AnomalySeverity = 'normal' | 'medium' | 'high';

export interface SensorReading {
  readingId: string;
  sensorId: string;
  buildingId: string;
  floor: number;
  resourceType: ResourceType;
  value: number;
  unit: string;
  timestamp: string;
  timestampMs: number;
  networkStatus: 'online' | 'offline';
  syncStatus: SyncStatus;
  baselineValue?: number;
  deviationPercentage?: number;
  isAnomaly?: boolean;
  severity?: AnomalySeverity;
  syncedAt?: string | null;
  error?: string | null;
}

export interface AnomalyEvent {
  anomalyId: string;
  readingId: string;
  resourceType: 'electricity' | 'water';
  building: string;
  floor: number;
  floorName?: string;
  actualValue: number;
  baselineValue: number;
  deviationPercentage: number;
  severity: 'medium' | 'high';
  timestamp: string;
  timestampMs: number;
  detectedOffline: boolean;
  syncStatus: SyncStatus;
  unit: string;
  zoneName?: string;
  localAnalysis?: string;
  aiEnriched?: boolean;
  aiAnalysis?: string;
  syncedAt?: string | null;
}

export interface OfflineEvent {
  id: string;
  anomalyId?: string;
  readingId?: string;
  timestamp: string;
  timestampMs: number;
  building: string;
  floor: number;
  floorName?: string;
  resourceType: 'electricity' | 'water';
  actualConsumption: number;
  expectedBaseline: number;
  actualValue?: number;
  baselineValue?: number;
  deviationPercentage: number;
  severity: 'medium' | 'high';
  detectedOffline: boolean;
  syncStatus: SyncStatus;
  unit: string;
  zoneName?: string;
  localAnalysis?: string;
  aiEnriched?: boolean;
  aiAnalysis?: string;
  syncedAt?: string | null;
}

export type TelemetryReading = SensorReading & {
  id: string;
  building: string;
  floorName: string;
  actualValue: number;
  baselineValue: number;
  isAbnormal: boolean;
  zoneName?: string;
};

export interface FloorBaseline {
  floor: number;
  floorName: string;
  electricityBaselineKwh: number;
  waterBaselineLitersPerHour: number;
  zoneName: string;
}

export interface SyncProgress {
  total: number;
  synced: number;
  failed: number;
  status: 'idle' | 'syncing' | 'completed' | 'error';
  message: string;
}

export interface GatewayStats {
  bufferedCount: number;
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  lastSyncTime: string | null;
  networkState: NetworkConnectionState;
}
