import React from 'react';
import { 
  Building2, 
  Layers,
  AlertTriangle, 
  Search, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  FileText, 
  X, 
  ChevronRight,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
  History,
  Activity
} from 'lucide-react';
import { PageId } from '../types';
import { BUILDING_INFO } from '../data/mockBuildingData';
import { UserAuthButton } from './UserAuthButton';
import { VecnaLogo } from './VecnaLogo';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  activeAnomaliesCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenInvestigation?: () => void;
  isInterventionApplied?: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  activeAnomaliesCount,
  onOpenInvestigation,
  isInterventionApplied = false,
  mobileOpen,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapsed,
}) => {
  const handleNav = (id: PageId) => {
    onNavigate(id);
    onCloseMobile();
  };

  // The 4 core Digital Twin stages as requested
  const digitalTwinStages: {
    id: PageId;
    number: number;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: string;
    badgeStyle: string;
  }[] = [
    {
      id: 'twin',
      number: 1,
      title: 'Building',
      subtitle: '3D Twin & Floor View',
      icon: Layers,
      badge: '3D/2D',
      badgeStyle: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70',
    },
    {
      id: 'insights',
      number: 2,
      title: 'Problem',
      subtitle: 'Floor 2 +27% Abnormal Energy',
      icon: AlertTriangle,
      badge: `${activeAnomaliesCount || 7} alerts`,
      badgeStyle: 'bg-rose-950/70 text-rose-300 border-rose-800/70',
    },
    {
      id: 'diagnosis',
      number: 3,
      title: 'Cause',
      subtitle: 'AC Running After Hours',
      icon: Search,
      badge: 'AI',
      badgeStyle: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/70',
    },
    {
      id: 'recommendations',
      number: 4,
      title: 'Solution',
      subtitle: 'Recommended Interventions',
      icon: Sparkles,
      badge: 'ROI',
      badgeStyle: 'bg-amber-950/70 text-amber-300 border-amber-800/70',
    },
  ];

  // Secondary simulation & verification stages
  const analysisStages: {
    id: PageId;
    number: number;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeStyle?: string;
  }[] = [
    {
      id: 'simulation',
      number: 5,
      title: 'Simulation',
      subtitle: 'What-If AC Schedule Sandbox',
      icon: Sliders,
      badge: 'Sandbox',
      badgeStyle: 'bg-purple-950/70 text-purple-300 border-purple-800/70',
    },
    {
      id: 'verification',
      number: 6,
      title: 'Verified Savings',
      subtitle: 'Actual Impact (395 kWh Saved)',
      icon: CheckCircle2,
      badge: isInterventionApplied ? 'Verified' : 'Pending',
      badgeStyle: isInterventionApplied 
        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70 font-black' 
        : 'bg-slate-800/80 text-slate-400 border-slate-700/80',
    },
    {
      id: 'solution-history',
      number: 7,
      title: 'Solution History',
      subtitle: 'Audit Trail & Interventions',
      icon: History,
      badge: 'Audit',
      badgeStyle: 'bg-teal-950/70 text-teal-300 border-teal-800/70',
    },
  ];

  // System & report items
  const systemItems: {
    id: PageId;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'report',
      title: 'Sustainability Report',
      subtitle: 'ESG & Metric Documentation',
      icon: FileText,
    },
    {
      id: 'how-it-works',
      title: 'How VECNA Works',
      subtitle: 'Architecture & Physics Logic',
      icon: HelpCircle,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b1322] text-slate-200 border-r border-slate-800/90 shadow-2xl transition-colors duration-200 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <button
          id="brand-header-link"
          onClick={() => handleNav('overview')}
          className="flex items-center gap-3 text-left group focus:outline-hidden cursor-pointer"
        >
          <VecnaLogo size={42} showBackground={true} className="group-hover:scale-105 transition-transform duration-200" />
          {!isCollapsed && (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  VECNA
                </span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5 tracking-wide">
                Digital Twin Platform
              </p>
            </div>
          )}
        </button>

        <div className="flex items-center gap-1">
          {/* Collapse/Expand toggle on desktop */}
          {onToggleCollapsed && (
            <button
              id="sidebar-collapse-toggle-btn"
              onClick={onToggleCollapsed}
              className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 cursor-pointer transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}

          {/* Close button on mobile */}
          <button
            id="sidebar-mobile-close-btn"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Building Status Pill (Command Center Telemetry status) */}
      {!isCollapsed && (
        <div className="px-5 py-2.5 bg-[#090f1d] border-b border-slate-800/80 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200 truncate max-w-[130px]">
              {BUILDING_INFO.name}
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Activity className="w-2.5 h-2.5" />
            <span>128 IoT Sensors</span>
          </span>
        </div>
      )}

      {/* Quick AI Investigation CTA */}
      {onOpenInvestigation && !isCollapsed && (
        <div className="px-4 pt-3 pb-1 shrink-0">
          <button
            id="sidebar-ai-investigation-btn"
            onClick={() => {
              onCloseMobile();
              onOpenInvestigation();
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 flex items-center justify-between group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-emerald-200" />
              <span>AI Investigation</span>
            </div>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-md font-semibold">
              Run Check
            </span>
          </button>
        </div>
      )}

      {/* Scrollable Navigation Body */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {/* OVERVIEW DASHBOARD ROW */}
        <div className="space-y-1">
          <button
            id="nav-overview-btn"
            onClick={() => handleNav('overview')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
              currentPage === 'overview'
                ? 'bg-emerald-950/30 border-l-[3px] border-l-emerald-400 border-t border-r border-b border-emerald-500/20 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent'
            }`}
            title="Overview Dashboard"
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 ${currentPage === 'overview' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
              {!isCollapsed && <span className="text-sm font-bold tracking-tight">Overview Dashboard</span>}
            </div>
            {!isCollapsed && currentPage === 'overview' && (
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
          </button>
        </div>

        {/* SECTION DIVIDER */}
        <div className="border-t border-slate-800/80 my-1 mx-1" />

        {/* DIGITAL TWIN PRIMARY SECTION */}
        <div className="space-y-2">
          {!isCollapsed ? (
            <div className="px-3 pt-1 text-[11px] font-black uppercase tracking-widest text-slate-400">
              DIGITAL TWIN
            </div>
          ) : (
            <div className="text-[9px] text-center font-black uppercase tracking-widest text-slate-400 py-0.5">
              TWIN
            </div>
          )}

          <div className="space-y-2.5">
            {digitalTwinStages.map((stage) => {
              const Icon = stage.icon;
              const isActive = currentPage === stage.id;

              if (isCollapsed) {
                return (
                  <button
                    key={stage.id}
                    id={`sidebar-collapsed-${stage.id}`}
                    onClick={() => handleNav(stage.id)}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                    }`}
                    title={`${stage.number}. ${stage.title}: ${stage.subtitle}`}
                  >
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={stage.id}
                  id={`sidebar-stage-${stage.id}`}
                  onClick={() => handleNav(stage.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-150 relative cursor-pointer group ${
                    isActive
                      ? 'bg-emerald-950/25 border-l-[3px] border-l-emerald-400 border-t border-r border-b border-emerald-500/20 shadow-xs'
                      : 'bg-transparent hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`mt-0.5 shrink-0 transition-colors ${
                        isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-sm font-bold tracking-tight truncate ${
                            isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}>
                            {stage.number}. {stage.title}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 leading-snug line-clamp-1 ${
                          isActive ? 'text-slate-300 font-medium' : 'text-slate-400 group-hover:text-slate-300'
                        }`}>
                          {stage.subtitle}
                        </p>
                      </div>
                    </div>

                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.badgeStyle}`}>
                      {stage.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION DIVIDER */}
        <div className="border-t border-slate-800/80 my-1 mx-1" />

        {/* SIMULATION, VERIFICATION & AUDIT SECTION */}
        <div className="space-y-2">
          {!isCollapsed ? (
            <div className="px-3 pt-1 text-[11px] font-black uppercase tracking-widest text-slate-400">
              SIMULATION & IMPACT
            </div>
          ) : (
            <div className="text-[9px] text-center font-black uppercase tracking-widest text-slate-400 py-0.5">
              IMPACT
            </div>
          )}

          <div className="space-y-2">
            {analysisStages.map((stage) => {
              const Icon = stage.icon;
              const isActive = currentPage === stage.id;

              if (isCollapsed) {
                return (
                  <button
                    key={stage.id}
                    id={`sidebar-collapsed-${stage.id}`}
                    onClick={() => handleNav(stage.id)}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                    }`}
                    title={`${stage.title}: ${stage.subtitle}`}
                  >
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={stage.id}
                  id={`sidebar-stage-${stage.id}`}
                  onClick={() => handleNav(stage.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 relative cursor-pointer group ${
                    isActive
                      ? 'bg-emerald-950/25 border-l-[3px] border-l-emerald-400 border-t border-r border-b border-emerald-500/20 shadow-xs'
                      : 'bg-transparent hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`mt-0.5 shrink-0 transition-colors ${
                        isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold tracking-tight truncate block ${
                          isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                        }`}>
                          {stage.number}. {stage.title}
                        </span>
                        <p className={`text-[11px] mt-0.5 leading-snug line-clamp-1 ${
                          isActive ? 'text-slate-300 font-medium' : 'text-slate-400 group-hover:text-slate-300'
                        }`}>
                          {stage.subtitle}
                        </p>
                      </div>
                    </div>

                    {stage.badge && (
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.badgeStyle}`}>
                        {stage.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION DIVIDER */}
        <div className="border-t border-slate-800/80 my-1 mx-1" />

        {/* REPORTS & INFORMATION SECTION */}
        <div className="space-y-1.5">
          {!isCollapsed ? (
            <div className="px-3 pt-1 text-[11px] font-black uppercase tracking-widest text-slate-400">
              REPORTS & SYSTEM
            </div>
          ) : (
            <div className="text-[9px] text-center font-black uppercase tracking-widest text-slate-400 py-0.5">
              DOCS
            </div>
          )}

          <div className="space-y-1">
            {systemItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              if (isCollapsed) {
                return (
                  <button
                    key={item.id}
                    id={`sidebar-collapsed-${item.id}`}
                    onClick={() => handleNav(item.id)}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                    title={item.title}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-emerald-950/25 border-l-[3px] border-l-emerald-400 border-t border-r border-b border-emerald-500/20 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="font-semibold text-xs tracking-tight">{item.title}</span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Area: User Account & Building Eco Score Command Card */}
      <div className="p-3 sm:p-3.5 border-t border-slate-800/80 bg-[#090f1d] shrink-0 space-y-2.5">
        <UserAuthButton variant={isCollapsed ? 'compact' : 'sidebar'} />

        {!isCollapsed && (
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[11px] font-bold text-slate-400">
                Building Eco Score
              </span>
              <span className={`text-xs font-black ${isInterventionApplied ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isInterventionApplied ? '86 / 100' : '68 / 100'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isInterventionApplied ? 'bg-emerald-500 w-[86%]' : 'bg-amber-500 w-[68%]'
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>{isInterventionApplied ? 'Good • Action applied' : 'Fair • Waste active'}</span>
              <span>Goal: 95</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className={`hidden lg:block fixed inset-y-0 left-0 z-40 transition-all duration-200 ${
        isCollapsed ? 'w-20' : 'w-64 xl:w-72'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <div 
        className={`lg:hidden fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

