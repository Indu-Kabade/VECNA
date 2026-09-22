import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  IndianRupee, 
  Leaf, 
  Droplets, 
  TrendingDown, 
  Award, 
  ArrowRight, 
  Info,
  Sparkles,
  RefreshCw,
  Gauge
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { PageId } from '../types';
import { VERIFICATION_DATA } from '../data/mockBuildingData';
import { WhyButton, WhyExplanation } from '../components/WhyModal';

interface VerificationPageProps {
  onNavigate: (page: PageId) => void;
  isInterventionApplied?: boolean;
  onOpenWhy?: (data: WhyExplanation) => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ 
  onNavigate,
  isInterventionApplied = false,
  onOpenWhy
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(100);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const triggerWhy = (title: string, metric: string, explanation: string, detail?: string, actionHint?: string) => {
    if (onOpenWhy) {
      onOpenWhy({ title, metric, explanation, detail, actionHint });
    }
  };

  const comparisonData = [
    {
      label: 'Monthly Draw (kWh)',
      'Before (Unoptimized)': 1420,
      'Predicted Fix': 1025,
      'Actual Meter Reading': 1025,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Closing the AI Loop
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">• Independent Meter Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Real Meter Proof: Did we actually save?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            VECNA compares actual smart sub-meter readings before and after the AC schedule fix to prove real savings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('report')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <span>Sustainability Report</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
          </button>
        </div>
      </div>

      {/* "WOW" ANIMATED HERO VERIFICATION BANNER */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow FX */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              STATUS: VERIFIED
            </span>
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
              30-Day IoT Continuous Audit • Floor 2 AC System
            </span>
          </div>

          <div className="flex items-center gap-2">
            <WhyButton
              onClick={() => triggerWhy(
                'How VECNA Verifies Savings',
                '395 kWh Verified (-27.8%)',
                'By comparing the pre-fix 1,420 kWh monthly meter reading with the current 1,025 kWh meter reading after adjusting AC hours to 7 AM – 7 PM.',
                'Because temperature and people counts were identical in both periods, 100% of the drop is verified genuine.',
                'report'
              )}
            />
          </div>
        </div>

        {/* 3 COMPARATIVE PILLARS: BEFORE / PREDICTED / ACTUAL (Requirement 5) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 relative z-10">
          {/* Card 1: BEFORE */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-rose-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-300 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800/40">
                BEFORE
              </span>
              <span className="text-rose-400 text-xs font-semibold">Unoptimized</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-3">
              1,420 <span className="text-base text-slate-400 font-bold">kWh</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Old monthly consumption with AC running throughout the night without occupants.
            </p>
          </div>

          {/* Card 2: PREDICTED */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-teal-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-800/40">
                PREDICTED
              </span>
              <span className="text-teal-400 text-xs font-semibold">Digital Twin Model</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-teal-300 mt-3">
              1,025 <span className="text-base text-teal-400/70 font-bold">kWh</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Simulation forecasted a 395 kWh cut by shutting off AC when rooms empty at 7:00 PM.
            </p>
          </div>

          {/* Card 3: ACTUAL (THE WOW RESULT) */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-slate-900 border-2 border-emerald-400/80 shadow-lg shadow-emerald-500/10 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-950 bg-emerald-400 px-2.5 py-0.5 rounded-full">
                ACTUAL METER
              </span>
              <span className="text-emerald-300 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Live Sensor Confirmed
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-3 flex items-baseline gap-2">
              <span>1,025</span>
              <span className="text-base text-emerald-300 font-bold">kWh</span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-2 font-medium">
              Real smart meter reading completely matched the predicted savings!
            </p>
          </div>
        </div>

        {/* Central Savings Highlight Card (Savings: 395 kWh (-27.8%), Status: VERIFIED) */}
        <div className="mt-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-900/60 via-teal-900/40 to-slate-900 border border-emerald-500/30 flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1 text-center lg:text-left">
            <div className="text-xs uppercase tracking-widest font-black text-emerald-400">
              Verified Monthly Reduction
            </div>
            <div className="text-3xl sm:text-5xl font-black text-white flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span>Savings: 395 kWh</span>
              <span className="text-2xl sm:text-3xl text-emerald-400 font-extrabold">(-27.8%)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Closing the loop between AI investigation and guaranteed, real-world utility bill cuts.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Money Saved</div>
              <div className="text-xl font-black text-emerald-400">₹3,950 / mo</div>
            </div>
            <div className="px-5 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Carbon Cut</div>
              <div className="text-xl font-black text-teal-300">197.5 kg CO₂</div>
            </div>
          </div>
        </div>

        {/* Verification Methodology */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/50 p-4 rounded-xl relative z-10">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Audit Methodology:</strong> "{VERIFICATION_DATA.methodologyNote}"
          </p>
        </div>
      </div>

      {/* VISUAL CHART & 5-STAGE PROTOCOL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Bar Chart of Before / Predicted / Actual */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Electricity Consumption Comparison
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualizing the drop from baseline down to verified actuals.
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis unit=" kWh" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 1600]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Before (Unoptimized)" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Predicted Fix" fill="#0d9488" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Actual Meter Reading" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: 5-Stage Story Steps */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5-Stage Verification Protocol
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How VECNA closed the loop end-to-end.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {VERIFICATION_DATA.timelineSteps.map((step, idx) => (
              <div
                key={step.title}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      STAGE 0{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{step.title}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">• {step.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pt-0.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
