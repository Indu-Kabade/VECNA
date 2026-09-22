import React, { useState, useEffect } from 'react';
import { PageId } from './types';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { InvestigationModal } from './components/InvestigationModal';
import { WhyModal, WhyExplanation } from './components/WhyModal';
import { LandingPage } from './pages/LandingPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { InsightsPage } from './pages/InsightsPage';
import { DiagnosisPage } from './pages/DiagnosisPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { SimulationPage } from './pages/SimulationPage';
import { VerificationPage } from './pages/VerificationPage';
import { ReportPage } from './pages/ReportPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SolutionHistoryPage } from './pages/SolutionHistoryPage';
import { BUILDING_INFO } from './data/mockBuildingData';
import { CheckCircle2, X, Menu, Sun, Moon, Building2, Search } from 'lucide-react';
import { OfflineProvider, useOffline } from './context/OfflineContext';
import { OfflineStatusBar } from './components/OfflineStatusBar';
import { OfflineQueueModal } from './components/OfflineQueueModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { UserAuthButton } from './components/UserAuthButton';
import { VecnaLogo } from './components/VecnaLogo';
import { applySolution } from './services/solutionsService';
import { LoginPage } from './pages/LoginPage';
import { RefreshCw } from 'lucide-react';

export default function App() {
  return (
    <OfflineProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </OfflineProvider>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string>('anom-1');
  const [selectedInterventionId, setSelectedInterventionId] = useState<string>('rec-1');
  const [selectedInterventionIds, setSelectedInterventionIds] = useState<string[]>(['rec-1', 'rec-2', 'rec-3', 'rec-4']);
  const [isInterventionApplied, setIsInterventionApplied] = useState<boolean>(false);
  const [isInvestigationOpen, setIsInvestigationOpen] = useState<boolean>(false);
  const [whyData, setWhyData] = useState<WhyExplanation | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const { user, loading: authLoading } = useAuth();
  const { isOnline } = useOffline();

  // Dark Mode preference management (persisted in localStorage)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('ecotwin-theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches || false;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ecotwin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ecotwin-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAnomalyForDiagnosis = (anomalyId: string) => {
    setSelectedAnomalyId(anomalyId);
  };

  const handleSelectInterventionForSimulation = (recIdOrIds: string | string[]) => {
    if (Array.isArray(recIdOrIds)) {
      setSelectedInterventionIds(recIdOrIds);
      if (recIdOrIds.length > 0) {
        setSelectedInterventionId(recIdOrIds[0]);
      }
    } else {
      setSelectedInterventionId(recIdOrIds);
      setSelectedInterventionIds([recIdOrIds]);
    }
  };

  const handleInterventionApplied = async () => {
    setIsInterventionApplied(true);
    showToast('AC schedule fix applied! Record saved to persistent database. Eco Score: 86 / 100.');
    try {
      await applySolution(
        {
          floor: 'Floor 2',
          buildingId: 'Academic Block A',
          resourceType: 'electricity',
          solutionName: 'AC Schedule Optimization',
          solutionDescription: 'AC operating hours optimized from 14h to 11h/day, eliminating after-hours cooling waste.',
          problemDescription: 'Floor 2 was consuming 27% more electricity than its normal baseline.',
          estimatedSavingsKwh: 395,
          estimatedSavingsRupees: 4200,
          appliedBy: user?.displayName || user?.email || 'Facilities Team',
        },
        isOnline
      );
    } catch (err) {
      console.warn('Error saving intervention record:', err);
    }
  };

  const handleOpenWhy = (data: WhyExplanation) => {
    setWhyData(data);
  };

  const handleStartInvestigation = () => {
    setIsInvestigationOpen(true);
  };

  // Auth Guard: If verifying session, show loading splash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <VecnaLogo size={52} showBackground={true} />
          <div className="flex items-center gap-2.5 text-sm font-bold text-emerald-400">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
            <span>Verifying Campus Facility Session...</span>
          </div>
        </div>
      </div>
    );
  }

  // Route Protection: Unauthenticated users are directed to the Login & OTP Verification page
  if (!user) {
    return <LoginPage onLoginSuccess={() => handleNavigate('overview')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white font-sans antialiased transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shrink-0 font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-100">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global AI Investigation Sequence Modal */}
      <InvestigationModal
        isOpen={isInvestigationOpen}
        onClose={() => setIsInvestigationOpen(false)}
        onNavigateToSimulation={() => handleNavigate('simulation')}
        onNavigateToDiagnosis={() => handleNavigate('diagnosis')}
      />

      {/* Global Offline Persistent Queue Modal */}
      <OfflineQueueModal />

      {/* Global Authentication Modal (Sign In / Register / Password Reset) */}
      <AuthModal />

      {/* Global "Why?" Explainable AI Modal */}
      <WhyModal
        isOpen={whyData !== null}
        onClose={() => setWhyData(null)}
        data={whyData}
        onAction={() => {
          if (whyData?.actionHint === 'simulation') handleNavigate('simulation');
          else if (whyData?.actionHint === 'diagnosis') handleNavigate('diagnosis');
          else if (whyData?.actionHint === 'verification') handleNavigate('verification');
        }}
        actionLabel={
          whyData?.actionHint === 'simulation'
            ? 'Simulate Solution'
            : whyData?.actionHint === 'diagnosis'
            ? 'See Cause Breakdown'
            : whyData?.actionHint === 'verification'
            ? 'View Verified Results'
            : undefined
        }
      />

      {/* Primary Left Navigation Bar with Clickable Features (Building, Problem, Cause, Solution, Simulation, Verified Savings) */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        activeAnomaliesCount={BUILDING_INFO.activeAnomaliesCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenInvestigation={handleStartInvestigation}
        isInterventionApplied={isInterventionApplied}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Layout with Left Padding on Desktop (No features bar on top) */}
      <div className={`flex flex-col min-h-screen transition-all duration-200 ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64 xl:lg:pl-72'
      }`}>
        {/* Desktop Top Header Bar: Clean breadcrumbs, live telemetry status, AI search trigger, and prominent Theme Switch */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 h-14 items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Campus Digital Twin</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">
              {currentPage === 'overview' ? 'Overview Dashboard' :
               currentPage === 'twin' ? '3D Building Twin' :
               currentPage === 'insights' ? 'Unusual Waste Detection' :
               currentPage === 'diagnosis' ? 'Root Cause Analysis' :
               currentPage === 'recommendations' ? 'Action Plan & Solutions' :
               currentPage === 'simulation' ? 'Interactive What-If Sandbox' :
               currentPage === 'verification' ? 'Verified Meter Savings' :
               currentPage === 'report' ? 'Sustainability Report' : 'How It Works'}
            </span>
            <span className="inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Tower B • 128 Telemetry Points</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartInvestigation}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Start Investigation</span>
            </button>

            {/* Desktop Theme Switcher Pill */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700/80">
              <button
                type="button"
                id="desktop-light-theme-btn"
                onClick={() => isDarkMode && toggleDarkMode()}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isDarkMode
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                aria-label="Switch to Light theme"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                id="desktop-dark-theme-btn"
                onClick={() => !isDarkMode && toggleDarkMode()}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-900 text-white shadow-xs border border-slate-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-label="Switch to Dark theme"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </button>
            </div>

            {/* User Account / Sign In Option */}
            <UserAuthButton variant="header" />
          </div>
        </header>

        {/* Mobile Top Header (Visible only on screens < lg; shows only brand, drawer trigger, and dark mode toggle) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleNavigate('overview')}
              className="flex items-center gap-2 text-left"
            >
              <VecnaLogo size={34} showBackground={true} />
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">VECNA</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartInvestigation}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Investigate</span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Mobile User Sign In Button */}
            <UserAuthButton variant="header" />
          </div>
        </header>

        {/* Dynamic Offline / Online Status and Queue Notification Bar */}
        <OfflineStatusBar />

        {/* Main Content Pages (NO features bar on top - cleanly moved to the left navbar) */}
        <main className="flex-1">
          {currentPage === 'overview' && (
            <LandingPage 
              onNavigate={handleNavigate} 
              isInterventionApplied={isInterventionApplied}
              onApplyIntervention={handleInterventionApplied}
              onOpenInvestigation={handleStartInvestigation}
              onOpenWhy={handleOpenWhy}
            />
          )}

          {currentPage === 'twin' && (
            <DigitalTwinPage
              onNavigate={handleNavigate}
              onSelectAnomalyForDiagnosis={handleSelectAnomalyForDiagnosis}
              onOpenInvestigation={handleStartInvestigation}
              onOpenWhy={handleOpenWhy}
            />
          )}

          {currentPage === 'insights' && (
            <InsightsPage
              onNavigate={handleNavigate}
              onSelectAnomalyForDiagnosis={handleSelectAnomalyForDiagnosis}
              onOpenInvestigation={handleStartInvestigation}
              onOpenWhy={handleOpenWhy}
            />
          )}

          {currentPage === 'diagnosis' && (
            <DiagnosisPage
              onNavigate={handleNavigate}
              selectedAnomalyId={selectedAnomalyId}
              onSelectAnomaly={setSelectedAnomalyId}
              onOpenWhy={handleOpenWhy}
            />
          )}

          {currentPage === 'recommendations' && (
            <RecommendationsPage
              onNavigate={handleNavigate}
              onSelectInterventionForSimulation={handleSelectInterventionForSimulation}
              selectedInterventionIds={selectedInterventionIds}
              onSelectedInterventionsChange={setSelectedInterventionIds}
              onOpenWhy={handleOpenWhy}
            />
          )}

          {currentPage === 'simulation' && (
            <SimulationPage
              onNavigate={handleNavigate}
              selectedInterventionId={selectedInterventionId}
              selectedInterventionIds={selectedInterventionIds}
              onSelectedInterventionsChange={setSelectedInterventionIds}
              onInterventionApplied={handleInterventionApplied}
              isInterventionApplied={isInterventionApplied}
              onOpenWhy={handleOpenWhy}
            />
          )}

          {currentPage === 'verification' && (
            <VerificationPage 
              onNavigate={handleNavigate} 
              isInterventionApplied={isInterventionApplied}
              onOpenWhy={handleOpenWhy}
            />
          )}

          {currentPage === 'report' && (
            <ReportPage onNavigate={handleNavigate} />
          )}

          {currentPage === 'how-it-works' && (
            <HowItWorksPage onNavigate={handleNavigate} />
          )}

          {currentPage === 'solution-history' && (
            <SolutionHistoryPage onNavigate={handleNavigate} />
          )}
        </main>

        {/* Global Footer */}
        <Footer onNavigate={handleNavigate} />
      </div>
    </div>
  );
}
