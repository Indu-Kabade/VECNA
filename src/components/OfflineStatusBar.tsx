import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Zap, 
  Droplets,
  ChevronDown,
  Sparkles,
  Database,
  Radio
} from 'lucide-react';
import { useOffline } from '../context/OfflineContext';

export const OfflineStatusBar: React.FC = () => {
  const {
    networkState,
    isOnline,
    bufferedCount,
    pendingCount,
    lastSyncTime,
    syncProgress,
    statusNotification,
    latestReading,
    simulateNetworkLoss,
    restoreConnection,
    injectAbnormalReading,
    setIsQueueModalOpen,
  } = useOffline();

  const [showDemoDropdown, setShowDemoDropdown] = useState(false);

  return (
    <div className="bg-white dark:bg-[#121B22] border-b border-slate-200 dark:border-[#263642] px-4 sm:px-8 py-2 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Dynamic Connectivity and IoT Gateway Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Status Badge */}
          {networkState === 'SYNCING' ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>
                SYNCING • {syncProgress?.message ?? `Uploading buffered sensor data (${pendingCount} pending)...`}
              </span>
            </div>
          ) : networkState === 'SYNC_ERROR' ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>SYNC ERROR • Some readings could not be uploaded (retrying)</span>
            </div>
          ) : !isOnline ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>OFFLINE • Sensors still collecting • Local buffer active</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>ONLINE • Live synchronization active</span>
            </div>
          )}

          {/* Buffer & Sync Stats Display */}
          <div className="hidden lg:flex items-center gap-3 border-l border-slate-200 dark:border-[#263642] pl-3 text-slate-500 dark:text-[#8E9FA9]">
            <span className="inline-flex items-center gap-1">
              <Database className="w-3 h-3 text-slate-400" />
              <span>Local buffer:</span>
              <strong className="font-mono text-slate-700 dark:text-slate-200">{bufferedCount}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="inline-flex items-center gap-1">
              <span>Pending sync:</span>
              <strong className={`font-mono ${pendingCount > 0 ? 'text-amber-500 font-black' : 'text-emerald-500'}`}>
                {pendingCount}
              </strong>
            </span>
            {lastSyncTime && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>
                  Last sync: <span className="font-mono text-slate-600 dark:text-slate-300">{lastSyncTime}</span>
                </span>
              </>
            )}
          </div>

          {/* Live Sensor Stream Ping */}
          {latestReading && (
            <div className="hidden xl:flex items-center gap-2 text-slate-500 dark:text-[#8E9FA9] border-l border-slate-200 dark:border-[#263642] pl-3">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium font-mono">{latestReading.sensorId}:</span>
              <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-[#C5D2DC] flex items-center gap-1">
                {latestReading.resourceType === 'electricity' ? (
                  <Zap className="w-3 h-3 text-amber-500" />
                ) : (
                  <Droplets className="w-3 h-3 text-sky-400" />
                )}
                {latestReading.value} {latestReading.unit}
              </span>
              {latestReading.isAnomaly && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold">
                  +{latestReading.deviationPercentage}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions, Demo Dropdown and Primary Mode Switch */}
        <div className="flex items-center gap-2">
          {/* Offline Queue Modal Trigger */}
          <button
            id="open-offline-queue-btn"
            onClick={() => setIsQueueModalOpen(true)}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2C37] dark:hover:bg-[#283947] text-slate-700 dark:text-[#D7E0E7] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-[#2D3F4F]"
            title="Inspect persistent IndexedDB buffer"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Local Buffer</span>
            {pendingCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                {pendingCount}
              </span>
            ) : (
              <span className="text-emerald-500 font-bold text-[10px]">0</span>
            )}
          </button>

          {/* Simulate Reading / Inject Anomaly dropdown */}
          <div className="relative">
            <button
              id="simulate-reading-dropdown-btn"
              onClick={() => setShowDemoDropdown((prev) => !prev)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2C37] dark:hover:bg-[#283947] text-slate-700 dark:text-[#D7E0E7] font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-200 dark:border-[#2D3F4F]"
              title="Inject abnormal IoT readings"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Simulate Reading</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showDemoDropdown && (
              <div 
                className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-[#1A2530] border border-slate-200 dark:border-[#2B3C4B] rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowDemoDropdown(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#8E9FA9]">
                  Inject Telemetry Event ({isOnline ? 'Online' : 'Offline'} Mode)
                </div>

                {/* STEP 4 Requirement Scenario */}
                <button
                  id="inject-step4-reading-btn"
                  onClick={() => injectAbnormalReading({ resource: 'electricity', floor: 2, actualValue: 186, sensorId: 'ELEC_F2_07' })}
                  className="w-full text-left px-2.5 py-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 flex items-center justify-between text-xs text-rose-950 dark:text-rose-100 cursor-pointer"
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Floor 2 Electricity (+55%)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                      186 kWh vs 120 baseline (Step 4 Demo)
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500 text-white">
                    Step 4
                  </span>
                </button>

                <button
                  onClick={() => injectAbnormalReading({ resource: 'water', floor: 4, actualValue: 155, sensorId: 'WATER_F4_03' })}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#253443] flex items-center justify-between text-xs text-slate-700 dark:text-[#E2E8F0] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span>Floor 4 Water (+19% / 155 L/h)</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-500">Med</span>
                </button>

                <button
                  onClick={() => injectAbnormalReading({ resource: 'electricity', floor: 2, actualValue: 153, sensorId: 'ELEC_F2_07' })}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#253443] flex items-center justify-between text-xs text-slate-700 dark:text-[#E2E8F0] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Floor 2 Electricity (+27%)</span>
                  </span>
                  <span className="text-[10px] font-bold text-rose-500">High</span>
                </button>
              </div>
            )}
          </div>

          {/* Core Demo Mode Switch: Simulate Network Loss / Restore Connection */}
          {isOnline ? (
            <button
              id="simulate-network-loss-btn"
              onClick={simulateNetworkLoss}
              className="px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <WifiOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Simulate Network Loss</span>
            </button>
          ) : (
            <button
              id="restore-connection-btn"
              onClick={restoreConnection}
              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs animate-pulse"
            >
              <Wifi className="w-3.5 h-3.5 text-white" />
              <span>Restore Connection</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Status Notification Ribbon (when network transitions or anomalies appear) */}
      {statusNotification && (
        <div className="max-w-7xl mx-auto mt-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-black/90 text-white text-[11px] font-medium flex items-center justify-between shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{statusNotification}</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Local Gateway</span>
        </div>
      )}
    </div>
  );
};
