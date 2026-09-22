import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { AppliedSolutionRecord } from '../types';
import { 
  saveAppliedSolutionOffline, 
  getAllOfflineAppliedSolutions, 
  getPendingAppliedSolutions, 
  updateSolutionSyncStatus 
} from './indexedDbService';

const COLLECTION_NAME = 'solutions';

export function formatSolutionDate(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleString('en-GB', options);
}

export function generateSolutionId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `sol-${ts}-${rand}`;
}

/**
 * Creates and permanently persists a new applied solution.
 * Handles both online (Firestore + cache) and offline (IndexedDB pending queue).
 */
export async function applySolution(
  params: {
    buildingId?: string;
    floor: string;
    problemId?: string;
    resourceType: 'electricity' | 'water';
    solutionName: string;
    solutionDescription: string;
    problemDescription: string;
    estimatedSavingsKwh: number;
    estimatedSavingsRupees: number;
    appliedBy?: string;
  },
  isOnline: boolean
): Promise<AppliedSolutionRecord> {
  const solutionId = generateSolutionId();
  const appliedAt = formatSolutionDate();

  const record: AppliedSolutionRecord = {
    id: solutionId,
    solutionId,
    buildingId: params.buildingId || 'academic-block-a',
    floor: params.floor,
    problemId: params.problemId || `prob-${params.resourceType}-${params.floor.toLowerCase().replace(/\s+/g, '-')}`,
    resourceType: params.resourceType,
    solutionName: params.solutionName,
    solutionDescription: params.solutionDescription,
    problemDescription: params.problemDescription,
    estimatedSavingsKwh: Math.round(params.estimatedSavingsKwh),
    estimatedSavingsRupees: Math.round(params.estimatedSavingsRupees),
    appliedAt,
    status: 'Active',
    appliedBy: params.appliedBy || 'VECNA Operator',
    syncStatus: isOnline ? 'synced' : 'pending',
    syncedAt: isOnline ? new Date().toISOString() : undefined,
  };

  if (isOnline) {
    try {
      const docRef = doc(db, COLLECTION_NAME, record.solutionId);
      await setDoc(docRef, record);
      // Also cache in local IndexedDB for instant offline retrieval
      await saveAppliedSolutionOffline({ ...record, syncStatus: 'synced' });
    } catch (error) {
      console.warn('Firestore write failed, falling back to offline IndexedDB store:', error);
      // Mark as pending in offline store
      record.syncStatus = 'pending';
      await saveAppliedSolutionOffline(record);
    }
  } else {
    // Completely offline: store in IndexedDB
    record.syncStatus = 'pending';
    await saveAppliedSolutionOffline(record);
  }

  return record;
}

/**
 * Retrieves applied solutions from Firestore, seamlessly merging any pending local offline records.
 */
export async function getAppliedSolutions(isOnline: boolean): Promise<AppliedSolutionRecord[]> {
  const offlineRecords = await getAllOfflineAppliedSolutions();
  const offlineMap = new Map<string, AppliedSolutionRecord>();
  offlineRecords.forEach((item) => offlineMap.set(item.solutionId, item));

  if (!isOnline) {
    // Return all local records sorted reverse-chronologically
    return Array.from(offlineMap.values()).sort((a, b) => {
      return (b.id || '').localeCompare(a.id || '');
    });
  }

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const firestoreRecords: AppliedSolutionRecord[] = [];

    snapshot.forEach((d) => {
      const data = d.data() as AppliedSolutionRecord;
      firestoreRecords.push({
        ...data,
        id: d.id,
        solutionId: data.solutionId || d.id,
        syncStatus: 'synced',
      });
      // Cache synced record to IndexedDB
      saveAppliedSolutionOffline({
        ...data,
        id: d.id,
        solutionId: data.solutionId || d.id,
        syncStatus: 'synced',
      }).catch(() => {});
    });

    // Merge any offline records that are still pending
    const combinedMap = new Map<string, AppliedSolutionRecord>();
    firestoreRecords.forEach((item) => combinedMap.set(item.solutionId, item));

    offlineRecords.forEach((item) => {
      if (item.syncStatus === 'pending' && !combinedMap.has(item.solutionId)) {
        combinedMap.set(item.solutionId, item);
      }
    });

    const combinedList = Array.from(combinedMap.values());
    combinedList.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
    return combinedList;
  } catch (error) {
    console.warn('Error fetching solutions from Firestore, returning local records:', error);
    return Array.from(offlineMap.values()).sort((a, b) => (b.id || '').localeCompare(a.id || ''));
  }
}

/**
 * Synchronizes pending offline solutions to Firestore.
 * Prevents duplicate records by using solutionId as document ID.
 */
export async function syncPendingSolutionsToFirestore(): Promise<{ syncedCount: number; errors: number }> {
  const pending = await getPendingAppliedSolutions();
  if (pending.length === 0) {
    return { syncedCount: 0, errors: 0 };
  }

  let syncedCount = 0;
  let errors = 0;

  for (const sol of pending) {
    try {
      const docRef = doc(db, COLLECTION_NAME, sol.solutionId);
      const syncedRecord: AppliedSolutionRecord = {
        ...sol,
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
      };
      await setDoc(docRef, syncedRecord);
      await updateSolutionSyncStatus(sol.solutionId, 'synced', syncedRecord.syncedAt);
      syncedCount++;
    } catch (err) {
      console.error(`Failed to sync solution ${sol.solutionId} to Firestore:`, err);
      errors++;
    }
  }

  return { syncedCount, errors };
}

/**
 * Real-time subscription to applied solutions.
 */
export function subscribeToAppliedSolutions(
  onUpdate: (solutions: AppliedSolutionRecord[]) => void
): () => void {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        const firestoreList: AppliedSolutionRecord[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as AppliedSolutionRecord;
          firestoreList.push({
            ...data,
            id: d.id,
            solutionId: data.solutionId || d.id,
            syncStatus: 'synced',
          });
        });

        // Merge any pending local solutions
        const pending = await getPendingAppliedSolutions();
        const map = new Map<string, AppliedSolutionRecord>();
        firestoreList.forEach((item) => map.set(item.solutionId, item));
        pending.forEach((item) => {
          if (!map.has(item.solutionId)) {
            map.set(item.solutionId, item);
          }
        });

        const merged = Array.from(map.values());
        merged.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        onUpdate(merged);
      },
      (error) => {
        console.warn('Real-time subscription error, using local data:', error);
        getAllOfflineAppliedSolutions().then((local) => {
          local.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
          onUpdate(local);
        });
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to initialize Firestore listener, fallback to local store:', err);
    getAllOfflineAppliedSolutions().then((local) => {
      local.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
      onUpdate(local);
    });
    return () => {};
  }
}

/**
 * Updates an applied solution's status (Active / Completed).
 */
export async function updateSolutionStatus(
  solutionId: string, 
  newStatus: 'Active' | 'Completed',
  isOnline: boolean
): Promise<void> {
  if (isOnline) {
    try {
      const docRef = doc(db, COLLECTION_NAME, solutionId);
      await updateDoc(docRef, { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION_NAME}/${solutionId}`);
    }
  }
  
  // Also update locally in IndexedDB
  const all = await getAllOfflineAppliedSolutions();
  const sol = all.find((s) => s.solutionId === solutionId);
  if (sol) {
    sol.status = newStatus;
    await saveAppliedSolutionOffline(sol);
  }
}
