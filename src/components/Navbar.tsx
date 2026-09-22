import React, { useState } from 'react';
import { 
  Building2, 
  Cpu, 
  Activity, 
  Search, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  FileText, 
  Info, 
  Menu, 
  X, 
  AlertTriangle,
  Radio,
  Zap,
  Droplets
} from 'lucide-react';
import { PageId } from '../types';
import { BUILDING_INFO } from '../data/mockBuildingData';
import { VecnaLogo } from './VecnaLogo';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  activeAnomaliesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  activeAnomaliesCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'twin', label: 'Digital Twin', icon: Cpu },
    { id: 'insights', label: 'Insights', icon: Activity },
    { id: 'diagnosis', label: 'AI Diagnosis', icon: Search },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { id: 'simulation', label: 'Simulation', icon: Sliders },
    { id: 'verification', label: 'Verification', icon: CheckCircle2 },
    { id: 'report', label: 'Reports', icon: FileText },
    { id: 'how-it-works', label: 'How It Works', icon: Info },
  ];

  const handleNav = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => handleNav('overview')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
            >
              <VecnaLogo size={40} showBackground={true} className="group-hover:scale-105 transition-transform duration-200" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">VECNA</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    SaaS Twin
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">Smart Resource Decarbonization</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 relative cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'insights' && activeAnomaliesCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                      {activeAnomaliesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sub-XL Navigation Dropdown / Buttons */}
          <nav className="hidden md:flex xl:hidden items-center gap-1">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                    isActive ? 'bg-slate-900 dark:bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="relative group">
              <button
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                More ▾
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1 hidden group-hover:block z-50">
                {navItems.slice(5).map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                        isActive ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Right side: Building Status */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Building:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{BUILDING_INFO.name}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">Live</span>
              <span className="text-slate-400 text-[10px]">|</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">128 IoT Sensors</span>
            </div>
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </div>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-5 space-y-1 shadow-xl">
          <div className="py-2 px-3 mb-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>Building: <strong className="text-slate-900 dark:text-white">{BUILDING_INFO.name}</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" /> Live (128 Sensors)
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'insights' && activeAnomaliesCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                    {activeAnomaliesCount} alerts
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
