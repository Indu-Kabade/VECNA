import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Zap, 
  Droplets, 
  IndianRupee, 
  Building2, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Check, 
  RefreshCw,
  PlusCircle,
  Database,
  ChevronDown,
  User,
  Sliders
} from 'lucide-react';
import { PageId, AppliedSolutionRecord } from '../types';
import { useOffline } from '../context/OfflineContext';
import { 
  getAppliedSolutions, 
  subscribeToAppliedSolutions, 
  updateSolutionStatus,
  applySolution 
} from '../services/solutionsService';
import { SolutionDetailModal } from '../components/SolutionDetailModal';

interface SolutionHistoryPageProps {
  onNavigate: (page: PageId) => void;
}

type FilterTab = 'all' | 'electricity' | 'water' | 'active' | 'completed';

export const SolutionHistoryPage: React.FC<SolutionHistoryPageProps> = ({ onNavigate }) => {
  const { isOnline } = useOffline();
  const [solutions, setSolutions] = useState<AppliedSolutionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedSolution, setSelectedSolution] = useState<AppliedSolutionRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isApplyingSample, setIsApplyingSample] = useState<boolean>(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Subscribe to real-time changes
  useEffect(() => {
    setIsLoading(true);
    // Initial fetch
    getAppliedSolutions(isOnline)
      .then((data) => {
        setSolutions(data);
        if (data.length > 0) {
          setExpandedIds(new Set([data[0].solutionId || data[0].id]));
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Initial load error:', err);
        setIsLoading(false);
      });

    // Real-time listener
    const unsubscribe = subscribeToAppliedSolutions((updated) => {
      setSolutions(updated);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isOnline]);

  // Toggle single item expanded state
  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand all / Collapse all helpers
  const handleExpandAll = () => {
    const allIds = new Set(filteredSolutions.map((s) => s.solutionId || s.id));
    setExpandedIds(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // Dynamic calculations from database records
  const totalApplied = solutions.length;
  const activeCount = useMemo(() => {
    return solutions.filter((s) => s.status === 'Active').length;
  }, [solutions]);

  const totalMonthlySavingsRupees = useMemo(() => {
    return solutions.reduce((sum, s) => sum + (s.estimatedSavingsRupees || 0), 0);
  }, [solutions]);

  const totalMonthlySavingsKwh = useMemo(() => {
    return solutions.reduce((sum, s) => {
      return s.resourceType === 'electricity' ? sum + (s.estimatedSavingsKwh || 0) : sum;
    }, 0);
  }, [solutions]);

  // Filter and search
  const filteredSolutions = useMemo(() => {
    return solutions.filter((sol) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (sol.solutionName || '').toLowerCase().includes(query);
        const matchesFloor = (sol.floor || '').toLowerCase().includes(query);
        const matchesBuilding = (sol.buildingId || '').toLowerCase().includes(query);
        const matchesResource = (sol.resourceType || '').toLowerCase().includes(query);
        const matchesProblem = (sol.problemDescription || '').toLowerCase().includes(query);
        if (!matchesName && !matchesFloor && !matchesBuilding && !matchesResource && !matchesProblem) {
          return false;
        }
      }

      // 2. Tab filter
      if (activeFilter === 'electricity') {
        return sol.resourceType === 'electricity';
      }
      if (activeFilter === 'water') {
        return sol.resourceType === 'water';
      }
      if (activeFilter === 'active') {
        return sol.status === 'Active';
      }
      if (activeFilter === 'completed') {
        return sol.status === 'Completed';
      }

      return true;
    });
  }, [solutions, searchQuery, activeFilter]);

  const handleOpenDetail = (sol: AppliedSolutionRecord) => {
    setSelectedSolution(sol);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (solutionId: string, currentStatus: 'Active' | 'Completed') => {
    const nextStatus = currentStatus === 'Active' ? 'Completed' : 'Active';
    try {
      await updateSolutionStatus(solutionId, nextStatus, isOnline);
      // Update local state immediately
      setSolutions((prev) =>
        prev.map((s) => (s.solutionId === solutionId ? { ...s, status: nextStatus } : s))
      );
      if (selectedSolution && selectedSolution.solutionId === solutionId) {
        setSelectedSolution((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleQuickApplyPreset = async (presetType: 'ac' | 'water') => {
    setIsApplyingSample(true);
    try {
      if (presetType === 'ac') {
        await applySolution(
          {
            floor: 'Floor 2',
            buildingId: 'Academic Block A',
            resourceType: 'electricity',
            solutionName: 'AC Schedule Optimization',
            solutionDescription: 'AC schedule was optimized to prevent unnecessary cooling after occupancy hours.',
            problemDescription: 'Floor 2 was consuming 27% more electricity than its normal baseline.',
            estimatedSavingsKwh: 395,
            estimatedSavingsRupees: 4200,
            appliedBy: 'Facilities Team',
          },
          isOnline
        );
      } else {
        await applySolution(
          {
            floor: 'Floor 4',
            buildingId: 'Academic Block A',
            resourceType: 'water',
            solutionName: 'Water Flow Optimization',
            solutionDescription: 'Restroom flush valve repair and flow limiter installation on secondary supply lines.',
            problemDescription: 'Restroom supply valve stuck open causing continuous 60 L/hour water loss.',
            estimatedSavingsKwh: 0,
            estimatedSavingsRupees: 1800,
            appliedBy: 'Plumbing Operations',
          },
          isOnline
        );
      }
      // Re-fetch
      const updated = await getAppliedSolutions(isOnline);
      setSolutions(updated);
    } finally {
      setIsApplyingSample(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Audit Trail</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Firestore Database Record
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Solution History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Permanent record of all interventions applied to resolve anomalies, optimize schedules, and capture sustainability savings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="nav-to-recommendations-btn"
            onClick={() => onNavigate('recommendations')}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Recommendations</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            id="nav-to-simulation-btn"
            onClick={() => onNavigate('simulation')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate & Apply</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Solutions Applied */}
        <div 
          id="summary-total-solutions"
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Total Solutions Applied</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white pt-1">
            {totalApplied}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Persisted in Firestore collection
          </p>
        </div>

        {/* Active Solutions */}
        <div 
          id="summary-active-solutions"
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Active Solutions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 pt-1">
            {activeCount}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Currently running in digital twin
          </p>
        </div>

        {/* Estimated Monthly Savings (Rupees) */}
        <div 
          id="summary-estimated-monthly-savings"
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Estimated Monthly Savings</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white pt-1">
            ₹{totalMonthlySavingsRupees.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            ₹{(totalMonthlySavingsRupees * 12).toLocaleString()} / year projected cut
          </p>
        </div>

        {/* Total Estimated Energy Savings (kWh) */}
        <div 
          id="summary-total-energy-savings"
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Total Energy Savings</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white pt-1">
            {totalMonthlySavingsKwh.toLocaleString()}
            <span className="text-sm font-semibold text-slate-500"> kWh/mo</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {(totalMonthlySavingsKwh * 12).toLocaleString()} kWh / year avoided
          </p>
        </div>
      </div>

      {/* CONTROLS: SEARCH BAR, FILTER TABS & EXPAND/COLLAPSE ALL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-applied-solutions-input"
              type="text"
              placeholder="Search applied solutions, floors, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>

              {(
                [
                  { id: 'all' as FilterTab, label: 'All' },
                  { id: 'electricity' as FilterTab, label: 'Electricity' },
                  { id: 'water' as FilterTab, label: 'Water' },
                  { id: 'active' as FilterTab, label: 'Active' },
                  { id: 'completed' as FilterTab, label: 'Completed' },
                ]
              ).map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`filter-tab-${tab.id}`}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Expand / Collapse All Quick Action */}
            {filteredSolutions.length > 0 && (
              <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  id="expand-all-solutions-btn"
                  onClick={handleExpandAll}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Expand all solution details"
                >
                  Expand All
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  id="collapse-all-solutions-btn"
                  onClick={handleCollapseAll}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Collapse all solution details"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REVERSE CHRONOLOGICAL LIST OF HISTORY CARDS */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Retrieving persisted solution records...</p>
          </div>
        ) : filteredSolutions.length === 0 ? (
          /* EMPTY STATE (As required: "No solutions applied yet") */
          <div 
            id="empty-solution-history"
            className="p-12 sm:p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
              <History className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                No solutions applied yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Solutions you apply to detected problems will appear here.
              </p>
            </div>

            {/* Quick action buttons to apply one or navigate */}
            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                id="apply-sample-ac-btn"
                disabled={isApplyingSample}
                onClick={() => handleQuickApplyPreset('ac')}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isApplyingSample ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                <span>Apply AC Optimization (Floor 2)</span>
              </button>

              <button
                type="button"
                id="apply-sample-water-btn"
                disabled={isApplyingSample}
                onClick={() => handleQuickApplyPreset('water')}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isApplyingSample ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                <span>Apply Water Flow Fix (Floor 4)</span>
              </button>
            </div>
          </div>
        ) : (
          /* VERTICAL LIST - EACH SOLUTION ROW STACKED ONE BELOW THE OTHER */
          <div className="space-y-3 sm:space-y-3.5">
            {filteredSolutions.map((sol, index) => {
              const solId = sol.solutionId || sol.id;
              const isExpanded = expandedIds.has(solId);
              const isElectricity = sol.resourceType === 'electricity';

              return (
                <div
                  key={solId}
                  id={`solution-item-${solId}`}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                    isExpanded
                      ? 'border-emerald-500/40 dark:border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* CLICKABLE ACCORDION HEADER ROW */}
                  <div
                    onClick={() => toggleExpand(solId)}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors select-none"
                  >
                    {/* Left: Icon, Number, Title, Floor & Problem summary */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Resource Icon Badge */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isElectricity
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                          : 'bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60'
                      }`}>
                        {isElectricity ? <Zap className="w-5 h-5" /> : <Droplets className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-slate-400">
                            #{index + 1}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            {sol.solutionName}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isElectricity
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                          }`}>
                            {sol.resourceType}
                          </span>
                        </div>

                        {/* Location, Time & Short Problem Teaser */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {sol.floor} • {sol.buildingId}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{sol.appliedAt}</span>
                          </span>
                          {sol.problemDescription && (
                            <>
                              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                              <span className="hidden sm:inline text-slate-400 dark:text-slate-500 truncate max-w-sm">
                                {sol.problemDescription}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Key figures, Status & Accordion Chevron */}
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      {/* Financial Impact Pill */}
                      <div className="text-left md:text-right">
                        <div className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-400">
                          ₹{sol.estimatedSavingsRupees.toLocaleString()}/mo
                        </div>
                        {sol.estimatedSavingsKwh > 0 && (
                          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {sol.estimatedSavingsKwh.toLocaleString()} kWh/mo
                          </div>
                        )}
                      </div>

                      {/* Status & Sync Badges */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          sol.status === 'Active'
                            ? 'bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sol.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          <span>{sol.status}</span>
                        </span>

                        {sol.syncStatus === 'pending' ? (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>Pending</span>
                          </span>
                        ) : (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Synced</span>
                          </span>
                        )}

                        {/* Expandable Dropdown Trigger Chevron */}
                        <div 
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white ${
                            isExpanded ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rotate-180' : ''
                          }`}
                        >
                          <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED DROPDOWN PANEL */}
                  {isExpanded && (
                    <div 
                      id={`solution-dropdown-${solId}`}
                      className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 p-5 sm:p-6 space-y-5 animate-in fade-in duration-200"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* 1. Problem Description Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span>Root Anomaly & Context</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {sol.problemDescription || 'No root anomaly description recorded for this entry.'}
                          </p>
                          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{sol.buildingId} • Zone: {sol.floor}</span>
                          </div>
                        </div>

                        {/* 2. Implemented Action Plan Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Intervention Implementation</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {sol.solutionDescription || 'Operational parameters updated and aligned with eco-standard baseline.'}
                          </p>
                          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              <span>{sol.appliedBy || 'Facilities Team'}</span>
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                              ID: {sol.solutionId || sol.id}
                            </span>
                          </div>
                        </div>

                        {/* 3. Sustainability & Financial Impact Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                            <IndianRupee className="w-4 h-4 text-emerald-600" />
                            <span>Calculated Financial ROI</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                              <div className="text-[10px] uppercase font-bold text-slate-400">Monthly</div>
                              <div className="text-base font-black text-emerald-700 dark:text-emerald-400">
                                ₹{sol.estimatedSavingsRupees.toLocaleString()}
                              </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                              <div className="text-[10px] uppercase font-bold text-slate-400">Projected Annual</div>
                              <div className="text-base font-black text-slate-800 dark:text-slate-200">
                                ₹{(sol.estimatedSavingsRupees * 12).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {sol.estimatedSavingsKwh > 0 && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-medium">
                              <span>Energy Avoidance:</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {sol.estimatedSavingsKwh.toLocaleString()} kWh/mo
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Action Toolbar */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/70 dark:border-slate-800/80">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium">Applied timestamp:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{sol.appliedAt}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Toggle status directly */}
                          <button
                            type="button"
                            id={`toggle-status-btn-${solId}`}
                            onClick={(e) => handleToggleStatus(sol.solutionId || sol.id, sol.status)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                              sol.status === 'Active'
                                ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent'
                            }`}
                          >
                            {sol.status === 'Active' ? 'Mark as Completed' : 'Reactivate Solution'}
                          </button>

                          {/* Quick navigation actions */}
                          <button
                            type="button"
                            onClick={() => onNavigate('twin')}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View Floor in 3D</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onNavigate('simulation')}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5 text-purple-500" />
                            <span>Simulate</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDetail(sol)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Modal view</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Detail View */}
      <SolutionDetailModal
        solution={selectedSolution}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};
