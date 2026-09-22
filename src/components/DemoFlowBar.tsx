import React from 'react';
import { PageId } from '../types';
import { 
  Building2, 
  AlertTriangle, 
  Search, 
  Sparkles, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';

interface DemoFlowBarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isInterventionApplied?: boolean;
}

export const DemoFlowBar: React.FC<DemoFlowBarProps> = ({
  currentPage,
  onNavigate,
  isInterventionApplied = false,
}) => {
  const steps: { id: PageId; label: string; sub: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'twin', label: 'Building', sub: 'Floor View', icon: Building2 },
    { id: 'insights', label: 'Problem', sub: 'Floor 2 +27%', icon: AlertTriangle },
    { id: 'diagnosis', label: 'Cause', sub: 'AC After Hours', icon: Search },
    { id: 'recommendations', label: 'Solution', sub: 'Action Plan', icon: Sparkles },
    { id: 'simulation', label: 'Simulation', sub: 'AC Slider', icon: Sliders },
    { id: 'verification', label: 'Verified Savings', sub: '395 kWh Saved', icon: CheckCircle2 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 py-2.5 overflow-x-auto shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[700px] gap-2">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 pr-2 border-r border-slate-200 dark:border-slate-800">
          <span>AI Story:</span>
        </div>

        <div className="flex items-center justify-between flex-1 gap-1">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentPage === step.id;
            const isFinished = 
              (step.id === 'verification' && isInterventionApplied) ||
              (step.id === 'simulation' && isInterventionApplied);

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => onNavigate(step.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs scale-102'
                      : isFinished
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive 
                      ? 'bg-emerald-500 dark:bg-emerald-400 text-slate-950' 
                      : isFinished 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight flex items-center gap-1">
                      <span>{step.label}</span>
                      {step.id === 'insights' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </div>
                    <div className={`text-[10px] leading-none ${isActive ? 'text-slate-300 dark:text-emerald-100' : 'text-slate-400 dark:text-slate-400'}`}>
                      {step.sub}
                    </div>
                  </div>
                </button>

                {idx < steps.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
