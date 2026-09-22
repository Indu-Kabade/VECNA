import {
  getPendingSensorReadings,
  updateSensorReadingSyncStatus,
  getPendingAnomalyEvents,
  updateAnomalySyncStatus,
} from './indexedDbService';
import {
  uploadTelemetryReadingToFirestore,
  uploadAnomalyToFirestore,
} from './firestoreTelemetry';
import { syncPendingSolutionsToFirestore } from './solutionsService';
import { SyncProgress } from '../types/offline';

export interface ResyncResult {
  readingsTotal: number;
  readingsSynced: number;
  readingsFailed: number;
  anomaliesTotal: number;
  anomaliesSynced: number;
  anomaliesFailed: number;
  solutionsSynced: number;
  durationMs: number;
  syncTimestamp: string;
}

let isSyncInProgress = false;

/**
 * Executes automatic resynchronization of all buffered readings and anomaly events.
 * Provides granular progress updates via callback.
 * Keeps failed records in queue with retry status.
 */
export async function runTelemetryResync(
  onProgress?: (progress: SyncProgress) => void
): Promise<ResyncResult> {
  if (isSyncInProgress) {
    console.log('[EcoTwin Sync] Synchronization already in progress, skipping duplicate call.');
    return {
      readingsTotal: 0,
      readingsSynced: 0,
      readingsFailed: 0,
      anomaliesTotal: 0,
      anomaliesSynced: 0,
      anomaliesFailed: 0,
      solutionsSynced: 0,
      durationMs: 0,
      syncTimestamp: new Date().toLocaleTimeString(),
    };
  }

  isSyncInProgress = true;
  const startTime = Date.now();
  const syncTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    // 1. Sync any pending applied solutions first
    let solutionsSynced = 0;
    try {
      const solResults = await syncPendingSolutionsToFirestore();
      solutionsSynced = solResults.syncedCount;
    } catch (err) {
      console.warn('[EcoTwin Sync] Warning syncing solutions to Firestore:', err);
    }

    // 2. Fetch pending readings from IndexedDB
    const pendingReadings = await getPendingSensorReadings();
    const pendingAnomalies = await getPendingAnomalyEvents();

    const totalItems = pendingReadings.length + pendingAnomalies.length;

    if (totalItems === 0) {
      onProgress?.({
        total: 0,
        synced: 0,
        failed: 0,
        status: 'completed',
        message: 'All sensor data is up to date.',
      });
      isSyncInProgress = false;
      return {
        readingsTotal: 0,
        readingsSynced: 0,
        readingsFailed: 0,
        anomaliesTotal: 0,
        anomaliesSynced: 0,
        anomaliesFailed: 0,
        solutionsSynced,
        durationMs: Date.now() - startTime,
        syncTimestamp,
      };
    }

    onProgress?.({
      total: totalItems,
      synced: 0,
      failed: 0,
      status: 'syncing',
      message: `Syncing local sensor data (0 / ${totalItems})...`,
    });

    let readingsSynced = 0;
    let readingsFailed = 0;

    // 3. Process telemetry readings sequentially or in micro-batches
    for (let i = 0; i < pendingReadings.length; i++) {
      const reading = pendingReadings[i];
      
      // Mark as syncing in local DB
      await updateSensorReadingSyncStatus(reading.readingId, 'syncing');

      const uploadResult = await uploadTelemetryReadingToFirestore(reading);

      if (uploadResult.success) {
        readingsSynced++;
        await updateSensorReadingSyncStatus(reading.readingId, 'synced', syncTimestamp);
      } else {
        readingsFailed++;
        // Keep failed records for retry with controlled backoff
        await updateSensorReadingSyncStatus(reading.readingId, 'failed', undefined, uploadResult.error);
      }

      const currentTotal = readingsSynced + readingsFailed;
      onProgress?.({
        total: totalItems,
        synced: readingsSynced,
        failed: readingsFailed,
        status: 'syncing',
        message: `Syncing local sensor data... ${currentTotal} / ${totalItems} processed`,
      });

      // Micro-pause every 5 items to give browser rendering room and simulate realistic network transmission
      if (i % 5 === 0 && i > 0) {
        await new Promise((r) => setTimeout(r, 60));
      }
    }

    // 4. Process anomaly events
    let anomaliesSynced = 0;
    let anomaliesFailed = 0;

    for (const anomaly of pendingAnomalies) {
      await updateAnomalySyncStatus(anomaly.anomalyId, 'syncing');
      const uploadResult = await uploadAnomalyToFirestore(anomaly);

      if (uploadResult.success) {
        anomaliesSynced++;
        await updateAnomalySyncStatus(anomaly.anomalyId, 'synced', syncTimestamp);
      } else {
        anomaliesFailed++;
        await updateAnomalySyncStatus(anomaly.anomalyId, 'failed');
      }

      onProgress?.({
        total: totalItems,
        synced: readingsSynced + anomaliesSynced,
        failed: readingsFailed + anomaliesFailed,
        status: 'syncing',
        message: `Synchronizing offline anomaly records...`,
      });
    }

    const totalSynced = readingsSynced + anomaliesSynced;
    const totalFailed = readingsFailed + anomaliesFailed;

    onProgress?.({
      total: totalItems,
      synced: totalSynced,
      failed: totalFailed,
      status: totalFailed > 0 ? 'error' : 'completed',
      message:
        totalFailed > 0
          ? `✓ ${totalSynced} items synchronized (${totalFailed} failed - will retry)`
          : `✓ ${totalSynced} items synchronized. All sensor data is up to date.`,
    });

    return {
      readingsTotal: pendingReadings.length,
      readingsSynced,
      readingsFailed,
      anomaliesTotal: pendingAnomalies.length,
      anomaliesSynced,
      anomaliesFailed,
      solutionsSynced,
      durationMs: Date.now() - startTime,
      syncTimestamp,
    };
  } finally {
    isSyncInProgress = false;
  }
}
