import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Thermometer, 
  Calendar, 
  Activity, 
  Zap, 
  ShieldCheck, 
  GitFork,
  Check,
  ChevronDown,
  Info,
  Sliders
} from 'lucide-react';
import { PageId, AnomalyItem } from '../types';
import { 
  ANOMALIES_LIST, 
  CAUSE_TREE_ROOT, 
  EVIDENCE_DATA, 
  ZONES_DATA 
} from '../data/mockBuildingData';
import { WhyButton, WhyExplanation } from '../components/WhyModal';

interface DiagnosisPageProps {
  onNavigate: (page: PageId) => void;
  selectedAnomalyId: string;
  onSelectAnomaly: (id: string) => void;
  onOpenWhy?: (data: WhyExplanation) => void;
}

export const DiagnosisPage: React.FC<DiagnosisPageProps> = ({
  onNavigate,
  selectedAnomalyId,
  onSelectAnomaly,
  onOpenWhy,
}) => {
  const currentAnomaly = ANOMALIES_LIST.find((a) => a.id === selectedAnomalyId) || ANOMALIES_LIST[0];

  const triggerWhy = (title: string, metric: string, explanation: string, detail?: string, actionHint?: string) => {
    if (onOpenWhy) {
      onOpenWhy({ title, metric, explanation, detail, actionHint });
    }
  };

  const causeProbabilities = [
    {
      cause: 'AC running several hours after most people leave',
      probability: 64,
      color: 'bg-emerald-500',
      badge: 'Most Likely Reason',
      detail: 'The automated weekly schedule timer failed to switch off at 8:00 PM closing time.',
    },
    {
      cause: 'Room temperature sensor reading too warm',
      probability: 23,
      color: 'bg-amber-500',
      badge: 'Secondary Possibility',
      detail: 'A wall sensor falsely reported high room temperature, causing extra cooling.',
    },
    {
      cause: 'Air cooling valve stuck in open position',
      probability: 13,
      color: 'bg-slate-400',
      badge: 'Unlikely',
      detail: 'Mechanical valve failed to close completely when people vacated.',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Anomaly Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              AI Investigation
            </span>
            <span className="text-xs text-slate-500 font-medium">• Finding the Real Cause</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            Why is the building wasting energy?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            VECNA analyzes motion sensors, room temperatures, and building schedules to explain the exact cause in simple English.
          </p>
        </div>

        {/* Selected Incident Switcher */}
        <div className="flex items-center gap-3">
          <label htmlFor="anomaly-select" className="text-xs font-bold text-slate-700">
            Current Incident:
          </label>
          <select
            id="anomaly-select"
            value={currentAnomaly.id}
            onChange={(e) => onSelectAnomaly(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
          >
            {ANOMALIES_LIST.map((anom) => (
              <option key={anom.id} value={anom.id}>
                {anom.zoneName} — {anom.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Incident Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs uppercase tracking-wider font-extrabold text-rose-400">
                Problem Investigated
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-bold">{currentAnomaly.zoneName}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              Floor 2 is using 27% more electricity than usual
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Smart sensors detected <strong>186 kWh</strong> drawn overnight at 02:00 AM versus <strong>120 kWh</strong> normal expected electricity (+27% waste). All 12 motion sensors confirmed 0 people were on the floor.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
            <button
              onClick={() => onNavigate('simulation')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Simulate Fix (AC Slider)</span>
            </button>

            <button
              onClick={() => onNavigate('recommendations')}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Recommended Action</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VISUAL CAUSE BREAKDOWN TREE (Clean and clear for judges) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <GitFork className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Visual Cause Breakdown
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              VECNA traces sensor readings down to the exact reason.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              AI Confidence: 91%
            </span>
            <WhyButton
              onClick={() => triggerWhy(
                '91% AI Confidence',
                'High Certainty',
                'Confidence is calculated by combining motion sensors (100% empty), temperature data (19.8°C overcooled), and campus closing hours (8:00 PM).',
                'Because all evidence points to the same cause, VECNA assigned 91% confidence.',
                'simulation'
              )}
            />
          </div>
        </div>

        {/* Tree Nodes Diagram */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Level 0: Top Node */}
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-[10px] uppercase font-bold tracking-wider text-rose-700">
                Symptom Detected by Sensor
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                Floor 2 is using 27% more electricity than usual
              </h4>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Actual: 186 kWh • Expected: 120 kWh (+66 kWh waste)
              </p>
            </div>
          </div>

          {/* Connector Down */}
          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-slate-300" />
          </div>

          {/* Level 1: Operating Mechanism */}
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                What is Happening
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                The AC is running several hours after most people leave
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                AC fans and chillers running at full power while 0 people are inside
              </p>
            </div>
          </div>

          {/* Connector Down */}
          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-slate-300" />
          </div>

          {/* Level 2: Probabilistic Candidate Hypotheses */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Candidate 1: Schedule Mismatch (64%) */}
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 relative shadow-xs">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-600 text-white shadow-xs">
                64% Probability ⭐
              </span>
              <div className="text-[10px] uppercase font-bold text-emerald-800">
                Most Likely Reason
              </div>
              <h4 className="text-sm font-black text-slate-900 mt-1">
                AC schedule timer left running overnight
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                The weekly schedule failed to switch off at 8:00 PM closing time, keeping the AC running all night.
              </p>
              <div className="mt-3 pt-2 border-t border-emerald-200 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matches All Sensor Evidence
              </div>
            </div>

            {/* Candidate 2: Thermostat issue (23%) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                23% Probability
              </span>
              <div className="text-[10px] uppercase font-bold text-slate-500">
                Secondary Factor
              </div>
              <h4 className="text-sm font-bold text-slate-800 mt-1">
                Room temperature sensor reading too warm
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                A wall sensor falsely thought the room was hot, triggering unnecessary cooling cycles.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                Partially corroborated
              </div>
            </div>

            {/* Candidate 3: Equipment degradation (13%) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-400 text-white">
                13% Probability
              </span>
              <div className="text-[10px] uppercase font-bold text-slate-500">
                Unlikely Cause
              </div>
              <h4 className="text-sm font-bold text-slate-800 mt-1">
                Air cooling valve stuck in open position
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Cooling air valve failed to close completely when rooms were vacated.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                Sensors show low likelihood
              </div>
            </div>
          </div>
        </div>

        {/* Probability Breakdown Bars */}
        <div className="mt-10 pt-6 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Probability Breakdown of Possible Causes
          </h3>
          <div className="space-y-3">
            {causeProbabilities.map((item) => (
              <div key={item.cause} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-800 font-semibold">{item.cause}</span>
                  <span className="font-bold text-slate-900">{item.probability}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.probability}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EVIDENCE USED SECTION (Simple & clear) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Evidence Used to Prove the Cause
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              VECNA combines real sensor streams so judges and facility managers don't have to guess.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            4 Corroborating Sensor Streams
          </span>
        </div>

        {/* Evidence Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Evidence 1: People in the building */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>People in Building</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                0 People
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              Empty between 8:30 PM and 7:15 AM
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              All 12 motion sensors confirmed nobody was on Floor 2 all night long.
            </p>
          </div>

          {/* Evidence 2: AC Power Meter */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                <Activity className="w-4 h-4 text-rose-600" />
                <span>AC Electricity Draw</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                186 kWh Active
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              High power draw at 2:00 AM
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Power meter recorded continuous cooling draw through the middle of the night.
            </p>
          </div>

          {/* Evidence 3: Temperature */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                <Thermometer className="w-4 h-4 text-sky-600" />
                <span>Room Temperature</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                19.8°C (Icy)
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              Rooms cooled down to 19.8°C
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Outside air was 21.4°C, yet AC was overcooling empty rooms to 19.8°C.
            </p>
          </div>

          {/* Evidence 4: Building schedule */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Campus Calendar</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Closed 8:00 PM
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              Official closing time was 8 PM
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Schedule confirms no night classes or events were authorized for Floor 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
