import { 
  SensorReading, 
  AnomalyEvent, 
  FloorBaseline 
} from '../types/offline';

export const DEFAULT_THRESHOLDS = {
  anomalyDeviation: 15, // >15% is an anomaly
  highSeverityDeviation: 25, // >25% is high severity
};

export const SENSOR_BASELINES: Record<string, { baseline: number; unit: string; name: string }> = {
  'ELEC_F0_MAIN': { baseline: 140, unit: 'kWh', name: 'Ground Main Meter' },
  'ELEC_F1_LABS': { baseline: 95, unit: 'kWh', name: 'Floor 1 Labs & Servers' },
  'ELEC_F2_07': { baseline: 120, unit: 'kWh', name: 'Floor 2 HVAC & Classrooms' },
  'ELEC_F3_OFFICE': { baseline: 85, unit: 'kWh', name: 'Floor 3 Faculty Offices' },
  'ELEC_F4_INNOV': { baseline: 105, unit: 'kWh', name: 'Floor 4 Innovation Hub' },
  'WATER_F0_MAIN': { baseline: 240, unit: 'L/h', name: 'Ground Cafeteria Supply' },
  'WATER_F1_REST': { baseline: 110, unit: 'L/h', name: 'Floor 1 Restrooms' },
  'WATER_F2_LABS': { baseline: 140, unit: 'L/h', name: 'Floor 2 Water Line' },
  'WATER_F3_PANTRY': { baseline: 90, unit: 'L/h', name: 'Floor 3 Pantry' },
  'WATER_F4_03': { baseline: 130, unit: 'L/h', name: 'Floor 4 Restroom Supply' },
  'TEMP_F2_01': { baseline: 22.5, unit: '°C', name: 'Floor 2 Ambient Temp' },
  'HVAC_F2_COMP': { baseline: 45, unit: 'kW', name: 'Floor 2 Chiller Compressor' },
  'OCC_F2_ZONE': { baseline: 0, unit: 'people', name: 'Floor 2 Motion / Occupancy' },
};

export const FLOOR_CONFIGS: FloorBaseline[] = [
  { floor: 0, floorName: 'Ground Floor', electricityBaselineKwh: 140, waterBaselineLitersPerHour: 240, zoneName: 'Central Cafeteria' },
  { floor: 1, floorName: 'Floor 1', electricityBaselineKwh: 95, waterBaselineLitersPerHour: 110, zoneName: 'Server Room & Labs' },
  { floor: 2, floorName: 'Floor 2', electricityBaselineKwh: 120, waterBaselineLitersPerHour: 140, zoneName: 'Classrooms & Primary HVAC' },
  { floor: 3, floorName: 'Floor 3', electricityBaselineKwh: 85, waterBaselineLitersPerHour: 90, zoneName: 'Offices & Seminar Hall' },
  { floor: 4, floorName: 'Floor 4', electricityBaselineKwh: 105, waterBaselineLitersPerHour: 130, zoneName: 'Innovation Hub & Restrooms' },
];

/**
 * Deterministic local fallback analysis text when operating offline.
 * Clearly labeled as LOCAL FALLBACK ANALYSIS.
 */
export function getLocalFallbackAnalysisText(
  floor: number,
  resourceType: 'electricity' | 'water',
  deviationPct: number,
  actual: number,
  baseline: number,
  unit: string
): string {
  const rounded = Math.round(deviationPct);
  if (resourceType === 'electricity') {
    if (rounded >= 25) {
      return `LOCAL FALLBACK ANALYSIS: Floor ${floor} electricity consumption is ${rounded}% above normal baseline (${actual} ${unit} vs ${baseline} ${unit} expected). High deviation detected during low-occupancy hours. Likely cause: Unscheduled HVAC or chiller cycle running without occupants.`;
    }
    return `LOCAL FALLBACK ANALYSIS: Floor ${floor} electricity draw is ${rounded}% above normal baseline (${actual} ${unit} vs ${baseline} ${unit}). Exceeded local threshold (>15%). Unmonitored auxiliary equipment or lighting left active.`;
  } else {
    if (rounded >= 25) {
      return `LOCAL FALLBACK ANALYSIS: Floor ${floor} water flow rate is ${rounded}% above normal baseline (${actual} ${unit} vs ${baseline} ${unit} expected). Continuous flow detected, indicating sustained plumbing rupture or jammed auto-flush valve.`;
    }
    return `LOCAL FALLBACK ANALYSIS: Floor ${floor} water flow is ${rounded}% above normal baseline (${actual} ${unit} vs ${baseline} ${unit}). Detected localized pipe seep or fixture leak.`;
  }
}

/**
 * Evaluates a sensor reading locally against configured baselines.
 * Returns AnomalyEvent if thresholds exceeded.
 * Works 100% locally with zero network dependency.
 */
export function detectLocalAnomaly(
  reading: SensorReading,
  thresholds = DEFAULT_THRESHOLDS
): AnomalyEvent | null {
  // Only evaluate resource types that track energy and water consumption anomalies
  if (reading.resourceType !== 'electricity' && reading.resourceType !== 'water') {
    return null;
  }

  const floorConfig = FLOOR_CONFIGS.find((f) => f.floor === reading.floor) || FLOOR_CONFIGS[2];
  const baseline =
    reading.resourceType === 'electricity'
      ? floorConfig.electricityBaselineKwh
      : floorConfig.waterBaselineLitersPerHour;

  if (baseline <= 0) return null;

  // Formula: deviationPercentage = ((actual - baseline) / baseline) * 100
  const deviation = ((reading.value - baseline) / baseline) * 100;
  const deviationPercentage = Math.round(deviation * 10) / 10;

  if (deviationPercentage > thresholds.anomalyDeviation) {
    const severity: 'medium' | 'high' =
      deviationPercentage > thresholds.highSeverityDeviation ? 'high' : 'medium';

    const now = new Date();
    const anomalyId = `anom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const localAnalysis = getLocalFallbackAnalysisText(
      reading.floor,
      reading.resourceType,
      deviationPercentage,
      reading.value,
      baseline,
      reading.unit
    );

    return {
      anomalyId,
      readingId: reading.readingId,
      resourceType: reading.resourceType,
      building: reading.buildingId,
      floor: reading.floor,
      floorName: floorConfig.floorName,
      actualValue: reading.value,
      baselineValue: baseline,
      deviationPercentage,
      severity,
      timestamp: reading.timestamp,
      timestampMs: reading.timestampMs || now.getTime(),
      detectedOffline: reading.networkStatus === 'offline',
      syncStatus: reading.syncStatus,
      unit: reading.unit,
      zoneName: floorConfig.zoneName,
      localAnalysis,
      syncedAt: null,
    };
  }

  return null;
}
