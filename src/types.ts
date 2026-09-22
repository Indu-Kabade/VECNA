export type PageId = 
  | 'overview' 
  | 'twin' 
  | 'insights' 
  | 'diagnosis' 
  | 'recommendations' 
  | 'simulation' 
  | 'verification' 
  | 'report' 
  | 'how-it-works'
  | 'solution-history';

export interface AppliedSolutionRecord {
  id: string;
  solutionId: string;
  buildingId: string;
  floor: string;
  problemId: string;
  resourceType: 'electricity' | 'water';
  solutionName: string;
  solutionDescription: string;
  problemDescription: string;
  estimatedSavingsKwh: number;
  estimatedSavingsRupees: number;
  appliedAt: string;
  status: 'Active' | 'Completed';
  appliedBy: string;
  syncStatus: 'synced' | 'pending';
  syncedAt?: string;
}

export type ZoneStatus = 'normal' | 'watch' | 'anomaly';

export type ZoneCategory = 
  | 'HVAC' 
  | 'Lighting' 
  | 'Server Room' 
  | 'Restrooms' 
  | 'Kitchen' 
  | 'Classrooms' 
  | 'Common Areas';

export interface BuildingZone {
  id: string;
  name: string;
  floor: number;
  floorName: string;
  category: ZoneCategory;
  currentEnergy: number; // kWh
  expectedEnergy: number; // kWh
  energyDeviationPct: number; // %
  currentWater: number; // L
  expectedWater: number; // L
  waterDeviationPct: number; // %
  status: ZoneStatus;
  lastUpdated: string;
  anomalyId?: string;
  anomalyTitle?: string;
  anomalySummary?: string;
  confidence?: number;
  occupancyCount: number;
  areaSqFt: number;
}

export interface AnomalyItem {
  id: string;
  title: string;
  zoneId: string;
  zoneName: string;
  floor: number;
  detectedTime: string;
  resourceType: 'energy' | 'water';
  expectedValue: number;
  actualValue: number;
  unit: string;
  deviationPct: number;
  confidence: number;
  status: 'active' | 'investigating' | 'resolved';
  possibleCauses: string[];
  severity: 'critical' | 'moderate' | 'low';
  monthlyWasteEstimateINR: number;
}

export interface CauseNode {
  id: string;
  label: string;
  probability: number;
  description: string;
  children?: CauseNode[];
}

export interface EvidenceItem {
  name: string;
  metric: string;
  status: 'abnormal' | 'normal' | 'corroborating';
  description: string;
  source: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  category: ZoneCategory;
  anomalyId: string;
  currentConfig: string;
  recommendedConfig: string;
  energySavingsMonthlyKwh: number;
  waterSavingsMonthlyLiters: number;
  costSavingsMonthlyINR: number;
  co2ReductionMonthlyKg: number;
  confidence: number;
  difficulty: 'Low' | 'Medium' | 'High';
  paybackPeriodDays: number;
  problem: string;
  evidence: string;
  intervention: string;
  expectedImpact: string;
  whyDetails: string[];
}

export interface SimulationState {
  interventionId: string;
  operatingStartHour: number; // e.g. 7 (7 AM)
  operatingEndHour: number;   // e.g. 19 (7 PM)
  tempSetbackCelsius: number; // e.g. 24.5
  occupancySensitivity: number; // %
  applied: boolean;
  appliedDate?: string;
}

export interface HourlyConsumption {
  hour: string;
  baselineEnergy: number;
  actualEnergy: number;
  simulatedEnergy?: number;
  baselineWater: number;
  actualWater: number;
  hasAnomaly?: boolean;
  anomalyNote?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  organization?: string;
  provider?: 'google' | 'password' | 'gmail-otp';
  photoURL?: string;
  passwordHash?: string;
  emailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

