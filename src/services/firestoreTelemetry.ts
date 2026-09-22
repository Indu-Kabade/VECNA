import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { SensorReading, AnomalyEvent } from '../types/offline';

/**
 * Uploads a single sensor reading to Firestore collection `telemetry/{readingId}`.
 * Idempotent: checks for existence by readingId to avoid duplicate records.
 */
export async function uploadTelemetryReadingToFirestore(reading: SensorReading): Promise<{ success: boolean; isDuplicate: boolean; error?: string }> {
  try {
    const readingRef = doc(db, 'telemetry', reading.readingId);
    
    // Check whether reading already exists to guarantee idempotency
    const existingSnap = await getDoc(readingRef);
    if (existingSnap.exists()) {
      return { success: true, isDuplicate: true };
    }

    const payload = {
      readingId: reading.readingId,
      sensorId: reading.sensorId,
      buildingId: reading.buildingId,
      floor: reading.floor,
      resourceType: reading.resourceType,
      value: reading.value,
      unit: reading.unit,
      timestamp: reading.timestamp,
      syncStatus: 'synced',
      createdAt: new Date().toISOString(),
    };

    await setDoc(readingRef, payload);
    return { success: true, isDuplicate: false };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[EcoTwin Firestore] Failed to upload telemetry reading ${reading.readingId}:`, errMsg);
    return { success: false, isDuplicate: false, error: errMsg };
  }
}

/**
 * Uploads an anomaly event to Firestore collection `anomalies/{anomalyId}`.
 * Idempotent: checks for existence by anomalyId.
 */
export async function uploadAnomalyToFirestore(anomaly: AnomalyEvent): Promise<{ success: boolean; isDuplicate: boolean; error?: string }> {
  try {
    const anomalyRef = doc(db, 'anomalies', anomaly.anomalyId);
    
    const existingSnap = await getDoc(anomalyRef);
    if (existingSnap.exists()) {
      return { success: true, isDuplicate: true };
    }

    const payload = {
      anomalyId: anomaly.anomalyId,
      readingId: anomaly.readingId,
      resourceType: anomaly.resourceType,
      building: anomaly.building,
      floor: anomaly.floor,
      actualValue: anomaly.actualValue,
      baselineValue: anomaly.baselineValue,
      deviationPercentage: anomaly.deviationPercentage,
      severity: anomaly.severity,
      timestamp: anomaly.timestamp,
      detectedOffline: anomaly.detectedOffline,
      syncStatus: 'synced',
      syncedAt: new Date().toISOString(),
    };

    await setDoc(anomalyRef, payload);
    return { success: true, isDuplicate: false };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[EcoTwin Firestore] Failed to upload anomaly ${anomaly.anomalyId}:`, errMsg);
    return { success: false, isDuplicate: false, error: errMsg };
  }
}
