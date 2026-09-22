import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Droplets, 
  IndianRupee, 
  Building2, 
  Layers, 
  AlertTriangle, 
  User, 
  CloudCheck, 
  CloudOff,
  Calendar,
  Check
} from 'lucide-react';
import { AppliedSolutionRecord } from '../types';

interface SolutionDetailModalProps {
  solution: AppliedSolutionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus?: (solutionId: string, currentStatus: 'Active' | 'Completed') => void;
}

export const SolutionDetailModal: React.FC<SolutionDetailModalProps> = ({
  solution,
  isOpen,
  onClose,
  onToggleStatus,
}) => {
  if (!isOpen || !solution) return null;

  const isElectricity = solution.resourceType === 'electricity';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="solution-detail-modal"
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isElectricity 
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
              }`}>
                {isElectricity ? <Zap className="w-3.5 h-3.5" /> : <Droplets className="w-3.5 h-3.5" />}
                <span>{solution.resourceType}</span>
              </span>

              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                solution.status === 'Active'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${solution.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{solution.status}</span>
              </span>

              {solution.syncStatus === 'pending' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Clock className="w-3 h-3" />
                  <span>Pending Sync</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Synced</span>
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white pt-1">
              {solution.solutionName}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{solution.buildingId}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>{solution.floor}</span>
              </span>
            </div>
          </div>

          <button
            id="close-solution-detail-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Problem Detected */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-800 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Problem Detected</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {solution.problemDescription}
            </p>
          </div>

          {/* Applied Action */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Applied Action</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {solution.solutionDescription}
            </p>
          </div>

          {/* Estimated Savings Matrix */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              Estimated Monthly Savings
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Monthly Bill Cut</span>
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  ₹{solution.estimatedSavingsRupees.toLocaleString()}
                  <span className="text-xs font-semibold text-slate-500">/mo</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ₹{(solution.estimatedSavingsRupees * 12).toLocaleString()} / year projected
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Resource Saved</span>
                  {isElectricity ? <Zap className="w-4 h-4 text-amber-500" /> : <Droplets className="w-4 h-4 text-sky-500" />}
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {solution.estimatedSavingsKwh.toLocaleString()}
                  <span className="text-xs font-semibold text-slate-500"> {isElectricity ? 'kWh/mo' : 'L/mo'}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isElectricity ? `${(solution.estimatedSavingsKwh * 12).toLocaleString()} kWh / year` : `${(solution.estimatedSavingsKwh * 12).toLocaleString()} L / year`}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Applied At</span>
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {solution.appliedAt}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>Applied By</span>
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {solution.appliedBy || 'VECNA Operator'}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-slate-400 font-semibold">Solution ID</span>
              <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate">
                {solution.solutionId}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-slate-400 font-semibold">Persistence Source</span>
              <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                {solution.syncStatus === 'synced' ? 'Cloud Firestore (Verified)' : 'IndexedDB (Local Store)'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {onToggleStatus && (
            <button
              type="button"
              id="toggle-solution-status-btn"
              onClick={() => onToggleStatus(solution.solutionId, solution.status)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Mark as {solution.status === 'Active' ? 'Completed' : 'Active'}
            </button>
          )}

          <button
            type="button"
            id="close-solution-modal-btn"
            onClick={onClose}
            className="ml-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
