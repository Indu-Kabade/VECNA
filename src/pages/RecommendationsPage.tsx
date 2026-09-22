import React, { useState } from 'react';
import { 
  Sparkles, 
  Sliders, 
  ChevronDown, 
  Zap, 
  Droplets, 
  IndianRupee, 
  Leaf, 
  CheckCircle2, 
  Flame, 
  Bath, 
  Lightbulb, 
  Server, 
  Wrench, 
  Info,
  ArrowRight,
  CheckSquare,
  Square,
  RotateCcw,
  Check,
  History,
  RefreshCw
} from 'lucide-react';
import { PageId } from '../types';
import { RECOMMENDATIONS_DATA } from '../data/mockBuildingData';
import { WhyExplanation } from '../components/WhyModal';
import { useOffline } from '../context/OfflineContext';
import { useAuth } from '../context/AuthContext';
import { applySolution } from '../services/solutionsService';

interface RecommendationsPageProps {
  onNavigate: (page: PageId) => void;
  onSelectInterventionForSimulation: (recIdOrIds: string | string[]) => void;
  selectedInterventionIds?: string[];
  onSelectedInterventionsChange?: (ids: string[]) => void;
  onOpenWhy?: (data: WhyExplanation) => void;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  onNavigate,
  onSelectInterventionForSimulation,
  selectedInterventionIds = ['rec-1', 'rec-2', 'rec-3', 'rec-4'],
  onSelectedInterventionsChange,
}) => {
  // Store expanded state for each solution in order
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({
    'rec-1': true, // First one open by default
  });

  // Selected actions for cumulative total savings calculator
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedInterventionIds);
  const { isOnline } = useOffline();
  const { user } = useAuth();
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const handleApplyDirectly = async (rec: typeof RECOMMENDATIONS_DATA[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setApplyingId(rec.id);
    try {
      const resourceType: 'electricity' | 'water' = rec.category === 'Restrooms' ? 'water' : 'electricity';
      const floor = rec.id === 'rec-1' ? 'Floor 2' : rec.id === 'rec-2' ? 'Floor 1' : rec.id === 'rec-3' ? 'Floor 1' : 'Basement';

      await applySolution(
        {
          floor,
          buildingId: 'Academic Block A',
          resourceType,
          solutionName: rec.title,
          solutionDescription: rec.intervention,
          problemDescription: rec.problem,
          estimatedSavingsKwh: resourceType === 'electricity' ? rec.energySavingsMonthlyKwh : 0,
          estimatedSavingsRupees: rec.costSavingsMonthlyINR,
          appliedBy: user?.displayName || user?.email || 'Facilities Team',
        },
        isOnline
      );
      setAppliedIds((prev) => [...prev, rec.id]);
    } catch (err) {
      console.warn('Error applying recommendation directly:', err);
    } finally {
      setApplyingId(null);
    }
  };

  const updateSelectedIds = (newIds: string[]) => {
    setSelectedIds(newIds);
    if (onSelectedInterventionsChange) {
      onSelectedInterventionsChange(newIds);
    }
  };

  const toggleActionSelection = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    updateSelectedIds(newIds);
  };

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSimulateSingle = (recId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onSelectInterventionForSimulation([recId]);
    onNavigate('simulation');
  };

  const handleSimulateSelected = () => {
    if (selectedIds.length === 0) {
      onSelectInterventionForSimulation(['rec-1']);
    } else {
      onSelectInterventionForSimulation(selectedIds);
    }
    onNavigate('simulation');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'AC System':
      case 'HVAC':
        return Flame;
      case 'Restrooms':
        return Bath;
      case 'Lighting':
        return Lightbulb;
      case 'Server Room':
        return Server;
      default:
        return Wrench;
    }
  };

  // Compute live combined totals based on selected actions
  const selectedRecs = RECOMMENDATIONS_DATA.filter((r) => selectedIds.includes(r.id));
  const totalCostSavingsMonthlyINR = selectedRecs.reduce((sum, r) => sum + r.costSavingsMonthlyINR, 0);
  const totalEnergySavingsMonthlyKwh = selectedRecs.reduce((sum, r) => sum + r.energySavingsMonthlyKwh, 0);
  const totalWaterSavingsMonthlyLiters = selectedRecs.reduce((sum, r) => sum + r.waterSavingsMonthlyLiters, 0);
  const totalCo2ReductionMonthlyKg = selectedRecs.reduce((sum, r) => sum + r.co2ReductionMonthlyKg, 0);

  // Quick preset helpers
  const handleSelectAll = () => {
    updateSelectedIds(RECOMMENDATIONS_DATA.map((r) => r.id));
  };

  const handleSelectTapAndServer = () => {
    // Exact user test scenario: fix the tap (rec-2) and server room cooling (rec-4)
    updateSelectedIds(['rec-2', 'rec-4']);
  };

  const handleClearAll = () => {
    updateSelectedIds([]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Actionable Solutions
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">• 4 Verified Interventions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Recommended Solutions & Action Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Select the actions you want to take below to see your combined total savings across money, electricity, and water.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="simulate-selected-top-btn"
            onClick={handleSimulateSelected}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Simulate Plan in Sandbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* COMBINED SAVINGS CALCULATOR & ACTION PLAN BUILDER (Answers User Prompt Directly) */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-emerald-200 dark:border-emerald-800/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                Combined Savings Calculator
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {selectedIds.length} of {RECOMMENDATIONS_DATA.length} Actions Selected
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Select any combination of actions to see how much you will save in total.
            </p>
          </div>

          {/* Quick Filter Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">Quick Select:</span>
            <button
              onClick={handleSelectAll}
              className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-colors cursor-pointer ${
                selectedIds.length === RECOMMENDATIONS_DATA.length
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              All 4 Actions
            </button>
            <button
              id="preset-tap-server-btn"
              onClick={handleSelectTapAndServer}
              className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                selectedIds.length === 2 && selectedIds.includes('rec-2') && selectedIds.includes('rec-4')
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <span>Tap + Server Room</span>
              <span className="text-[10px] opacity-80">(₹3,900/mo)</span>
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs px-2 py-1 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Dynamic Cumulative Savings Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4">
          {/* Bill Cut (INR) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Total Cost Saved</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
              ₹{totalCostSavingsMonthlyINR.toLocaleString()}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/mo</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              ₹{(totalCostSavingsMonthlyINR * 12).toLocaleString()} annual savings
            </div>
          </div>

          {/* Electricity Saved (kWh) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Total Electricity Saved</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {totalEnergySavingsMonthlyKwh.toLocaleString()}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400"> kWh/mo</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {(totalEnergySavingsMonthlyKwh * 12).toLocaleString()} kWh / year
            </div>
          </div>

          {/* Water Saved (Liters) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              <Droplets className="w-4 h-4 text-sky-500" />
              <span>Total Water Saved</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {totalWaterSavingsMonthlyLiters.toLocaleString()}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400"> L/mo</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {totalWaterSavingsMonthlyLiters > 0 ? `${(totalWaterSavingsMonthlyLiters / 1000).toFixed(1)} kL/mo` : 'No water impact'}
            </div>
          </div>

          {/* Carbon Avoided (CO2 kg) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              <Leaf className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Total CO₂ Avoided</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {totalCo2ReductionMonthlyKg.toLocaleString()}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400"> kg/mo</span>
            </div>
            <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-1">
              {(totalCo2ReductionMonthlyKg * 12).toLocaleString()} kg CO₂ / year
            </div>
          </div>
        </div>

        {/* Simulation Callout Banner */}
        <div className="mt-4 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            {selectedIds.length === 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                No actions currently selected. Check any action below to calculate your savings.
              </span>
            ) : (
              <span>
                Plan includes: <strong className="text-slate-900 dark:text-white font-bold">{selectedRecs.map((r) => r.title).join(' + ')}</strong>
              </span>
            )}
          </div>

          <button
            onClick={handleSimulateSelected}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
            <span>Simulate Selected ({selectedIds.length}) in Sandbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Solutions List in Order - One Below the Other with Interactive Checkbox Selector */}
      <div className="space-y-3.5">
        {RECOMMENDATIONS_DATA.map((rec, index) => {
          const CategoryIcon = getCategoryIcon(rec.category);
          const isExpanded = !!expandedSolutions[rec.id];
          const isSelected = selectedIds.includes(rec.id);

          return (
            <div
              key={rec.id}
              id={`solution-card-${rec.id}`}
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                isSelected
                  ? 'border-emerald-300 dark:border-emerald-800/80 ring-1 ring-emerald-100 dark:ring-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Solution Row: Contains Checkbox + Click to expand */}
              <div
                onClick={() => toggleSolution(rec.id)}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                  isExpanded 
                    ? 'bg-slate-50/70 dark:bg-slate-800/40' 
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                }`}
              >
                {/* Left: Checkbox Selector + Step Number + Icon + Title */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Select for Plan Checkbox Button */}
                  <button
                    type="button"
                    id={`checkbox-action-${rec.id}`}
                    onClick={(e) => toggleActionSelection(rec.id, e)}
                    aria-label={isSelected ? `Deselect ${rec.title}` : `Select ${rec.title}`}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800 text-transparent'
                    }`}
                  >
                    <Check className={`w-4 h-4 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                  </button>

                  {/* Step Number Badge */}
                  <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                    {index + 1}
                  </div>

                  {/* Category Icon */}
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
                    <CategoryIcon className="w-4 h-4" />
                  </div>

                  {/* Title & Quick Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {rec.category}
                      </span>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Save ₹{rec.costSavingsMonthlyINR.toLocaleString()}/mo
                      </span>
                      {isSelected ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 hidden sm:inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> Selected in Plan
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
                          Click checkbox to include
                        </span>
                      )}
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {rec.title}
                    </h2>
                  </div>
                </div>

                {/* Right: Expand/Collapse Arrow Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 hidden md:inline">
                    {isExpanded ? 'Hide details' : 'View details'}
                  </span>
                  <button
                    id={`arrow-expand-btn-${rec.id}`}
                    type="button"
                    aria-label={isExpanded ? `Collapse ${rec.title}` : `Expand ${rec.title}`}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isExpanded
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Expanded Details: Visible when arrow is clicked */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {/* Current vs Recommended Configuration */}
                  <div className="p-5 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      <span>Setup Comparison</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Current Setup
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.currentConfig}</span>
                      </div>
                      <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                          Recommended Fix
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{rec.recommendedConfig}</span>
                      </div>
                    </div>
                  </div>

                  {/* Impact Savings Metric Pillars for this action */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Estimated Monthly Savings for this Action
                      </span>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{(rec.costSavingsMonthlyINR * 12).toLocaleString()} / year
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {rec.energySavingsMonthlyKwh > 0 ? (
                        <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/50">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] mb-0.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500" /> Electricity Saved
                          </div>
                          <div className="text-base font-black text-slate-900 dark:text-white">
                            {rec.energySavingsMonthlyKwh} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">kWh</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <div className="text-slate-400 text-[11px]">Electricity</div>
                          <div className="text-sm font-semibold text-slate-500">0 kWh (Water focus)</div>
                        </div>
                      )}

                      {rec.waterSavingsMonthlyLiters > 0 ? (
                        <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-800/50">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] mb-0.5">
                            <Droplets className="w-3.5 h-3.5 text-sky-500" /> Water Saved
                          </div>
                          <div className="text-base font-black text-slate-900 dark:text-white">
                            {rec.waterSavingsMonthlyLiters.toLocaleString()} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">L</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <div className="text-slate-400 text-[11px]">Water Saved</div>
                          <div className="text-sm font-semibold text-slate-500">0 L (Power focus)</div>
                        </div>
                      )}

                      <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/50">
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] mb-0.5">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Bill Cut
                        </div>
                        <div className="text-base font-black text-emerald-700 dark:text-emerald-400">
                          ₹{rec.costSavingsMonthlyINR.toLocaleString()}
                        </div>
                      </div>

                      {rec.co2ReductionMonthlyKg > 0 && (
                        <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-800/50">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] mb-0.5">
                            <Leaf className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> CO₂ Cut
                          </div>
                          <div className="text-base font-black text-slate-900 dark:text-white">
                            {rec.co2ReductionMonthlyKg} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">kg</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4-Step Solution Pathway */}
                  <div className="p-5 space-y-3 text-xs">
                    <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      4-Step Action Pathway
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 block mb-1">
                          1. Problem
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{rec.problem}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 block mb-1">
                          2. Evidence
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{rec.evidence}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 block mb-1">
                          3. Action
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{rec.intervention}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                          4. Result
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{rec.expectedImpact}</p>
                      </div>
                    </div>

                    {/* Why details */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs mt-3">
                      <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Why this action is recommended:</span>
                      </div>
                      <ul className="space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
                        {rec.whyDetails.map((detail, dIdx) => (
                          <li key={dIdx} className="leading-relaxed">
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons: Plan Selection + Apply Solution + Sandbox */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => toggleActionSelection(rec.id, e)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{isSelected ? 'Included in Action Plan (Click to Remove)' : 'Add this to Action Plan'}</span>
                      </button>

                      <div className="flex items-center gap-2 flex-wrap">
                        {appliedIds.includes(rec.id) ? (
                          <button
                            type="button"
                            onClick={() => onNavigate('solution-history')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>View in Solution History</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            id={`apply-solution-btn-${rec.id}`}
                            disabled={applyingId === rec.id}
                            onClick={(e) => handleApplyDirectly(rec, e)}
                            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {applyingId === rec.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            <span>Apply Solution</span>
                          </button>
                        )}

                        <button
                          id={`simulate-action-btn-${rec.id}`}
                          onClick={(e) => handleSimulateSingle(rec.id, e)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Simulate in Sandbox</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
