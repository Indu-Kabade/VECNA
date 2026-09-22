import React, { useState } from 'react';
import { 
  Zap, 
  Droplets, 
  AlertTriangle, 
  IndianRupee, 
  ArrowUpRight, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Filter, 
  CheckCircle2, 
  Info,
  Search,
  Sliders
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { PageId } from '../types';
import { 
  BUILDING_INFO, 
  HOURLY_TIMELINE_DATA, 
  ANOMALIES_LIST, 
  ZONES_DATA 
} from '../data/mockBuildingData';
import { WhyButton, WhyExplanation } from '../components/WhyModal';
import { useOffline } from '../context/OfflineContext';
import { Layers, Database, WifiOff, Wifi } from 'lucide-react';

interface InsightsPageProps {
  onNavigate: (page: PageId) => void;
  onSelectAnomalyForDiagnosis: (anomalyId: string) => void;
  onOpenInvestigation?: () => void;
  onOpenWhy?: (data: WhyExplanation) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  onNavigate,
  onSelectAnomalyForDiagnosis,
  onOpenInvestigation,
  onOpenWhy,
}) => {
  const { isOnline, events, pendingEvents, setIsQueueModalOpen } = useOffline();
  const [selectedResourceType, setSelectedResourceType] = useState<'all' | 'energy' | 'water'>('all');
  const [activeChartTab, setActiveChartTab] = useState<'timeline' | 'zones'>('timeline');

  const triggerWhy = (title: string, metric: string, explanation: string, detail?: string, actionHint?: string) => {
    if (onOpenWhy) {
      onOpenWhy({ title, metric, explanation, detail, actionHint });
    }
  };

  const filteredAnomalies = ANOMALIES_LIST.filter((a) => {
    if (selectedResourceType === 'all') return true;
    return a.resourceType === selectedResourceType;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Real-Time Building Analytics
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {BUILDING_INFO.activeAnomaliesCount} Unusual Consumption Events
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            Electricity & Water Consumption
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Comparing live sensor readings with normal baseline patterns to find unexpected resource waste.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenInvestigation && (
            <button
              onClick={onOpenInvestigation}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Launch AI Investigation</span>
            </button>
          )}
        </div>
      </div>

      {/* TOP KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Energy Today */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> Electricity Today
            </span>
            <WhyButton
              onClick={() => triggerWhy(
                'Electricity Today',
                '1,842 kWh (+12.4% above normal)',
                '1,842 kWh was drawn over the past 24 hours across all floors, compared to an expected 1,638 kWh.',
                'The main driver is Floor 2 running AC overnight between 1:00 AM and 6:00 AM.',
                'diagnosis'
              )}
            />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            1,842 <span className="text-sm font-semibold text-slate-500">kWh</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-rose-600 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>↑ 12.4% above normal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Normal expected: 1,638 kWh</p>
        </div>

        {/* KPI 2: Water Today */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-500" /> Water Today
            </span>
            <WhyButton
              onClick={() => triggerWhy(
                'Water Today',
                '18,420 Liters (+8.7% above normal)',
                'Water consumption exceeded normal daily levels due to a steady leaking valve in East Restroom 2.',
                'The leak loses roughly 380 Liters every hour into the drain.',
                'diagnosis'
              )}
            />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            18,420 <span className="text-sm font-semibold text-slate-500">Liters</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-rose-600 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>↑ 8.7% above normal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Normal expected: 16,945 L</p>
        </div>

        {/* KPI 3: Active Anomalies */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Unusual Usage
            </span>
            <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
              Requires Action
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            2 <span className="text-sm font-semibold text-slate-500">problems</span>
          </div>
          <p className="text-xs text-rose-600 font-semibold mt-2">
            1 Electricity • 1 Water
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Both root causes identified</p>
        </div>

        {/* KPI 4: Monthly Cost */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-600" /> Preventable Waste
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              Opportunity
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-700 tracking-tight">
            ₹6,000 <span className="text-sm font-semibold text-slate-500">/mo</span>
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-2">
            ₹72,000 per year recoverable
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero investment fixes</p>
        </div>
      </div>

      {/* DETECTED UNUSUAL CONSUMPTION BANNER */}
      <div 
        id="problem-card-unusual-electricity"
        style={{ backgroundColor: '#18232C', borderColor: '#334450' }}
        className="rounded-3xl p-6 sm:p-7 border shadow-sm relative"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span 
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-xs"
              >
                Unusual Electricity Usage Found
              </span>
              <span style={{ color: '#9EACB8' }} className="text-xs font-medium">
                • Floor 2 AC System
              </span>
              {!isOnline ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  Detected offline • Pending sync
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Synced
                </span>
              )}
            </div>

            <h2 style={{ color: '#F5F7FA' }} className="text-xl sm:text-2xl font-bold">
              Floor 2 is using 27% more electricity than usual
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span style={{ color: '#B8C4CF' }} className="font-medium">Normal baseline:</span>{' '}
                <strong style={{ color: '#B8C4CF' }} className="font-semibold">120 kWh</strong>
              </div>
              <div style={{ color: '#334450' }}>|</div>
              <div>
                <span style={{ color: '#B8C4CF' }} className="font-medium">Actual:</span>{' '}
                <strong style={{ color: '#FF7777' }} className="font-bold">186 kWh</strong>
              </div>
              <div style={{ color: '#334450' }}>|</div>
              <div>
                <span style={{ color: '#B8C4CF' }} className="font-medium">Extra draw:</span>{' '}
                <span 
                  style={{ 
                    color: '#FF7777', 
                    backgroundColor: 'rgba(239, 68, 68, 0.2)', 
                    border: '1px solid rgba(248, 113, 113, 0.35)' 
                  }} 
                  className="font-bold px-2.5 py-0.5 rounded-full inline-block"
                >
                  +27% waste
                </span>
              </div>
              <div style={{ color: '#334450' }}>|</div>
              <div>
                <span style={{ color: '#B8C4CF' }} className="font-medium">AI certainty:</span>{' '}
                <span 
                  style={{ 
                    color: '#5EE6B0', 
                    backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                    border: '1px solid rgba(52, 211, 153, 0.35)' 
                  }} 
                  className="font-bold px-2.5 py-0.5 rounded-full inline-block"
                >
                  95% confidence
                </span>
              </div>
            </div>

            <div className="pt-1">
              <span style={{ color: '#9EACB8' }} className="text-xs font-semibold block mb-1.5">
                Likely cause identified by AI:
              </span>
              <div 
                style={{ 
                  backgroundColor: '#111A22', 
                  borderColor: '#2D3E4C', 
                  color: '#FFFFFF' 
                }} 
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-2xs"
              >
                <span style={{ color: '#FFFFFF' }}>
                  The AC is running several hours after most people leave the building.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {onOpenInvestigation && (
              <button
                onClick={onOpenInvestigation}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Investigate with AI</span>
              </button>
            )}

            <button
              onClick={() => {
                onSelectAnomalyForDiagnosis('anom-1');
                onNavigate('simulation');
              }}
              style={{
                backgroundColor: '#202D3A',
                borderColor: '#334450',
                color: '#F5F7FA'
              }}
              className="px-5 py-2.5 rounded-2xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs hover:bg-[#283847]"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span style={{ color: '#F5F7FA' }}>Simulate savings</span>
            </button>
          </div>
        </div>
      </div>

      {/* 24-HOUR ENERGY CONSUMPTION GRAPH */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Electricity Usage vs Normal Expected Pattern (24-Hour Profile)
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                Overnight Waste Spike
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              The highlighted yellow zone shows unexpected electricity draw while the building is completely empty.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block" />
              <span className="text-slate-600 font-medium">Normal Pattern</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
              <span className="text-slate-900 font-bold">Actual Electricity (kWh)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HOURLY_TIMELINE_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActualEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorBaselineEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit=" kWh" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }} 
                itemStyle={{ color: '#fff' }}
              />
              <ReferenceLine x="02:00" stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Extra AC Waste (+27%)', fill: '#f43f5e', fontSize: 11, position: 'top' }} />
              <Area type="monotone" dataKey="actualEnergy" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActualEnergy)" name="Actual Electricity" />
              <Area type="monotone" dataKey="baselineEnergy" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorBaselineEnergy)" name="Normal Expected Pattern" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* OFFLINE EVENT STORAGE & LOCAL DETECTION SECTION */}
      <div className="bg-white dark:bg-[#15202B] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-[#263747] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-[#223240]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Database className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Local Sensor Telemetry & Offline Event Queue
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E2B37] text-slate-700 dark:text-[#AAB8C5]">
                IndexedDB Store
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8E9FA9] mt-1">
              Events detected through local baseline thresholding (&gt;15% anomaly, &gt;25% high severity). Persisted during outages.
            </p>
          </div>

          <button
            onClick={() => setIsQueueModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2B38] dark:hover:bg-[#283849] text-xs font-bold text-slate-700 dark:text-[#D6E0E9] flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-[#2B3C4C]"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Open Offline Queue</span>
            {pendingEvents.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                {pendingEvents.length} pending
              </span>
            )}
          </button>
        </div>

        {events.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0F171F] border border-dashed border-slate-200 dark:border-[#263745] text-center text-xs text-slate-500 dark:text-[#8E9FA9]">
            <p className="font-semibold text-slate-700 dark:text-[#CBD5E1]">
              Continuous local sensor monitoring is active.
            </p>
            <p className="mt-1 text-[11px]">
              Telemetry readings are evaluated locally every 7 seconds. Toggle &ldquo;Simulate Network Loss&rdquo; in the top bar to test offline anomaly queueing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.slice(0, 4).map((evt) => {
              const isPending = evt.syncStatus === 'pending';
              return (
                <div
                  key={evt.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPending
                      ? 'bg-amber-500/5 dark:bg-[#19222B] border-amber-500/30'
                      : 'bg-slate-50 dark:bg-[#121B23] border-slate-200 dark:border-[#243544]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        evt.resourceType === 'electricity'
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-sky-500/20 text-sky-400'
                      }`}>
                        {evt.resourceType === 'electricity' ? (
                          <Zap className="w-3.5 h-3.5" />
                        ) : (
                          <Droplets className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {evt.floorName} {evt.resourceType === 'electricity' ? 'Electricity' : 'Water'}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-[#8E9FA9]">
                          {evt.timestamp} • {evt.severity === 'high' ? 'High Severity' : 'Moderate Severity'}
                        </span>
                      </div>
                    </div>

                    {/* Exact required offline badge */}
                    {isPending ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                        Detected offline • Pending sync
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                        Synced
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-2 py-1.5 px-2.5 rounded-lg bg-white/60 dark:bg-[#0D151D] border border-slate-200/50 dark:border-[#1E2C38] text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[9px] block">Baseline</span>
                      <strong className="text-slate-700 dark:text-[#CBD5E1]">{evt.expectedBaseline} {evt.unit}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Actual</span>
                      <strong className="text-rose-500 font-bold">{evt.actualConsumption} {evt.unit}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Deviation</span>
                      <strong className="text-rose-500 font-extrabold">+{evt.deviationPercentage}%</strong>
                    </div>
                  </div>

                  {evt.localAnalysis && (
                    <p className="text-[11px] text-slate-600 dark:text-[#BAC7D2] leading-relaxed mb-3">
                      {evt.localAnalysis}
                    </p>
                  )}

                  {onOpenInvestigation && (
                    <button
                      onClick={onOpenInvestigation}
                      className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2B38] dark:hover:bg-[#283949] text-slate-800 dark:text-[#E2E8F0] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-[#2B3C4C]"
                    >
                      <Search className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{isOnline ? 'Investigate with AI' : 'Investigate (Local Analysis)'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
