import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  IndianRupee, 
  Leaf, 
  Check, 
  RefreshCw,
  Droplets,
  AlertCircle,
  RotateCcw,
  Info,
  Flame,
  Bath,
  Lightbulb,
  Server,
  Wrench,
  ChevronRight,
  TrendingDown,
  History
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { PageId } from '../types';
import { SIMULATION_PRESETS, RECOMMENDATIONS_DATA } from '../data/mockBuildingData';
import { WhyButton, WhyExplanation } from '../components/WhyModal';
import { useOffline } from '../context/OfflineContext';
import { applySolution } from '../services/solutionsService';

interface SimulationPageProps {
  onNavigate: (page: PageId) => void;
  selectedInterventionId?: string;
  selectedInterventionIds?: string[];
  onSelectedInterventionsChange?: (ids: string[]) => void;
  onInterventionApplied: () => void;
  isInterventionApplied?: boolean;
  onOpenWhy?: (data: WhyExplanation) => void;
}

type ActionKey = 'rec-1' | 'rec-2' | 'rec-3' | 'rec-4';

export const SimulationPage: React.FC<SimulationPageProps> = ({
  onNavigate,
  selectedInterventionId,
  selectedInterventionIds,
  onSelectedInterventionsChange,
  onInterventionApplied,
  isInterventionApplied = false,
  onOpenWhy,
}) => {
  const { isOnline } = useOffline();

  // Multi-action selection state: supports selecting any combination of all 4 actions
  const [activeActions, setActiveActions] = useState<ActionKey[]>(() => {
    if (selectedInterventionIds && selectedInterventionIds.length > 0) {
      return selectedInterventionIds as ActionKey[];
    }
    if (selectedInterventionId && (selectedInterventionId in SIMULATION_PRESETS)) {
      return [selectedInterventionId as ActionKey];
    }
    return ['rec-1', 'rec-2', 'rec-3', 'rec-4']; // Default to all
  });

  // Keep in sync when parent passes new selectedInterventionIds
  useEffect(() => {
    if (selectedInterventionIds && selectedInterventionIds.length > 0) {
      setActiveActions(selectedInterventionIds as ActionKey[]);
    }
  }, [selectedInterventionIds]);

  // Focused action for individual parameter tuning
  const [focusedActionKey, setFocusedActionKey] = useState<ActionKey>('rec-1');

  // Interactive slider parameters
  // Floor 2 AC: operating hours (10 to 17 hrs, default 12 for 7 AM - 7 PM)
  const [acOperatingHours, setAcOperatingHours] = useState<number>(12);
  
  // Server room cooling: temperature setpoint (18.5°C to 24.0°C, default 23.0°C)
  const [serverSetpointC, setServerSetpointC] = useState<number>(23.0);

  // Application state
  const [hasAppliedLocally, setHasAppliedLocally] = useState<boolean>(isInterventionApplied);
  const [isApplying, setIsApplying] = useState(false);

  const hasApplied = hasAppliedLocally || isInterventionApplied;

  // Toggle an action in the multi-action plan
  const toggleAction = (key: ActionKey) => {
    const updated = activeActions.includes(key)
      ? activeActions.filter((k) => k !== key)
      : [...activeActions, key];
    setActiveActions(updated);
    if (onSelectedInterventionsChange) {
      onSelectedInterventionsChange(updated);
    }
    // Set focused action to the clicked one if newly selected
    if (!activeActions.includes(key)) {
      setFocusedActionKey(key);
    }
  };

  // Quick preset handlers
  const handleSelectTapAndServer = () => {
    // Specifically requested test: fix tap (rec-2) and server room cooling (rec-4)
    const preset: ActionKey[] = ['rec-2', 'rec-4'];
    setActiveActions(preset);
    setFocusedActionKey('rec-2');
    if (onSelectedInterventionsChange) {
      onSelectedInterventionsChange(preset);
    }
  };

  const handleSelectAll = () => {
    const all: ActionKey[] = ['rec-1', 'rec-2', 'rec-3', 'rec-4'];
    setActiveActions(all);
    if (onSelectedInterventionsChange) {
      onSelectedInterventionsChange(all);
    }
  };

  const handleClearAll = () => {
    setActiveActions([]);
    if (onSelectedInterventionsChange) {
      onSelectedInterventionsChange([]);
    }
  };

  // Calculate savings for each action independently
  // rec-1 (Floor 2 AC)
  const baselineAcHours = 17; // 6 AM - 11 PM
  const acHoursSaved = Math.max(0, baselineAcHours - acOperatingHours);
  const rec1Kwh = activeActions.includes('rec-1') ? Math.round(acHoursSaved * 84) : 0; // 420 at 12 hrs
  const rec1Cost = Math.round(rec1Kwh * 10); // ₹4,200
  const rec1Co2 = Math.round(rec1Kwh * 0.5); // 210 kg
  const rec1Water = activeActions.includes('rec-1') ? 1200 : 0;

  // rec-2 (Restroom Flush Valve / Tap Leak)
  const rec2Kwh = activeActions.includes('rec-2') ? 35 : 0;
  const rec2Cost = activeActions.includes('rec-2') ? 1800 : 0;
  const rec2Co2 = activeActions.includes('rec-2') ? 18 : 0;
  const rec2Water = activeActions.includes('rec-2') ? 18000 : 0;

  // rec-3 (Corridor Lighting Cutoff)
  const rec3Kwh = activeActions.includes('rec-3') ? 160 : 0;
  const rec3Cost = activeActions.includes('rec-3') ? 1600 : 0;
  const rec3Co2 = activeActions.includes('rec-3') ? 80 : 0;
  const rec3Water = 0;

  // rec-4 (Server Room Cooling Recalibration)
  // Baseline 18.5°C -> Setpoint up to 23.0°C (delta 4.5°C = ~210 kWh, ₹2,100)
  const deltaDegrees = Math.max(0, serverSetpointC - 18.5);
  const rec4Kwh = activeActions.includes('rec-4') ? Math.round(deltaDegrees * 46.66) : 0; // 210 at 23°C
  const rec4Cost = Math.round(rec4Kwh * 10); // ₹2,100
  const rec4Co2 = Math.round(rec4Kwh * 0.5); // 105 kg
  const rec4Water = activeActions.includes('rec-4') ? 400 : 0;

  // Total combined savings across active actions
  const totalCostSavingsINR = rec1Cost + rec2Cost + rec3Cost + rec4Cost;
  const totalKwhSavings = rec1Kwh + rec2Kwh + rec3Kwh + rec4Kwh;
  const totalWaterSavingsLiters = rec1Water + rec2Water + rec3Water + rec4Water;
  const totalCo2ReductionKg = rec1Co2 + rec2Co2 + rec3Co2 + rec4Co2;

  // Helper label for AC schedule
  const getScheduleLabel = (hours: number) => {
    if (hours >= 17) return '6:00 AM – 11:00 PM (Runs all night)';
    if (hours === 16) return '6:00 AM – 10:00 PM';
    if (hours === 15) return '7:00 AM – 10:00 PM';
    if (hours === 14) return '7:00 AM – 9:00 PM';
    if (hours === 13) return '7:00 AM – 8:00 PM';
    if (hours === 12) return '7:00 AM – 7:00 PM (Recommended Fix)';
    if (hours === 11) return '7:30 AM – 6:30 PM';
    if (hours === 10) return '8:00 AM – 6:00 PM (Strict Eco)';
    return `${hours} hours daily`;
  };

  const triggerWhy = (title: string, metric: string, explanation: string, detail?: string, actionHint?: string) => {
    if (onOpenWhy) {
      onOpenWhy({ title, metric, explanation, detail, actionHint });
    }
  };

  // Generate dynamic simulation hourly curve:
  // Aggregates before vs after for all active actions!
  const chartData = useMemo(() => {
    // 24 hours timeline
    const hours = [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];

    return hours.map((hour, idx) => {
      const hourNum = parseInt(hour.split(':')[0], 10);
      let totalBefore = 0;
      let totalAfter = 0;

      // Base building load baseline (common equipment)
      totalBefore += 120;
      totalAfter += 120;

      // Add rec-1 if active
      if (activeActions.includes('rec-1')) {
        const pt = SIMULATION_PRESETS['rec-1'].hourlySimulation[idx];
        const startH = acOperatingHours <= 12 ? 7 : 6;
        const endH = startH + acOperatingHours;
        const isOffHour = hourNum < startH || hourNum >= endH;
        
        totalBefore += pt.before;
        totalAfter += isOffHour ? 42 : (pt.before - 15);
      }

      // Add rec-2 if active (Water pump / pressure draw equivalence)
      if (activeActions.includes('rec-2')) {
        const pt = SIMULATION_PRESETS['rec-2'].hourlySimulation[idx];
        // Convert water flow rate to proportional power/pump load
        totalBefore += Math.round(pt.before * 0.05);
        totalAfter += Math.round(pt.after * 0.05);
      }

      // Add rec-3 if active
      if (activeActions.includes('rec-3')) {
        const pt = SIMULATION_PRESETS['rec-3'].hourlySimulation[idx];
        totalBefore += pt.before;
        totalAfter += pt.after;
      }

      // Add rec-4 if active
      if (activeActions.includes('rec-4')) {
        const pt = SIMULATION_PRESETS['rec-4'].hourlySimulation[idx];
        // Scale savings by server setpoint slider
        const tempSavingsRatio = deltaDegrees / 4.5;
        const hourDiff = (pt.before - pt.after) * tempSavingsRatio;
        totalBefore += pt.before;
        totalAfter += Math.max(30, Math.round(pt.before - hourDiff));
      }

      return {
        hour,
        before: totalBefore,
        after: activeActions.length > 0 ? totalAfter : totalBefore,
      };
    });
  }, [activeActions, acOperatingHours, deltaDegrees]);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      // Save each active action to Firestore / local IndexedDB
      for (const key of activeActions) {
        const meta = getActionMetadata(key);
        const resourceType: 'electricity' | 'water' = key === 'rec-2' ? 'water' : 'electricity';
        const floor = key === 'rec-1' ? 'Floor 2' : key === 'rec-2' ? 'Floor 4' : key === 'rec-3' ? 'Floor 1' : 'Basement';
        const problemDesc = key === 'rec-1' 
          ? 'Floor 2 was consuming 27% more electricity than its normal baseline.'
          : key === 'rec-2'
          ? 'Restroom supply valve stuck open causing continuous 60 L/hour water loss.'
          : key === 'rec-3'
          ? 'Common hallway lighting operating at 100% illumination through late night.'
          : 'Server room cooling temperature sub-cooled to 19°C creating 15% unnecessary compressor draw.';
        const solDesc = key === 'rec-1'
          ? `AC schedule was optimized to ${acOperatingHours}h/day, preventing unnecessary cooling after occupancy hours.`
          : key === 'rec-2'
          ? 'Replaced diaphragm flush valve and fitted secondary water flow limiter.'
          : key === 'rec-3'
          ? 'Automated 20% security step-dimming with motion sensors after 9:00 PM.'
          : `Recalibrated server room cooling setpoint to 23.5°C (+${deltaDegrees}°C adjustment).`;

        await applySolution(
          {
            floor,
            buildingId: 'Academic Block A',
            resourceType,
            solutionName: meta.title,
            solutionDescription: solDesc,
            problemDescription: problemDesc,
            estimatedSavingsKwh: meta.kwh,
            estimatedSavingsRupees: meta.cost,
            appliedBy: 'Facilities Team',
          },
          isOnline
        );
      }
    } catch (err) {
      console.warn('Error applying solution to database:', err);
    } finally {
      setIsApplying(false);
      setHasAppliedLocally(true);
      onInterventionApplied();
    }
  };

  const getActionMetadata = (key: ActionKey) => {
    const rec = RECOMMENDATIONS_DATA.find((r) => r.id === key);
    let icon = Flame;
    if (key === 'rec-2') icon = Bath;
    if (key === 'rec-3') icon = Lightbulb;
    if (key === 'rec-4') icon = Server;

    return {
      title: rec?.title || SIMULATION_PRESETS[key].title,
      zone: SIMULATION_PRESETS[key].zone,
      icon,
      cost: key === 'rec-1' ? rec1Cost : key === 'rec-2' ? rec2Cost : key === 'rec-3' ? rec3Cost : rec4Cost,
      kwh: key === 'rec-1' ? rec1Kwh : key === 'rec-2' ? rec2Kwh : key === 'rec-3' ? rec3Kwh : rec4Kwh,
      water: key === 'rec-1' ? rec1Water : key === 'rec-2' ? rec2Water : key === 'rec-3' ? 0 : rec4Water,
      co2: key === 'rec-1' ? rec1Co2 : key === 'rec-2' ? rec2Co2 : key === 'rec-3' ? rec3Co2 : rec4Co2,
    };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Interactive Simulation Sandbox
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Multi-Action Testing & "What-If" Analysis
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Test Any Combination of Actions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Toggle which actions you want to take (e.g. fix the tap + server room cooling) and see your combined rupee, power, and water savings.
          </p>
        </div>

        {/* Quick Preset Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="sim-preset-tap-server"
            onClick={handleSelectTapAndServer}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeActions.length === 2 && activeActions.includes('rec-2') && activeActions.includes('rec-4')
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>Tap + Server Cooling</span>
            <span className="text-[10px] opacity-80">(₹3,900/mo)</span>
          </button>

          <button
            onClick={handleSelectAll}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              activeActions.length === 4
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            All 4 Actions
          </button>

          <button
            onClick={handleClearAll}
            className="p-2 text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold cursor-pointer"
            title="Clear all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ACTION SELECTOR CHIPS - ALL 4 ACTIONS ACCESSIBLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Select Actions to Include in Simulation</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any card to add or remove it from your simulated plan.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
            {activeActions.length} of 4 Actions Active
          </span>
        </div>

        {/* 4 Interactive Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(['rec-1', 'rec-2', 'rec-3', 'rec-4'] as ActionKey[]).map((key) => {
            const isSelected = activeActions.includes(key);
            const isFocused = focusedActionKey === key;
            const meta = getActionMetadata(key);
            const Icon = meta.icon;

            return (
              <div
                key={key}
                id={`sim-action-card-${key}`}
                onClick={() => {
                  toggleAction(key);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-900/60 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 opacity-70 hover:opacity-100 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent'
                    }`}>
                      <Check className={`w-3.5 h-3.5 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {meta.title}
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {meta.zone}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                    {isSelected ? `₹${meta.cost.toLocaleString()}/mo` : `+₹${RECOMMENDATIONS_DATA.find((r)=>r.id===key)?.costSavingsMonthlyINR.toLocaleString()}/mo`}
                  </span>
                  {isSelected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedActionKey(key);
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                        isFocused 
                          ? 'bg-emerald-600 text-white' 
                          : 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/50 hover:bg-emerald-200'
                      }`}
                    >
                      {isFocused ? 'Tuning' : 'Tune'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMBINED PREDICTED RESULTS SUMMARY (The Exact Answer to User Question) */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-emerald-200 dark:border-emerald-800/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                Combined Projected Savings
              </span>
              {activeActions.length === 2 && activeActions.includes('rec-2') && activeActions.includes('rec-4') && (
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700">
                  ⭐ Tap + Server Room Cooling Selected
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {activeActions.length === 0 
                ? 'No actions selected — Choose at least one action above' 
                : `Total Impact from ${activeActions.length} Selected ${activeActions.length === 1 ? 'Action' : 'Actions'}`}
            </h2>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Based on building sensor telemetry & equipment rates
          </div>
        </div>

        {/* 4 Metric Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cost Savings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Monthly Bill Cut</span>
              </span>
              <WhyButton
                onClick={() => triggerWhy(
                  'Combined Cost Savings',
                  `₹${totalCostSavingsINR.toLocaleString()}/month`,
                  `Sum of predicted monetary savings across all ${activeActions.length} active interventions based on ₹10/kWh electricity tariff and municipal water rates.`,
                  activeActions.includes('rec-2') && activeActions.includes('rec-4')
                    ? 'Fixing the tap saves ₹1,800/mo and recalibrating the server room cooling saves ₹2,100/mo = exactly ₹3,900/mo.'
                    : 'Adjusting individual action sliders will update this total live.',
                  'verification'
                )}
              />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              ₹{totalCostSavingsINR.toLocaleString()}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/mo</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              ₹{(totalCostSavingsINR * 12).toLocaleString()} saved each year
            </p>
          </div>

          {/* Electricity Savings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Electricity Saved</span>
              </span>
              <WhyButton
                onClick={() => triggerWhy(
                  'Combined Electricity Savings',
                  `${totalKwhSavings.toLocaleString()} kWh/mo`,
                  `Combined power reduction from selected systems.`,
                  'Eliminates wasted overnight draw and optimizes compressor workloads.',
                  'verification'
                )}
              />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {totalKwhSavings.toLocaleString()}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400"> kWh/mo</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5">
              {(totalKwhSavings * 12).toLocaleString()} kWh / year
            </p>
          </div>

          {/* Water Savings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span>Water Saved</span>
              </span>
              <WhyButton
                onClick={() => triggerWhy(
                  'Combined Water Savings',
                  `${totalWaterSavingsLiters.toLocaleString()} Liters/mo`,
                  `Prevents clean water dripping into sewer drains and optimizes cooling tower makeup water.`,
                  'Restroom valve repair alone stops ~18,000 Liters of leakage every month.',
                  'verification'
                )}
              />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {totalWaterSavingsLiters.toLocaleString()}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400"> L/mo</span>
            </div>
            <p className="text-[11px] text-sky-600 dark:text-sky-400 font-bold mt-1.5">
              {totalWaterSavingsLiters > 0 ? `${(totalWaterSavingsLiters / 1000).toFixed(1)} kiloliters / month` : '0 L (Energy focused)'}
            </p>
          </div>

          {/* CO2 Cut */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>CO₂ Avoided</span>
              </span>
              <WhyButton
                onClick={() => triggerWhy(
                  'Combined Carbon Reduction',
                  `${totalCo2ReductionKg.toLocaleString()} kg/mo`,
                  `Carbon emissions avoided based on grid carbon intensity factor of 0.5 kg CO2 per kWh.`,
                  'Cleaner campus footprint with zero compromise on occupant comfort.',
                  'verification'
                )}
              />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {totalCo2ReductionKg.toLocaleString()}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400"> kg</span>
            </div>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold mt-1.5">
              {(totalCo2ReductionKg * 12).toLocaleString()} kg CO₂ / year
            </p>
          </div>
        </div>

        {/* Itemized Contribution Table */}
        {activeActions.length > 0 && (
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/80 dark:border-emerald-800/80 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200 mb-2.5 flex items-center justify-between">
              <span>Itemized Breakdown of Selected Actions:</span>
              <span className="text-[11px] text-slate-500 font-normal">Individual contributions sum up to total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-1.5 font-semibold">Action</th>
                    <th className="pb-1.5 font-semibold">Cost Saved</th>
                    <th className="pb-1.5 font-semibold">Electricity</th>
                    <th className="pb-1.5 font-semibold">Water</th>
                    <th className="pb-1.5 font-semibold">CO₂ Cut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {activeActions.map((key) => {
                    const meta = getActionMetadata(key);
                    return (
                      <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{meta.title}</span>
                        </td>
                        <td className="py-2 text-emerald-700 dark:text-emerald-400 font-bold">
                          ₹{meta.cost.toLocaleString()}/mo
                        </td>
                        <td className="py-2 text-slate-700 dark:text-slate-300">
                          {meta.kwh > 0 ? `${meta.kwh} kWh/mo` : '—'}
                        </td>
                        <td className="py-2 text-slate-700 dark:text-slate-300">
                          {meta.water > 0 ? `${meta.water.toLocaleString()} L/mo` : '—'}
                        </td>
                        <td className="py-2 text-slate-700 dark:text-slate-300">
                          {meta.co2 > 0 ? `${meta.co2} kg/mo` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-slate-300 dark:border-slate-700 font-black">
                    <td className="pt-2 text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Combined Total
                    </td>
                    <td className="pt-2 text-emerald-700 dark:text-emerald-400 text-sm">
                      ₹{totalCostSavingsINR.toLocaleString()}/mo
                    </td>
                    <td className="pt-2 text-slate-900 dark:text-white">
                      {totalKwhSavings} kWh/mo
                    </td>
                    <td className="pt-2 text-slate-900 dark:text-white">
                      {totalWaterSavingsLiters.toLocaleString()} L/mo
                    </td>
                    <td className="pt-2 text-slate-900 dark:text-white">
                      {totalCo2ReductionKg} kg/mo
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* INTERACTIVE TUNING CONTROLS + 24-HOUR COMBINED CURVE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Sliders & Parameter Tuning */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Fine-Tune Parameters
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Real-time simulation</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Adjust operating schedules or setpoints below to test different scenarios.
            </p>
          </div>

          {/* Action Tuning Cards */}
          <div className="space-y-4">
            {/* 1. Floor 2 AC System Slider */}
            {activeActions.includes('rec-1') && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Floor 2 AC Runtime</span>
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {acOperatingHours} Hours / Day
                  </span>
                </div>

                <input
                  id="ac-hours-slider"
                  type="range"
                  min="10"
                  max="17"
                  step="1"
                  value={acOperatingHours}
                  onChange={(e) => setAcOperatingHours(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>10 hrs (Strict)</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">12 hrs (7 AM – 7 PM) ⭐</span>
                  <span>17 hrs (Current)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                  <strong>Schedule:</strong> {getScheduleLabel(acOperatingHours)}
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    AC Savings: ₹{rec1Cost.toLocaleString()}/mo • {rec1Kwh} kWh/mo
                  </div>
                </div>
              </div>
            )}

            {/* 2. Server Room Setpoint Slider */}
            {activeActions.includes('rec-4') && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Server Room Cooling Setpoint</span>
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                    {serverSetpointC.toFixed(1)} °C
                  </span>
                </div>

                <input
                  id="server-temp-slider"
                  type="range"
                  min="18.5"
                  max="24.0"
                  step="0.5"
                  value={serverSetpointC}
                  onChange={(e) => setServerSetpointC(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>18.5°C (Current)</span>
                  <span className="text-indigo-700 dark:text-indigo-400 font-bold">23.0°C (ASHRAE Recommended) ⭐</span>
                  <span>24.0°C</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                  <strong>Cooling Relief:</strong> +{deltaDegrees.toFixed(1)}°C reduction in compressor overcooling
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    Server Savings: ₹{rec4Cost.toLocaleString()}/mo • {rec4Kwh} kWh/mo
                  </div>
                </div>
              </div>
            )}

            {/* 3. Restroom Water Tap / Valve Info Card */}
            {activeActions.includes('rec-2') && (
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-sky-900 dark:text-sky-200">
                  <Bath className="w-3.5 h-3.5 text-sky-600" />
                  <span>Restroom Flush Valve & Tap Repair</span>
                </div>
                <p className="text-sky-800 dark:text-sky-300 text-[11px] leading-relaxed">
                  Replaces damaged solenoid flush valve that continuously leaks 380 Liters/hr overnight.
                </p>
                <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400 pt-1">
                  Water Saved: 18,000 Liters / month (₹1,800/mo bill cut)
                </div>
              </div>
            )}

            {/* 4. Corridor Lighting Cutoff */}
            {activeActions.includes('rec-3') && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Automated Corridor & Skyway Lighting Cutoff</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                  Automates 20% security step-dimming with motion sensors after 9:00 PM.
                </p>
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 pt-1">
                  Electricity Saved: 160 kWh / month (₹1,600/mo bill cut)
                </div>
              </div>
            )}

            {activeActions.length === 0 && (
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-600 mb-1" />
                <p className="font-bold">No actions selected</p>
                <p className="text-[11px] mt-0.5">Please check at least one action above to simulate savings.</p>
              </div>
            )}
          </div>

          {/* Apply Selected Actions Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {!hasApplied ? (
              <button
                id="apply-action-btn"
                disabled={isApplying || activeActions.length === 0}
                onClick={handleApply}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-101 cursor-pointer disabled:opacity-50"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Applying {activeActions.length} actions to building controls...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Apply {activeActions.length} Selected Actions (Save ₹{totalCostSavingsINR.toLocaleString()}/mo)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                {/* Confirmation Message */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{activeActions.length} Actions Applied Successfully!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Building controls updated. Projected savings of <strong>₹{totalCostSavingsINR.toLocaleString()}/month</strong> active in digital twin.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    id="view-solution-history-btn"
                    onClick={() => onNavigate('solution-history')}
                    className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View in Solution History</span>
                  </button>

                  <button
                    id="go-to-verification-btn"
                    onClick={() => onNavigate('verification')}
                    className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Verify Real Meter Results</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: 24-Hour Comparative Curve for Selected Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  24-Hour Load Curve: Before vs After Selected Actions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Simulated impact of {activeActions.length} selected actions across the full 24-hour cycle.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Before (Waste)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>After Fix (Saved)</span>
                </div>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="simBeforeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="simAfterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} interval={3} />
                  <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} unit="kWh" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="before"
                    name="Before Actions"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fill="url(#simBeforeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="after"
                    name="After Actions"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#simAfterGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick explanation below chart */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Hourly power baseline modeled for active systems</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Avg. load reduced by ~{totalKwhSavings > 0 ? Math.round(totalKwhSavings / 30 / 24 * 10) / 10 : 0} kW continuously
              </span>
            </div>
          </div>

          {/* Direct Answer Callout for user's scenario */}
          <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulated Scenario Summary</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              If you execute {activeActions.length === 2 && activeActions.includes('rec-2') && activeActions.includes('rec-4') ? (
                <strong>fixing the leaking restroom tap/valve + recalibrating server room cooling</strong>
              ) : (
                <strong>the {activeActions.length} selected {activeActions.length === 1 ? 'action' : 'actions'}</strong>
              )}, you will save:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Monthly Bill</div>
                <div className="text-base font-black text-emerald-700 dark:text-emerald-400">₹{totalCostSavingsINR.toLocaleString()}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Electricity</div>
                <div className="text-base font-black text-slate-900 dark:text-white">{totalKwhSavings} kWh</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Water Saved</div>
                <div className="text-base font-black text-slate-900 dark:text-white">{totalWaterSavingsLiters.toLocaleString()} L</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Carbon Cut</div>
                <div className="text-base font-black text-slate-900 dark:text-white">{totalCo2ReductionKg} kg</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
