import { OfflineEvent, TelemetryReading, FloorBaseline, AnomalySeverity } from '../types/offline';

export const FLOOR_BASELINES: FloorBaseline[] = [
  {
    floor: 0,
    floorName: 'Ground Floor',
    electricityBaselineKwh: 140,
    waterBaselineLitersPerHour: 240,
    zoneName: 'Central Cafeteria & Ground Systems',
  },
  {
    floor: 1,
    floorName: 'Floor 1',
    electricityBaselineKwh: 95,
    waterBaselineLitersPerHour: 110,
    zoneName: 'Server Room & Labs',
  },
  {
    floor: 2,
    floorName: 'Floor 2',
    electricityBaselineKwh: 120, // Baseline matched to requirement!
    waterBaselineLitersPerHour: 140,
    zoneName: 'Floor 2 HVAC & Classrooms',
  },
  {
    floor: 3,
    floorName: 'Floor 3',
    electricityBaselineKwh: 85,
    waterBaselineLitersPerHour: 90,
    zoneName: 'Faculty Offices & Seminar Hall',
  },
  {
    floor: 4,
    floorName: 'Floor 4',
    electricityBaselineKwh: 105,
    waterBaselineLitersPerHour: 130, // Baseline matched to requirement!
    zoneName: 'Innovation Hub & Restrooms',
  },
];

/**
 * Deterministic local fallback analysis generator.
 * Does not make any external network requests or pretend to be cloud AI.
 */
export function generateLocalFallbackAnalysis(
  floorName: string,
  resourceType: 'electricity' | 'water',
  deviationPct: number,
  actualValue: number,
  baselineValue: number,
  unit: string
): string {
  const roundedDeviation = Math.round(deviationPct);
  
  if (resourceType === 'electricity') {
    if (roundedDeviation >= 25) {
      return `${floorName} electricity consumption is ${roundedDeviation}% above its normal baseline (${actualValue} ${unit} vs ${baselineValue} ${unit} expected). The increase occurred during the building's low-occupancy period. This suggests unnecessary HVAC or equipment runtime.`;
    }
    return `${floorName} electricity draw is ${roundedDeviation}% above normal baseline. Local threshold exceeded (>15%). Operating pattern deviates from historical baseline, likely due to un-scheduled lighting or ancillary ventilation.`;
  } else {
    if (roundedDeviation >= 25) {
      return `${floorName} water consumption is ${roundedDeviation}% above its normal baseline (${actualValue} ${unit} vs ${baselineValue} ${unit} expected). Sustained continuous flow detected during minimal fixture use, indicating a major plumbing leak or jammed flush valve.`;
    }
    return `${floorName} water flow is ${roundedDeviation}% above normal baseline (${actualValue} ${unit} vs ${baselineValue} ${unit} expected). Flow sensor metrics point to a persistent valve leak or dripping fixture.`;
  }
}

/**
 * Local Anomaly Detection Algorithm.
 * Evaluates telemetry reading against local baseline.
 * Rule:
 * - If deviation > 15% above baseline: create anomaly
 * - If deviation > 25% above baseline: classify as 'high' severity, otherwise 'medium'
 * Purely local - zero network requests.
 */
export function evaluateLocalAnomaly(
  floor: number,
  resourceType: 'electricity' | 'water',
  actualValue: number,
  buildingName: string = 'MSRIT Smart Building'
): {
  isAnomaly: boolean;
  severity?: AnomalySeverity;
  deviationPercentage: number;
  expectedBaseline: number;
  floorName: string;
  unit: string;
  offlineEvent?: OfflineEvent;
} {
  const baselineConfig = FLOOR_BASELINES.find((b) => b.floor === floor) || FLOOR_BASELINES[2];
  const expectedBaseline =
    resourceType === 'electricity'
      ? baselineConfig.electricityBaselineKwh
      : baselineConfig.waterBaselineLitersPerHour;

  const unit = resourceType === 'electricity' ? 'kWh' : 'L/h';

  // Calculate percentage deviation from the normal baseline
  const deviation = ((actualValue - expectedBaseline) / expectedBaseline) * 100;
  const deviationPercentage = Math.round(deviation * 10) / 10;

  // Algorithm threshold check
  if (deviationPercentage > 15) {
    const severity: AnomalySeverity = deviationPercentage > 25 ? 'high' : 'medium';
    const now = new Date();
    const eventId = `evt-offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const localAnalysis = generateLocalFallbackAnalysis(
      baselineConfig.floorName,
      resourceType,
      deviationPercentage,
      actualValue,
      expectedBaseline,
      unit
    );

    const offlineEvent: OfflineEvent = {
      id: eventId,
      anomalyId: eventId,
      readingId: `reading_${eventId}`,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestampMs: now.getTime(),
      building: buildingName,
      floor,
      floorName: baselineConfig.floorName,
      resourceType,
      actualConsumption: actualValue,
      expectedBaseline,
      actualValue,
      baselineValue: expectedBaseline,
      deviationPercentage,
      severity,
      detectedOffline: true,
      syncStatus: 'pending',
      unit,
      zoneName: baselineConfig.zoneName,
      localAnalysis,
      syncedAt: null,
    };

    return {
      isAnomaly: true,
      severity,
      deviationPercentage,
      expectedBaseline,
      floorName: baselineConfig.floorName,
      unit,
      offlineEvent,
    };
  }

  return {
    isAnomaly: false,
    deviationPercentage,
    expectedBaseline,
    floorName: baselineConfig.floorName,
    unit,
  };
}

/**
 * Generate a simulated reading for continuous background telemetry
 */
export function generateSimulatedReading(
  forceAbnormal: boolean = false,
  presetResource?: 'electricity' | 'water',
  presetFloor?: number,
  presetDeviation?: number
): TelemetryReading {
  const floor = presetFloor !== undefined ? presetFloor : Math.floor(Math.random() * FLOOR_BASELINES.length);
  const baselineConfig = FLOOR_BASELINES.find((b) => b.floor === floor) || FLOOR_BASELINES[2];
  const resourceType = presetResource || (Math.random() > 0.4 ? 'electricity' : 'water');
  const baseline =
    resourceType === 'electricity'
      ? baselineConfig.electricityBaselineKwh
      : baselineConfig.waterBaselineLitersPerHour;

  const unit = resourceType === 'electricity' ? 'kWh' : 'L/h';

  let deviationPct: number;
  if (forceAbnormal) {
    // Pick or apply a prominent anomaly (e.g., +27% for Floor 2 electricity, +19% for Floor 4 water, etc.)
    if (presetDeviation !== undefined) {
      deviationPct = presetDeviation;
    } else if (floor === 2 && resourceType === 'electricity') {
      deviationPct = 27.2; // Exact requirement 1: Floor 2 electricity +27%
    } else if (floor === 4 && resourceType === 'water') {
      deviationPct = 19.4; // Exact requirement 2: Floor 4 water +19%
    } else {
      deviationPct = Math.floor(Math.random() * 15) + 18; // 18% to 32%
    }
  } else {
    // Normal fluctuation between -6% and +10%
    deviationPct = (Math.random() * 16 - 6);
  }

  const actual = Math.round(baseline * (1 + deviationPct / 100));
  const roundedDeviation = Math.round(deviationPct * 10) / 10;
  const isAbnormal = roundedDeviation > 15;
  const severity: AnomalySeverity | undefined = isAbnormal ? (roundedDeviation > 25 ? 'high' : 'medium') : undefined;

  const now = new Date();

  return {
    id: `tel-${now.getTime()}-${Math.random().toString(36).substring(2, 6)}`,
    readingId: `reading_${now.getTime()}_${Math.random().toString(36).substring(2, 6)}`,
    sensorId: resourceType === 'electricity' ? `ELEC_F${floor}_01` : `WATER_F${floor}_01`,
    buildingId: 'tower_b',
    building: 'MSRIT Smart Building',
    floor,
    floorName: baselineConfig.floorName,
    resourceType,
    value: actual,
    actualValue: actual,
    baselineValue: baseline,
    unit,
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timestampMs: now.getTime(),
    networkStatus: 'online',
    syncStatus: 'synced',
    deviationPercentage: roundedDeviation,
    isAbnormal,
    severity,
    zoneName: baselineConfig.zoneName,
  };
}
