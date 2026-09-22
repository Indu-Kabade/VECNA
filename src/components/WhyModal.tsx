import React from 'react';
import { Sparkles, X, Lightbulb, ArrowRight } from 'lucide-react';

export interface WhyExplanation {
  title: string;
  metric: string;
  explanation: string;
  detail?: string;
  actionHint?: string;
}

interface WhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WhyExplanation | null;
  onAction?: () => void;
  actionLabel?: string;
}

export const WhyModal: React.FC<WhyModalProps> = ({
  isOpen,
  onClose,
  data,
  onAction,
  actionLabel,
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-[#1B2732] border border-slate-200 dark:border-[#263642] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-900 dark:text-[#F5F7FA] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-[rgba(16,185,129,0.15)] text-emerald-700 dark:text-[#5EE6B0] flex items-center justify-center border border-emerald-200 dark:border-[rgba(52,211,153,0.35)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-[#5EE6B0]">
                VECNA AI Explanation
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F7FA]">{data.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 dark:text-[#AAB7C4] hover:text-slate-700 dark:hover:text-[#F5F7FA] hover:bg-slate-100 dark:hover:bg-[#202D3A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metric Highlight */}
        <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-[#151F27] border border-slate-200/80 dark:border-[#263642] flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-[#AAB7C4] font-medium">Observed Value:</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-[#F5F7FA] bg-white dark:bg-[#1B2732] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#384C5C] shadow-2xs">
            {data.metric}
          </span>
        </div>

        {/* Primary Explanation */}
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-[#D6DEE6]">
          <p className="font-semibold text-slate-900 dark:text-[#F5F7FA] text-sm">
            {data.explanation}
          </p>
          {data.detail && (
            <p className="text-slate-600 dark:text-[#D6DEE6] bg-emerald-50/50 dark:bg-[rgba(16,185,129,0.15)] p-3 rounded-xl border border-emerald-100 dark:border-[rgba(52,211,153,0.3)] flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-[#5EE6B0] shrink-0 mt-0.5" />
              <span>{data.detail}</span>
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-[#263642]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#AAB7C4] hover:bg-slate-100 dark:hover:bg-[#202D3A] dark:hover:text-[#F5F7FA] transition-colors cursor-pointer"
          >
            Got it
          </button>
          {onAction && actionLabel && (
            <button
              onClick={() => {
                onClose();
                onAction();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400 dark:text-slate-950" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const WhyButton: React.FC<{
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}> = ({ onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-[#5EE6B0] bg-emerald-50 dark:bg-[rgba(16,185,129,0.15)] hover:bg-emerald-100 dark:hover:bg-[rgba(16,185,129,0.25)] border border-emerald-200/80 dark:border-[rgba(52,211,153,0.35)] px-2 py-0.5 rounded-md transition-all hover:scale-105 cursor-pointer shadow-2xs ${className}`}
      title="Click to view why VECNA detected this"
    >
      <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-[#5EE6B0]" />
      <span>Why?</span>
    </button>
  );
};
