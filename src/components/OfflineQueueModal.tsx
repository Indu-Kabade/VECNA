import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Zap, 
  Droplets, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  WifiOff, 
  Wifi, 
  RefreshCw,
  Database,
  ArrowUpRight,
  Radio,
  Sliders,
  Thermometer,
  Users
} from 'lucide-react';
import { useOffline } from '../context/OfflineContext';

export const OfflineQueueModal: React.FC = () => {
  const {
    isQueueModalOpen,
    setIsQueueModalOpen,
    readingsStream,
    anomalyEvents,
    events,
    pendingEvents,
    syncedEvents,
    bufferedCount,
    pendingCount,
    isOnline,
    triggerSyncNow,
    syncState,
    networkState,
  } = useOffline();

  const [activeTab, setActiveTab] = useState<'anomalies' | 'readings'>('anomalies');

  if (!isQueueModalOpen) return null;

  const pendingReadingsCount = readingsStream.filter((r) => r.syncStatus === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#18242F] border border-slate-200 dark:border-[#2B3C4B] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-900 dark:text-[#F5F7FA] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#2B3C4B] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-[#101820] text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-[#263644] flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Local Sensor Gateway • IndexedDB Storage
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#233342] text-slate-600 dark:text-[#A7B7C5] font-mono">
                  ecotwin_offline_db
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Buffered Telemetry & Anomaly Queue
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsQueueModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-[#AAB7C4] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#202E3B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Architecture Pipeline Banner */}
        <div className="my-3 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#111922] border border-slate-200 dark:border-[#233443] flex items-center justify-between text-[11px] text-slate-600 dark:text-[#9FB1C1] font-mono shrink-0 overflow-x-auto">
          <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
            <Radio className="w-3 h-3 text-emerald-500" />
            IoT Sensors
          </span>
          <span className="text-slate-400">→</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Local Gateway (IndexedDB)
          </span>
          <span className="text-slate-400">→</span>
          <span className={`font-semibold ${pendingCount > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
            Pending Queue ({pendingCount})
          </span>
          <span className="text-slate-400">→</span>
          <span className="font-semibold text-sky-500">
            Cloud Firestore
          </span>
          <span className="text-slate-400">→</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            Vecna Dashboard
          </span>
        </div>

        {/* Status Summary Banner */}
        <div className="mb-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121B22] border border-slate-200 dark:border-[#263745] flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-500 dark:text-[#8E9FA9]">
              Gateway Network State
            </div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              {networkState === 'SYNCING' ? (
                <span className="flex items-center gap-1.5 text-amber-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing with Cloud Firestore...</span>
                </span>
              ) : isOnline ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Wifi className="w-4 h-4" />
                  <span>ONLINE • Live synchronization active</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-500">
                  <WifiOff className="w-4 h-4" />
                  <span>OFFLINE • Sensors buffering in local storage</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="text-right">
              <span className="text-slate-400 text-[11px] block">Buffered in DB</span>
              <span className="text-slate-800 dark:text-white font-extrabold text-sm">{bufferedCount}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[11px] block">Pending Sync</span>
              <span className="text-amber-500 font-extrabold text-sm">{pendingCount}</span>
            </div>
            {isOnline && pendingCount > 0 && (
              <button
                onClick={triggerSyncNow}
                disabled={syncState === 'syncing'}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#263745] pb-2 mb-3 shrink-0">
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'anomalies'
                ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-slate-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-[#8E9FA9] dark:hover:text-white'
            }`}
          >
            Anomalies ({events.length})
            {pendingEvents.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px]">
                {pendingEvents.length} pending
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('readings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'readings'
                ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-slate-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-[#8E9FA9] dark:hover:text-white'
            }`}
          >
            Raw Telemetry Stream ({readingsStream.length})
            {pendingReadingsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px]">
                {pendingReadingsCount}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'anomalies' ? (
            events.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-[#8E9FA9]">
                <Database className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">No anomaly events in IndexedDB buffer.</p>
                <p className="text-xs mt-1">
                  Click &ldquo;Simulate Reading &gt; Step 4&rdquo; while offline to generate local anomaly.
                </p>
              </div>
            ) : (
              events.map((evt) => {
                const isPending = evt.syncStatus === 'pending';
                return (
                  <div
                    key={evt.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isPending
                        ? 'bg-amber-500/5 dark:bg-[#1E252D] border-amber-500/30'
                        : 'bg-white dark:bg-[#131E27] border-slate-200 dark:border-[#253644]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          evt.resourceType === 'electricity'
                            ? 'bg-amber-500/20 text-amber-500'
                            : 'bg-sky-500/20 text-sky-400'
                        }`}>
                          {evt.resourceType === 'electricity' ? (
                            <Zap className="w-4 h-4" />
                          ) : (
                            <Droplets className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {evt.floorName} {evt.resourceType === 'electricity' ? 'Electricity' : 'Water'}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              evt.severity === 'high'
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            }`}>
                              {evt.severity === 'high' ? 'High Severity' : 'Moderate Severity'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-[#8E9FA9]">
                            {evt.building} • {evt.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Sync Status Badge */}
                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>Captured Offline • Pending Sync</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Synced to Cloud</span>
                            {evt.syncedAt && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                                ({evt.syncedAt})
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs py-2 px-3 rounded-xl bg-slate-100/70 dark:bg-[#0D151C] border border-slate-200/60 dark:border-[#1E2B37]">
                      <div>
                        <span className="text-slate-500 dark:text-[#8E9FA9] block text-[10px]">Expected Baseline</span>
                        <strong className="font-bold text-slate-800 dark:text-[#CBD5E1]">
                          {evt.expectedBaseline} {evt.unit}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-[#8E9FA9] block text-[10px]">Actual Measured</span>
                        <strong className="font-bold text-rose-600 dark:text-rose-400">
                          {evt.actualConsumption} {evt.unit}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-[#8E9FA9] block text-[10px]">Deviation</span>
                        <strong className="font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          +{evt.deviationPercentage}%
                        </strong>
                      </div>
                    </div>

                    {/* Deterministic Local Fallback Explanation */}
                    {evt.localAnalysis && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E171E] border border-slate-200 dark:border-[#22313E] text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-emerald-400 uppercase tracking-wider">
                          <span>{evt.detectedOffline ? 'LOCAL FALLBACK ANALYSIS' : 'GATEWAY ANALYSIS'}:</span>
                        </div>
                        <p className="text-slate-700 dark:text-[#D1DCE5] leading-relaxed">
                          {evt.localAnalysis}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )
          ) : (
            // Raw Readings Stream Tab
            readingsStream.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-[#8E9FA9]">
                <Radio className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">No telemetry readings recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {readingsStream.slice(0, 30).map((reading) => (
                  <div
                    key={reading.readingId}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#121C24] border border-slate-200 dark:border-[#223342] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-200/60 dark:bg-[#1E2B38] flex items-center justify-center">
                        {reading.resourceType === 'electricity' ? (
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                        ) : reading.resourceType === 'water' ? (
                          <Droplets className="w-3.5 h-3.5 text-sky-400" />
                        ) : reading.resourceType === 'temperature' ? (
                          <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                        ) : reading.resourceType === 'occupancy' ? (
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {reading.sensorId}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-[#8E9FA9]">
                            Floor {reading.floor} • {reading.timestamp}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                          {reading.value} {reading.unit}
                          {reading.isAnomaly && (
                            <span className="ml-2 text-rose-500 font-bold">
                              (+{reading.deviationPercentage}% deviation)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        reading.networkStatus === 'offline'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {reading.networkStatus}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        reading.syncStatus === 'synced'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : reading.syncStatus === 'syncing'
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-200 dark:bg-[#253644] text-slate-600 dark:text-slate-300'
                      }`}>
                        {reading.syncStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-2 border-t border-slate-200 dark:border-[#2B3C4B] flex items-center justify-between text-xs text-slate-500 dark:text-[#8E9FA9] shrink-0">
          <span>Persists in IndexedDB across page refreshes and browser restarts.</span>
          <button
            onClick={() => setIsQueueModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-slate-950 font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
