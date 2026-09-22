import { 
  SensorReading, 
  AnomalyEvent, 
  OfflineEvent, 
  SyncStatus 
} from '../types/offline';
import { AppliedSolutionRecord } from '../types';

const DB_NAME = 'ecotwin_offline_db';
const DB_VERSION = 3;
const TELEMETRY_STORE = 'telemetry';
const ANOMALY_STORE = 'anomalyEvents';
const LEGACY_EVENTS_STORE = 'offline_events';
const SOLUTIONS_STORE = 'applied_solutions';

// Backup localStorage keys for resilient survival across all devices/modes
const TELEMETRY_BACKUP_KEY = 'ecotwin_telemetry_backup';
const ANOMALY_BACKUP_KEY = 'ecotwin_anomaly_backup';
const LEGACY_BACKUP_KEY = 'ecotwin_offline_events_backup';
const SOLUTIONS_BACKUP_KEY = 'ecotwin_applied_solutions_backup';

let dbInstance: IDBDatabase | null = null;

// ================= LocalStorage Fallbacks =================

function getLocalStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalStorage<T>(key: string, data: T[]): void {
  try {
    // Keep top 200 items in localStorage to avoid quota exhaustion
    localStorage.setItem(key, JSON.stringify(data.slice(0, 200)));
  } catch {
    // Ignore storage quota errors
  }
}

// ================= Database Initialization =================

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Telemetry readings store
      if (!db.objectStoreNames.contains(TELEMETRY_STORE)) {
        const telStore = db.createObjectStore(TELEMETRY_STORE, { keyPath: 'readingId' });
        telStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        telStore.createIndex('timestampMs', 'timestampMs', { unique: false });
        telStore.createIndex('floor', 'floor', { unique: false });
        telStore.createIndex('resourceType', 'resourceType', { unique: false });
        telStore.createIndex('sensorId', 'sensorId', { unique: false });
      }

      // 2. Anomaly events store
      if (!db.objectStoreNames.contains(ANOMALY_STORE)) {
        const anomStore = db.createObjectStore(ANOMALY_STORE, { keyPath: 'anomalyId' });
        anomStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        anomStore.createIndex('timestampMs', 'timestampMs', { unique: false });
        anomStore.createIndex('detectedOffline', 'detectedOffline', { unique: false });
      }

      // 3. Legacy offline events store (backward compatibility)
      if (!db.objectStoreNames.contains(LEGACY_EVENTS_STORE)) {
        const store = db.createObjectStore(LEGACY_EVENTS_STORE, { keyPath: 'id' });
        store.createIndex('timestampMs', 'timestampMs', { unique: false });
        store.createIndex('syncStatus', 'syncStatus', { unique: false });
        store.createIndex('detectedOffline', 'detectedOffline', { unique: false });
      }

      // 4. Applied solutions store
      if (!db.objectStoreNames.contains(SOLUTIONS_STORE)) {
        const solStore = db.createObjectStore(SOLUTIONS_STORE, { keyPath: 'solutionId' });
        solStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        solStore.createIndex('status', 'status', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// ================= TELEMETRY READINGS STORE =================

export async function saveSensorReading(reading: SensorReading): Promise<void> {
  // Update localStorage backup
  const backup = getLocalStorage<SensorReading>(TELEMETRY_BACKUP_KEY);
  const existingIdx = backup.findIndex((r) => r.readingId === reading.readingId);
  if (existingIdx >= 0) {
    backup[existingIdx] = reading;
  } else {
    backup.unshift(reading);
  }
  saveLocalStorage(TELEMETRY_BACKUP_KEY, backup);

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([TELEMETRY_STORE], 'readwrite');
      const store = tx.objectStore(TELEMETRY_STORE);
      const req = store.put(reading);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[EcoTwin IndexedDB] Falling back to localStorage for reading save:', err);
  }
}

export async function getAllSensorReadings(limit: number = 100): Promise<SensorReading[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([TELEMETRY_STORE], 'readonly');
      const store = tx.objectStore(TELEMETRY_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = (req.result as SensorReading[]) || [];
        results.sort((a, b) => b.timestampMs - a.timestampMs);
        resolve(results.slice(0, limit));
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    const backup = getLocalStorage<SensorReading>(TELEMETRY_BACKUP_KEY);
    backup.sort((a, b) => b.timestampMs - a.timestampMs);
    return backup.slice(0, limit);
  }
}

export async function getPendingSensorReadings(): Promise<SensorReading[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([TELEMETRY_STORE], 'readonly');
      const store = tx.objectStore(TELEMETRY_STORE);
      const index = store.index('syncStatus');
      const req = index.getAll('pending');

      req.onsuccess = () => {
        const results = (req.result as SensorReading[]) || [];
        results.sort((a, b) => a.timestampMs - b.timestampMs); // Oldest first for sequential sync
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    const backup = getLocalStorage<SensorReading>(TELEMETRY_BACKUP_KEY);
    return backup.filter((r) => r.syncStatus === 'pending');
  }
}

export async function updateSensorReadingSyncStatus(
  readingId: string,
  status: SyncStatus,
  syncedAt?: string,
  error?: string
): Promise<void> {
  const backup = getLocalStorage<SensorReading>(TELEMETRY_BACKUP_KEY);
  const item = backup.find((r) => r.readingId === readingId);
  if (item) {
    item.syncStatus = status;
    if (syncedAt) item.syncedAt = syncedAt;
    if (error) item.error = error;
    saveLocalStorage(TELEMETRY_BACKUP_KEY, backup);
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([TELEMETRY_STORE], 'readwrite');
      const store = tx.objectStore(TELEMETRY_STORE);
      const getReq = store.get(readingId);

      getReq.onsuccess = () => {
        const data = getReq.result as SensorReading | undefined;
        if (data) {
          data.syncStatus = status;
          if (syncedAt) data.syncedAt = syncedAt;
          if (error) data.error = error;
          const putReq = store.put(data);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.warn('[EcoTwin IndexedDB] Error updating sensor reading sync status:', err);
  }
}

export async function markSensorReadingsBatchAsSynced(
  readingIds: string[],
  syncedAt: string
): Promise<void> {
  for (const id of readingIds) {
    await updateSensorReadingSyncStatus(id, 'synced', syncedAt);
  }
}

// ================= ANOMALY EVENTS STORE =================

export async function saveAnomalyEvent(anomaly: AnomalyEvent): Promise<void> {
  // Update backup
  const backup = getLocalStorage<AnomalyEvent>(ANOMALY_BACKUP_KEY);
  const existingIdx = backup.findIndex((a) => a.anomalyId === anomaly.anomalyId);
  if (existingIdx >= 0) {
    backup[existingIdx] = anomaly;
  } else {
    backup.unshift(anomaly);
  }
  saveLocalStorage(ANOMALY_BACKUP_KEY, backup);

  // Also save to legacy store for backward compatibility
  const legacyItem: OfflineEvent = {
    ...anomaly,
    id: anomaly.anomalyId,
    floorName: anomaly.floorName ?? `Floor ${anomaly.floor}`,
    actualConsumption: anomaly.actualValue,
    expectedBaseline: anomaly.baselineValue,
  };
  await saveOfflineEvent(legacyItem);

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([ANOMALY_STORE], 'readwrite');
      const store = tx.objectStore(ANOMALY_STORE);
      const req = store.put(anomaly);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[EcoTwin IndexedDB] Error saving anomaly:', err);
  }
}

export async function getAllAnomalyEvents(): Promise<AnomalyEvent[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([ANOMALY_STORE], 'readonly');
      const store = tx.objectStore(ANOMALY_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = (req.result as AnomalyEvent[]) || [];
        results.sort((a, b) => b.timestampMs - a.timestampMs);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    const backup = getLocalStorage<AnomalyEvent>(ANOMALY_BACKUP_KEY);
    backup.sort((a, b) => b.timestampMs - a.timestampMs);
    return backup;
  }
}

export async function getPendingAnomalyEvents(): Promise<AnomalyEvent[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([ANOMALY_STORE], 'readonly');
      const store = tx.objectStore(ANOMALY_STORE);
      const index = store.index('syncStatus');
      const req = index.getAll('pending');

      req.onsuccess = () => {
        const results = (req.result as AnomalyEvent[]) || [];
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    const backup = getLocalStorage<AnomalyEvent>(ANOMALY_BACKUP_KEY);
    return backup.filter((a) => a.syncStatus === 'pending');
  }
}

export async function updateAnomalySyncStatus(
  anomalyId: string,
  status: SyncStatus,
  syncedAt?: string
): Promise<void> {
  const backup = getLocalStorage<AnomalyEvent>(ANOMALY_BACKUP_KEY);
  const item = backup.find((a) => a.anomalyId === anomalyId);
  if (item) {
    item.syncStatus = status;
    if (syncedAt) item.syncedAt = syncedAt;
    saveLocalStorage(ANOMALY_BACKUP_KEY, backup);
  }

  // Also update legacy store
  await updateEventSyncStatus(anomalyId, status, syncedAt);

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([ANOMALY_STORE], 'readwrite');
      const store = tx.objectStore(ANOMALY_STORE);
      const getReq = store.get(anomalyId);

      getReq.onsuccess = () => {
        const data = getReq.result as AnomalyEvent | undefined;
        if (data) {
          data.syncStatus = status;
          if (syncedAt) data.syncedAt = syncedAt;
          const putReq = store.put(data);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.warn('[EcoTwin IndexedDB] Error updating anomaly status:', err);
  }
}

// ================= LEGACY OFFLINE EVENTS (Compatibility) =================

export async function saveOfflineEvent(event: OfflineEvent): Promise<void> {
  const backup = getLocalStorage<OfflineEvent>(LEGACY_BACKUP_KEY);
  const existingIndex = backup.findIndex((e) => e.id === event.id);
  if (existingIndex >= 0) {
    backup[existingIndex] = event;
  } else {
    backup.unshift(event);
  }
  saveLocalStorage(LEGACY_BACKUP_KEY, backup);

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([LEGACY_EVENTS_STORE], 'readwrite');
      const store = tx.objectStore(LEGACY_EVENTS_STORE);
      const req = store.put(event);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[EcoTwin IndexedDB] Falling back to localStorage for event save:', err);
  }
}

export async function getAllOfflineEvents(): Promise<OfflineEvent[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([LEGACY_EVENTS_STORE], 'readonly');
      const store = tx.objectStore(LEGACY_EVENTS_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = (req.result as OfflineEvent[]) || [];
        results.sort((a, b) => b.timestampMs - a.timestampMs);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    const backup = getLocalStorage<OfflineEvent>(LEGACY_BACKUP_KEY);
    backup.sort((a, b) => b.timestampMs - a.timestampMs);
    return backup;
  }
}

export async function getPendingOfflineEvents(): Promise<OfflineEvent[]> {
  const all = await getAllOfflineEvents();
  return all.filter((e) => e.syncStatus === 'pending');
}

export async function updateEventSyncStatus(
  id: string,
  status: SyncStatus,
  syncedAt?: string
): Promise<void> {
  const backup = getLocalStorage<OfflineEvent>(LEGACY_BACKUP_KEY);
  const item = backup.find((e) => e.id === id);
  if (item) {
    item.syncStatus = status;
    if (syncedAt) item.syncedAt = syncedAt;
    saveLocalStorage(LEGACY_BACKUP_KEY, backup);
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([LEGACY_EVENTS_STORE], 'readwrite');
      const store = tx.objectStore(LEGACY_EVENTS_STORE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result as OfflineEvent | undefined;
        if (data) {
          data.syncStatus = status;
          if (syncedAt) data.syncedAt = syncedAt;
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (err) {
    console.warn('[EcoTwin IndexedDB] Error updating status:', err);
  }
}

export async function markBatchAsSynced(ids: string[], syncedAt: string): Promise<void> {
  for (const id of ids) {
    await updateEventSyncStatus(id, 'synced', syncedAt);
    await updateAnomalySyncStatus(id, 'synced', syncedAt);
  }
}

export async function enrichEventWithAi(id: string, aiAnalysis: string): Promise<void> {
  const backup = getLocalStorage<OfflineEvent>(LEGACY_BACKUP_KEY);
  const item = backup.find((e) => e.id === id);
  if (item) {
    item.aiEnriched = true;
    item.aiAnalysis = aiAnalysis;
    saveLocalStorage(LEGACY_BACKUP_KEY, backup);
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([LEGACY_EVENTS_STORE], 'readwrite');
      const store = tx.objectStore(LEGACY_EVENTS_STORE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result as OfflineEvent | undefined;
        if (data) {
          data.aiEnriched = true;
          data.aiAnalysis = aiAnalysis;
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (err) {
    console.warn('[EcoTwin IndexedDB] Error enriching event with AI:', err);
  }
}

export async function clearAllOfflineEvents(): Promise<void> {
  saveLocalStorage(LEGACY_BACKUP_KEY, []);
  saveLocalStorage(ANOMALY_BACKUP_KEY, []);
  saveLocalStorage(TELEMETRY_BACKUP_KEY, []);
  try {
    const db = await openDatabase();
    const stores = [TELEMETRY_STORE, ANOMALY_STORE, LEGACY_EVENTS_STORE];
    for (const s of stores) {
      if (db.objectStoreNames.contains(s)) {
        const tx = db.transaction([s], 'readwrite');
        tx.objectStore(s).clear();
      }
    }
  } catch (err) {
    console.warn('[EcoTwin IndexedDB] Clear error:', err);
  }
}

// ================= APPLIED SOLUTIONS STORE =================

export async function saveAppliedSolutionOffline(solution: AppliedSolutionRecord): Promise<void> {
  const backup = getLocalStorage<AppliedSolutionRecord>(SOLUTIONS_BACKUP_KEY);
  const idx = backup.findIndex((s) => s.solutionId === solution.solutionId);
  if (idx >= 0) {
    backup[idx] = solution;
  } else {
    backup.unshift(solution);
  }
  saveLocalStorage(SOLUTIONS_BACKUP_KEY, backup);

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([SOLUTIONS_STORE], 'readwrite');
      const store = tx.objectStore(SOLUTIONS_STORE);
      const req = store.put(solution);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[EcoTwin IndexedDB] Error saving solution:', err);
  }
}

export async function getAllOfflineAppliedSolutions(): Promise<AppliedSolutionRecord[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([SOLUTIONS_STORE], 'readonly');
      const store = tx.objectStore(SOLUTIONS_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = (req.result as AppliedSolutionRecord[]) || [];
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return getLocalStorage<AppliedSolutionRecord>(SOLUTIONS_BACKUP_KEY);
  }
}

export async function getPendingAppliedSolutions(): Promise<AppliedSolutionRecord[]> {
  const all = await getAllOfflineAppliedSolutions();
  return all.filter((s) => s.syncStatus === 'pending');
}

export async function updateSolutionSyncStatus(
  solutionId: string,
  syncStatus: 'synced' | 'pending',
  syncedAt?: string
): Promise<void> {
  const backup = getLocalStorage<AppliedSolutionRecord>(SOLUTIONS_BACKUP_KEY);
  const item = backup.find((s) => s.solutionId === solutionId);
  if (item) {
    item.syncStatus = syncStatus;
    if (syncedAt) item.syncedAt = syncedAt;
    saveLocalStorage(SOLUTIONS_BACKUP_KEY, backup);
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([SOLUTIONS_STORE], 'readwrite');
      const store = tx.objectStore(SOLUTIONS_STORE);
      const getReq = store.get(solutionId);
      getReq.onsuccess = () => {
        const sol = getReq.result as AppliedSolutionRecord | undefined;
        if (sol) {
          sol.syncStatus = syncStatus;
          if (syncedAt) sol.syncedAt = syncedAt;
          const putReq = store.put(sol);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.warn('[EcoTwin IndexedDB] Error updating solution status:', err);
  }
}
