import React from 'react';
import { 
  Building2, 
  Cpu, 
  Database, 
  Activity, 
  Search, 
  Sparkles, 
  Sliders, 
  Wrench, 
  CheckCircle2, 
  ArrowDown, 
  ArrowRight, 
  ShieldAlert, 
  Zap, 
  Droplets,
  Layers,
  ChevronRight
} from 'lucide-react';
import { PageId } from '../types';
import { VecnaLogo } from '../components/VecnaLogo';

interface HowItWorksPageProps {
  onNavigate: (page: PageId) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const architectureSteps = [
    {
      title: 'Building Sensors',
      desc: '128 IoT smart submeters, flow sensors, VFD current transformers, PIR occupancy nodes, and thermistors streaming high-frequency data.',
      icon: Cpu,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      title: 'Data Layer',
      desc: 'Edge gateways aggregate telemetry over BACnet IP, Modbus RTU, and Zigbee mesh into time-series pipelines with 90-day rolling baseline caching.',
      icon: Database,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
    },
    {
      title: 'AI Anomaly Detection',
      desc: 'Statistical residuals and gradient boosting models compare real-time draw against dynamic weather-adjusted heating/cooling baselines.',
      icon: Activity,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      title: 'Root Cause Analysis',
      desc: 'Bayesian fault decomposition correlates multi-modal evidence (occupancy schedules, ERP calendars, temperature deltas) to isolate the true cause.',
      icon: Search,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      title: 'Intervention Recommendation',
      desc: 'Generates engineering playbooks with expected kilowatt-hour reductions, payback timelines, and direct setpoint adjustment scripts.',
      icon: Sparkles,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Simulation',
      desc: 'Digital twin physics sandbox allows facility directors to test what-if operational variables and predict outcome curves before deploying changes.',
      icon: Sliders,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      title: 'Real-world Intervention',
      desc: 'Automated BMS setpoint transmission or guided work orders dispatched to technicians (e.g. valve replacements, schedule reprogram).',
      icon: Wrench,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      title: 'Savings Verification',
      desc: 'Post-intervention submeter measurements are audited against standardized IPMVP Option C models to certify genuine recurring savings.',
      icon: CheckCircle2,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
          Platform Architecture & Methodology
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-3">
          <VecnaLogo size={36} showBackground={true} />
          <span>How VECNA Eliminates Building Resource Waste</span>
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          From raw IoT telemetry to certified rupee and carbon reductions: an 8-stage automated intelligence pipeline closing the gap between detection and verified savings.
        </p>
      </div>

      {/* WHY VECNA SECTION (Visually Striking Side-by-Side Comparison required by prompt) */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
            The Fundamental Paradigm Shift
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Why VECNA?</h2>
          <p className="text-xs text-slate-400 mt-2">
            Most smart building tools stop at alerts. VECNA provides causal explanations, actionable fixes, and independent proof of savings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Traditional Dashboard Card */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-rose-500/30 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Traditional Dashboards</span>
                </div>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">
                  Passive Alarm
                </span>
              </div>

              <div className="my-5 p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                <p className="text-xs text-slate-400 font-medium">What they tell you:</p>
                <p className="text-lg sm:text-xl font-extrabold text-rose-300 mt-1 italic">
                  "Energy consumption increased."
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>No location specificity (which floor or sub-zone?)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>No causal explanation (why is it running?)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Zero guidance on what technicians should adjust</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>No audit verifying whether money was actually saved</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-700/60 text-[11px] text-slate-400">
              Outcome: Alarm fatigue, manual spreadsheet digging, persistent waste.
            </div>
          </div>

          {/* VECNA Card */}
          <div className="bg-gradient-to-br from-slate-800/90 to-emerald-950/40 rounded-2xl p-6 border border-emerald-500/50 shadow-lg flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>VECNA Intelligence</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                  Autonomous M&V
                </span>
              </div>

              <div className="my-5 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                <p className="text-xs text-emerald-400 font-semibold">What VECNA tells you:</p>
                <p className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                  "Energy consumption increased by 27%, likely because HVAC continued operating after occupancy hours. Adjusting the schedule could save approximately 420 kWh/month."
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Precise zone localization: Floor 2 AHU-2 submeter</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Root cause proven with 5 multi-sensor evidence streams</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Interactive simulation predicts exact rupee & carbon impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Post-fix meter data verified with IPMVP standard</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-emerald-500/30 flex items-center justify-between">
              <span className="text-[11px] text-emerald-300 font-medium">94% Target Savings Attained</span>
              <button
                onClick={() => onNavigate('twin')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Inspect Live Model <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL ARCHITECTURE FLOW (Required by Prompt) */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs">
        <div className="max-w-2xl mb-8">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
            System Topology
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Visual End-to-End Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            An 8-stage automated pipeline transforming continuous IoT sensor data into verified utility bill savings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {architectureSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:border-emerald-300 hover:bg-white transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      STEP 0{idx + 1}
                    </span>
                    <div className={`p-2 rounded-xl border ${step.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Pipeline Stage</span>
                  <ArrowDown className="w-3.5 h-3.5 text-slate-300 lg:-rotate-90" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button at bottom */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Ready to inspect the live MSRIT Smart Building digital twin in action?
          </div>
          <button
            onClick={() => onNavigate('twin')}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Launch Digital Twin Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
