import React, { useState } from 'react';
import { 
  Building2, 
  Zap, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Users, 
  Sliders,
  Check,
  ChevronRight,
  Info,
  Thermometer,
  RotateCcw
} from 'lucide-react';
import { PageId } from '../types';
import { ZONES_DATA, BUILDING_INFO } from '../data/mockBuildingData';
import { WhyButton, WhyExplanation } from '../components/WhyModal';

interface DigitalTwinPageProps {
  onNavigate: (page: PageId) => void;
  onSelectAnomalyForDiagnosis: (anomalyId: string) => void;
  onOpenInvestigation?: () => void;
  onOpenWhy?: (data: WhyExplanation) => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({
  onNavigate,
  onSelectAnomalyForDiagnosis,
  onOpenInvestigation,
  onOpenWhy,
}) => {
  // Start default on Floor 2 to showcase the core problem immediately
  const [selectedFloor, setSelectedFloor] = useState<number>(2);
  const [activeZoneId, setActiveZoneId] = useState<string>('z-f2-hvac');

  const triggerWhy = (title: string, metric: string, explanation: string, detail?: string, actionHint?: string) => {
    if (onOpenWhy) {
      onOpenWhy({ title, metric, explanation, detail, actionHint });
    }
  };

  const floors = [
    {
      level: 3,
      name: 'Floor 3',
      subtitle: 'Classrooms & Labs',
      status: 'normal' as const,
      energy: '34 kWh',
      water: '120 L/hr',
      people: 45,
      hasAlert: false,
      summary: 'All lighting and temperature systems operating on normal schedules.',
    },
    {
      level: 2,
      name: 'Floor 2',
      subtitle: 'Faculty Wing & Study Lounges',
      status: 'alert' as const,
      energy: '186 kWh',
      water: '180 L/hr',
      people: 0,
      hasAlert: true,
      alertBadge: '🔴 27% More Electricity',
      summary: 'Problem found: AC is running after people leave. Rooms cooled to 19.8°C with 0 people inside.',
    },
    {
      level: 1,
      name: 'Floor 1',
      subtitle: 'Server Room & Restrooms',
      status: 'warning' as const,
      energy: '345 kWh',
      water: '380 L/hr',
      people: 18,
      hasAlert: true,
      alertBadge: '💧 Restroom Water Leak',
      summary: 'Restroom flush valve leaking 380 L/hr. Server room cooling slightly elevated.',
    },
    {
      level: 0,
      name: 'Ground Floor',
      subtitle: 'Atrium, Cafeteria & Cooling Plant',
      status: 'normal' as const,
      energy: '142 kWh',
      water: '520 L/hr',
      people: 85,
      hasAlert: false,
      summary: 'Main campus entrance and central kitchen operating efficiently.',
    },
  ];

  const currentFloorData = floors.find((f) => f.level === selectedFloor) || floors[1];
  const floorZones = ZONES_DATA.filter((z) => z.floor === selectedFloor);
  const activeZone = floorZones.find((z) => z.id === activeZoneId) || floorZones[0] || ZONES_DATA[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              Interactive 3D Digital Model
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Click any floor to inspect live sensors
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            MSRIT Campus Digital Twin
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time digital replica mapping electricity, water flow, and people across all four floors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenInvestigation}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>AI Investigation Sequence</span>
          </button>

          <button
            onClick={() => onNavigate('simulation')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Fix</span>
          </button>
        </div>
      </div>

      {/* Centerpiece: Interactive Digital Building Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: The Stylized Interactive Building */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Building Cross-Section
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Select a floor below
            </span>
          </div>

          {/* Roof Decoration */}
          <div className="relative mx-auto max-w-xl">
            <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-t-xl border border-slate-300 dark:border-slate-700 flex items-center justify-between px-6">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Rooftop Solar & Weather Station • 21.4°C Ambient
              </span>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-sky-500" />
              </div>
            </div>

            {/* Stacked Floor Cards */}
            <div className="space-y-3 pt-3">
              {floors.map((floor) => {
                const isSelected = selectedFloor === floor.level;
                const isFloor2 = floor.level === 2;

                return (
                  <div
                    key={floor.level}
                    id={`building-floor-${floor.level}`}
                    onClick={() => {
                      setSelectedFloor(floor.level);
                      const z = ZONES_DATA.find((item) => item.floor === floor.level);
                      if (z) setActiveZoneId(z.id);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative ${
                      isSelected
                        ? isFloor2
                          ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-100 dark:shadow-none'
                          : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-100 dark:shadow-none'
                        : isFloor2
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 hover:border-rose-400 dark:hover:border-rose-700'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                            isFloor2
                              ? 'bg-rose-600 text-white border-rose-700'
                              : isSelected
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {floor.level === 0 ? 'G' : floor.level}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                              {floor.name}
                            </h3>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              • {floor.subtitle}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {!floor.hasAlert && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Normal
                              </span>
                            )}

                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              👥 {floor.people} people in floor
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Floor Mini Metrics */}
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Electricity</div>
                          <div className={`text-sm font-black ${isFloor2 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                            {floor.energy}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Water</div>
                          <div className="text-sm font-black text-sky-700 dark:text-sky-400">
                            {floor.water}
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-slate-900 dark:text-white translate-x-1' : 'text-slate-300 dark:text-slate-600'}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Foundation Label */}
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-b-xl border border-slate-300 dark:border-slate-700 mt-3 flex items-center justify-center">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Main Building Foundation & Water Ingress
              </span>
            </div>
          </div>
        </div>

        {/* Right: Selected Floor Details with Plain English Problem Statement */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border shadow-sm ${
            selectedFloor === 2 ? 'border-rose-300 dark:border-rose-800/80 ring-2 ring-rose-100 dark:ring-rose-950/40' : 'border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                  Floor Inspection
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {currentFloorData.name}: {currentFloorData.subtitle}
                </h2>
              </div>

              {selectedFloor === 2 && (
                <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[11px] font-extrabold flex items-center gap-1.5 border border-rose-200 dark:border-rose-800/60">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  Needs Attention
                </span>
              )}
            </div>

            {/* If Floor 2: Highlight the problem clearly in simple words */}
            {selectedFloor === 2 ? (
              <div className="py-4 space-y-4">
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Problem Detected
                    </span>
                    <WhyButton
                      onClick={() => triggerWhy(
                        'Floor 2 AC Problem',
                        '27% Higher Electricity',
                        'Floor 2 is drawing 186 kWh overnight instead of the normal 120 kWh because the AC schedule remained switched on when the building emptied.',
                        'Zero people detected by all 12 motion sensors between 8:30 PM and 7:15 AM.',
                        'diagnosis'
                      )}
                    />
                  </div>

                  <p className="text-base font-extrabold text-rose-900 dark:text-rose-100 leading-snug">
                    Floor 2 is using 27% more electricity than usual.
                  </p>
                  <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                    Likely reason: The AC is running several hours after most people leave the building.
                  </p>
                </div>

                {/* Key Metrics Breakdown in Simple Words */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>Electricity Draw</span>
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      186 kWh
                    </div>
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                      Normal: 120 kWh (+27% waste)
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>People in Floor</span>
                      <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      0 People
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Empty since 8:30 PM
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>Room Temperature</span>
                      <Thermometer className="w-3.5 h-3.5 text-sky-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      19.8°C
                    </div>
                    <div className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">
                      Overcooled (Outside is 21°C)
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>Monthly Waste</span>
                      <span className="text-xs">₹</span>
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      ₹4,200
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Unnecessary utility bill
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      onSelectAnomalyForDiagnosis('anom-1');
                      onNavigate('diagnosis');
                    }}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Find the Cause (AI Evidence)</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400 dark:text-white" />
                  </button>

                  <button
                    onClick={() => onNavigate('simulation')}
                    className="w-full py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Test Fixing AC Schedule</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Other Floors */
              <div className="py-4 space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentFloorData.summary}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Electricity</span>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      {currentFloorData.energy}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Water Flow</span>
                    <div className="text-lg font-black text-sky-700 dark:text-sky-400 mt-0.5">
                      {currentFloorData.water}
                    </div>
                  </div>
                </div>

                {selectedFloor === 1 && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs">
                    <strong>Note:</strong> East Restroom flush valve is leaking water at 380 L/hr.
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedFloor(2);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Switch Back to Problem Floor (Floor 2)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
