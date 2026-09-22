import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRight, 
  Activity, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Droplets, 
  ShieldAlert, 
  TrendingDown, 
  ChevronRight,
  Layers,
  Sliders,
  Check,
  IndianRupee,
  Leaf,
  AlertTriangle,
  Play
} from 'lucide-react';
import { PageId } from '../types';
import { BUILDING_INFO } from '../data/mockBuildingData';
import { WhyButton, WhyExplanation } from '../components/WhyModal';
import { VecnaLogo } from '../components/VecnaLogo';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
  isInterventionApplied?: boolean;
  onApplyIntervention?: () => void;
  onOpenInvestigation?: () => void;
  onOpenWhy?: (data: WhyExplanation) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigate,
  isInterventionApplied = false,
  onApplyIntervention,
  onOpenInvestigation,
  onOpenWhy,
}) => {
  const [activeFloorPreview, setActiveFloorPreview] = useState<number>(2);

  // Dynamic Eco Score calculation
  const ecoScore = isInterventionApplied ? 86 : 68;
  const energySub = isInterventionApplied ? 88 : 62;
  const waterSub = isInterventionApplied ? 84 : 74;
  const efficiencySub = isInterventionApplied ? 86 : 68;

  const triggerWhy = (title: string, metric: string, explanation: string, detail?: string, actionHint?: string) => {
    if (onOpenWhy) {
      onOpenWhy({ title, metric, explanation, detail, actionHint });
    }
  };

  const capabilities = [
    {
      title: 'Detect',
      subtitle: 'Continuous Pattern Sensing',
      description: 'AI constantly analyzes electricity and water use across all floors, highlighting unusual spikes before they become costly bills.',
      icon: Activity,
      color: 'emerald',
      badge: '128 Sensors Live',
      action: () => onNavigate('insights'),
    },
    {
      title: 'Find the Cause',
      subtitle: 'Clear AI Explanations',
      description: 'VECNA cross-references building closing times, motion sensors, and temperature readings to pinpoint why energy is being wasted.',
      icon: Search,
      color: 'teal',
      badge: 'Explainable AI',
      action: () => onNavigate('diagnosis'),
    },
    {
      title: 'Verify Savings',
      subtitle: 'Real Meter Proof',
      description: 'After adjusting building schedules, the system verifies actual meter drop-offs so you know your savings are 100% genuine.',
      icon: CheckCircle2,
      color: 'blue',
      badge: '395 kWh Verified',
      action: () => onNavigate('verification'),
    },
  ];

  const storySteps = [
    {
      step: '01',
      title: 'Problem Detected',
      subtitle: 'Floor 2 • 02:00 AM',
      desc: 'Floor 2 is using 27% more electricity than usual while completely empty.',
      icon: Zap,
      iconColor: 'text-rose-600 bg-rose-50 border-rose-200',
      badge: '+27% Unusual Spike',
      page: 'insights' as PageId,
    },
    {
      step: '02',
      title: 'Cause Identified',
      subtitle: 'Empty Rooms Being Cooled',
      desc: 'The AC continued cooling at full blast 6 hours after everyone left the building.',
      icon: Search,
      iconColor: 'text-teal-600 bg-teal-50 border-teal-200',
      badge: '91% Certainty',
      page: 'diagnosis' as PageId,
    },
    {
      step: '03',
      title: 'Recommended Action',
      subtitle: 'Simple Schedule Update',
      desc: 'Set AC operating hours to 7 AM – 7 PM with auto shut-off when rooms are empty.',
      icon: Sparkles,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      badge: 'Save ₹4,200 / mo',
      page: 'recommendations' as PageId,
    },
    {
      step: '04',
      title: 'Verified Savings',
      subtitle: 'Meter Drop Confirmed',
      desc: 'Post-fix meter reads 1,025 kWh vs 1,420 kWh before (395 kWh saved, 100% verified).',
      icon: CheckCircle2,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      badge: '100% Verified',
      page: 'verification' as PageId,
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-8 sm:pt-12 pb-12 overflow-hidden">
        {/* Subtle ambient accent */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/5 dark:bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-2xs">
                <VecnaLogo size={20} showBackground={false} />
                <span>VECNA Digital Twin • MSRIT Smart Campus</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-1" />
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                  See where your building wastes.{' '}
                  <span className="text-emerald-700 dark:text-emerald-400">
                    Fix it with AI evidence.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed pt-1">
                  VECNA creates a living digital model of your building. It spots unusual electricity and water use, finds the reason in plain language, tests the fix, and verifies your actual savings.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* AI Investigation Trigger Button */}
                <button
                  id="hero-investigate-btn"
                  onClick={onOpenInvestigation}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center gap-2.5 transition-all hover:scale-102 cursor-pointer"
                >
                  <Search className="w-4 h-4 animate-pulse" />
                  <span>Start AI Investigation</span>
                </button>

                <button
                  id="hero-explore-twin-btn"
                  onClick={() => onNavigate('twin')}
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all hover:gap-2.5 cursor-pointer"
                >
                  <span>Explore 3D Building</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={() => onNavigate('simulation')}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-teal-600" />
                  <span>AC What-If Slider</span>
                </button>
              </div>

              {/* Quick stats banner with "Why?" buttons */}
              <div className="grid grid-cols-3 gap-3 pt-4 max-w-xl">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">Unusual Waste</span>
                    <WhyButton
                      onClick={() => triggerWhy(
                        'Unusual Electricity Waste',
                        '27% above normal',
                        'Floor 2 electricity is 27% higher than expected because the AC was left running throughout the night after all students and faculty departed.',
                        'Baseline electricity is 120 kWh. The current active draw is 186 kWh.',
                        'diagnosis'
                      )}
                    />
                  </div>
                  <div className="text-xl font-extrabold text-rose-600 mt-1">
                    +27%
                  </div>
                  <div className="text-[10px] text-slate-500">Floor 2 AC running</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">Monthly Loss</span>
                    <WhyButton
                      onClick={() => triggerWhy(
                        'Monthly Cost of Waste',
                        '₹18,600 / month',
                        'Calculated by multiplying the unneeded kilowatt-hours and water leakage by campus utility tariffs (₹10/kWh and ₹0.10/L).',
                        'Floor 2 AC alone accounts for ₹4,200/month of this waste.',
                        'simulation'
                      )}
                    />
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    ₹18,600
                  </div>
                  <div className="text-[10px] text-slate-500">Potential monthly savings</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">Verified Proof</span>
                    <WhyButton
                      onClick={() => triggerWhy(
                        'Verified Savings',
                        '395 kWh saved',
                        'Metered evidence shows electricity dropped from 1,420 kWh to 1,025 kWh after applying the 7 AM – 7 PM AC schedule fix.',
                        '100% verified by sub-meter readings over a 30-day period.',
                        'verification'
                      )}
                    />
                  </div>
                  <div className="text-xl font-extrabold text-emerald-600 mt-1">
                    395 kWh
                  </div>
                  <div className="text-[10px] text-slate-500">Verified saved</div>
                </div>
              </div>
            </div>

            {/* Right Hero: Building Eco Score Card (Prominently featured per requirement 6) */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
                {/* Background ambient radial */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Header of Eco Score Card */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-800 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Campus Sustainability
                      </span>
                      <h3 className="text-sm font-bold text-white">Building Eco Score</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <WhyButton
                      onClick={() => triggerWhy(
                        'Building Eco Score',
                        `${ecoScore} / 100`,
                        isInterventionApplied
                          ? 'Score jumped to 86/100 because the Floor 2 AC after-hours waste was resolved and verified!'
                          : 'Score is currently 68/100 due to Floor 2 AC running overnight (+27% extra electricity) and a restroom water leak.',
                        'Applying the recommended AC schedule immediately boosts the score by +18 points.',
                        'simulation'
                      )}
                    />
                  </div>
                </div>

                {/* Huge Animated Score Display */}
                <div className="py-6 text-center relative z-10">
                  <div className="inline-flex flex-col items-center">
                    <div className="text-6xl sm:text-7xl font-black tracking-tight text-white flex items-center justify-center gap-2 transition-all duration-500">
                      <span className="text-3xl sm:text-4xl">🌱</span>
                      <span className={isInterventionApplied ? 'text-emerald-400' : 'text-slate-100'}>
                        {ecoScore}
                      </span>
                      <span className="text-2xl sm:text-3xl text-slate-500 font-bold">/ 100</span>
                    </div>

                    <div className="mt-2">
                      {isInterventionApplied ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-pulse">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Intervention Applied • +18 Pts Gained!</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Improvement Available (+18 Pts)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sub-Score Breakdown requested in Requirement 6: Energy 62, Water 74, Efficiency 68 */}
                  <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800 text-left">
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">Energy</span>
                        <span className={`text-xs font-extrabold ${isInterventionApplied ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {energySub}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 transition-all duration-700" 
                          style={{ width: `${energySub}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">Water</span>
                        <span className={`text-xs font-extrabold ${isInterventionApplied ? 'text-sky-400' : 'text-slate-200'}`}>
                          {waterSub}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-sky-400 transition-all duration-700" 
                          style={{ width: `${waterSub}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">Efficiency</span>
                        <span className={`text-xs font-extrabold ${isInterventionApplied ? 'text-teal-400' : 'text-slate-200'}`}>
                          {efficiencySub}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-teal-400 transition-all duration-700" 
                          style={{ width: `${efficiencySub}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Demo Toggle for Judges */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {isInterventionApplied ? 'AC fix active in twin' : 'Test the fix impact live:'}
                  </span>

                  {isInterventionApplied ? (
                    <button
                      onClick={() => onNavigate('verification')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>See Verified Proof</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (onApplyIntervention) onApplyIntervention();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Apply Fix Now (+18)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-STEP JUDGE STORY BANNER: DETECT → EXPLAIN → FIX → VERIFY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                The 30-Second Solution Story
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                From Waste Detection to Verified Rupee Savings
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Click any step to inspect the live evidence
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {storySteps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  onClick={() => onNavigate(item.page)}
                  className="group p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition-all duration-200 cursor-pointer relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-400 group-hover:text-emerald-700">
                        {item.step}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                        {item.badge}
                      </span>
                    </div>

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-950">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {item.subtitle}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                    <span>Inspect Step</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CORE VALUE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {cap.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{cap.title}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{cap.subtitle}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed font-normal">
                      {cap.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100">
                  <button
                    onClick={cap.action}
                    className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View in Action</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
