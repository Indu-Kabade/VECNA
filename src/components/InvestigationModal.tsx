import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  X, 
  IndianRupee, 
  Clock,
  WifiOff,
  Cpu
} from 'lucide-react';
import { useOffline } from '../context/OfflineContext';

interface InvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSimulation: () => void;
  onNavigateToDiagnosis: () => void;
}

const ONLINE_INVESTIGATION_STEPS = [
  { text: 'Checking electricity usage...', delay: 600 },
  { text: 'Comparing with normal patterns...', delay: 700 },
  { text: 'Checking building activity...', delay: 700 },
  { text: 'Looking for unusual behavior...', delay: 700 },
  { text: 'Problem found.', delay: 500 },
];

const OFFLINE_INVESTIGATION_STEPS = [
  { text: 'Checking local sensor cache (IndexedDB)...', delay: 500 },
  { text: 'Comparing against stored building baselines...', delay: 600 },
  { text: 'Calculating abnormal consumption locally...', delay: 600 },
  { text: 'Executing local fallback anomaly algorithm...', delay: 600 },
  { text: 'Deterministic local pattern resolved.', delay: 400 },
];

export const InvestigationModal: React.FC<InvestigationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSimulation,
  onNavigateToDiagnosis,
}) => {
  const { isOnline, latestTelemetry, pendingEvents } = useOffline();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const steps = isOnline ? ONLINE_INVESTIGATION_STEPS : OFFLINE_INVESTIGATION_STEPS;

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsComplete(false);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const runSteps = (step: number) => {
      if (!isMounted) return;
      if (step < steps.length) {
        setCurrentStepIndex(step);
        timeoutId = setTimeout(() => {
          runSteps(step + 1);
        }, steps[step].delay);
      } else {
        setIsComplete(true);
      }
    };

    runSteps(0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isOpen, steps]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#1B2732] border border-slate-200 dark:border-[#263642] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-900 dark:text-[#F5F7FA] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Banner */}
        <div className={`absolute top-0 left-0 right-0 h-2 ${
          isOnline
            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
            : 'bg-gradient-to-r from-amber-500 via-rose-500 to-orange-500'
        }`} />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#263642]">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
              isOnline
                ? 'bg-slate-900 dark:bg-[#151F27] text-emerald-400 dark:text-[#5EE6B0] border border-transparent dark:border-[#263642]'
                : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
            }`}>
              {isOnline ? (
                <Search className="w-5 h-5 animate-pulse" />
              ) : (
                <Cpu className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isOnline
                    ? 'text-emerald-700 dark:text-[#5EE6B0]'
                    : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {isOnline ? 'AI Investigation' : 'Local Fallback Engine'}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                }`} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-[#F5F7FA]">
                {isOnline ? 'VECNA Building Detective' : 'VECNA Offline Diagnostic'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 dark:text-[#AAB7C4] hover:text-slate-700 dark:hover:text-[#F5F7FA] hover:bg-slate-100 dark:hover:bg-[#202D3A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Status Warning Pill */}
        {!isOnline && (
          <div className="mt-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>AI service unavailable — running local analysis</span>
          </div>
        )}

        {/* Body: Animation or Revealed Findings */}
        <div className="py-6">
          {!isComplete ? (
            /* Running Investigation Steps Animation */
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center justify-center text-center space-y-3 py-6">
                <div className="relative flex items-center justify-center">
                  <div className={`w-16 h-16 rounded-full border-4 border-t-emerald-600 dark:border-t-[#5EE6B0] animate-spin ${
                    isOnline
                      ? 'border-emerald-100 dark:border-[#263642]'
                      : 'border-amber-100 dark:border-[#33261a]'
                  }`} />
                  {isOnline ? (
                    <Sparkles className="w-6 h-6 text-emerald-600 dark:text-[#5EE6B0] absolute" />
                  ) : (
                    <Cpu className="w-6 h-6 text-amber-600 dark:text-amber-400 absolute" />
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-500 dark:text-[#AAB7C4]">
                  {isOnline
                    ? 'Scanning 128 sensors and comparing historical patterns...'
                    : 'Processing local telemetry against stored baselines...'}
                </p>
              </div>

              {/* Progress Steps List */}
              <div className="space-y-2 bg-slate-50 dark:bg-[#151F27] p-4 rounded-2xl border border-slate-100 dark:border-[#263642]">
                {steps.map((step, idx) => {
                  const isPast = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={step.text}
                      className={`flex items-center gap-3 text-xs transition-all duration-200 ${
                        isCurrent
                          ? 'text-slate-900 dark:text-[#F5F7FA] font-bold translate-x-1'
                          : isPast
                          ? 'text-emerald-700 dark:text-[#5EE6B0] font-medium'
                          : 'text-slate-400 dark:text-[#66737F] opacity-70'
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {isPast ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#5EE6B0]" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-[#5EE6B0] animate-ping" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#384C5C]" />
                        )}
                      </div>
                      <span>{step.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Revealed Findings */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Finding Alert Banner */}
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-[rgba(239,68,68,0.15)] border border-rose-200/80 dark:border-[rgba(248,113,113,0.35)]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 dark:bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-[#FF7B7B]">
                        Unusual Electricity Usage Detected
                      </span>
                      {!isOnline && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          LOCAL FALLBACK ANALYSIS
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-[#F5F7FA] mt-0.5">
                      Floor 2 is using 27% more electricity than usual.
                    </h4>
                  </div>
                </div>
              </div>

              {/* Cause Explanation */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#151F27] border border-slate-200 dark:border-[#263642] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-[#5EE6B0]">
                  {isOnline ? (
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#5EE6B0]" />
                  ) : (
                    <Cpu className="w-4 h-4 text-amber-500" />
                  )}
                  <span>{isOnline ? 'Likely reason (AI Analysis):' : 'LOCAL FALLBACK ANALYSIS:'}</span>
                </div>
                <p className="text-sm text-slate-800 dark:text-[#F5F7FA] font-medium leading-relaxed pl-6">
                  {!isOnline
                    ? "Floor 2 electricity consumption is 27% above its normal baseline. The increase occurred during the building's low-occupancy period. This suggests unnecessary HVAC or equipment runtime."
                    : "The AC is running several hours after most people leave."}
                </p>
                <div className="text-[11px] text-slate-500 dark:text-[#AAB7C4] pl-6 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-[#82909D]" />
                  <span>
                    {!isOnline
                      ? 'Local sensor evaluation: baseline 120 kWh vs measured 186 kWh. Evaluated offline without cloud API.'
                      : 'Floor was empty after 8:00 PM, but AC kept cooling at full power until 2:00 AM.'}
                  </span>
                </div>
              </div>

              {/* Estimated Savings */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.15)] border border-emerald-200 dark:border-[rgba(52,211,153,0.35)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-[#5EE6B0] tracking-wider">
                      Recommended Action Savings
                    </span>
                    <div className="text-lg font-black text-emerald-950 dark:text-[#F5F7FA]">
                      ₹4,200 / month
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-[#151F27] border border-emerald-300 dark:border-[rgba(52,211,153,0.4)] text-emerald-800 dark:text-[#5EE6B0] shadow-2xs">
                  -395 kWh/mo
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isComplete && (
          <div className="pt-4 border-t border-slate-100 dark:border-[#263642] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => {
                onClose();
                onNavigateToDiagnosis();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#263642] hover:bg-slate-100 dark:hover:bg-[#202D3A] text-xs font-bold text-slate-700 dark:text-[#D6DEE6] dark:hover:text-[#F5F7FA] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>See Cause Details</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateToSimulation();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:gap-2.5 cursor-pointer"
            >
              <span>Simulate AC Schedule Fix</span>
              <ArrowRight className="w-4 h-4 text-emerald-400 dark:text-slate-950" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
