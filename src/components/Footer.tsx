import React from 'react';
import { ShieldCheck, Zap, Droplets, Leaf, ExternalLink } from 'lucide-react';
import { PageId } from '../types';
import { VecnaLogo } from './VecnaLogo';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <VecnaLogo size={32} showBackground={true} />
              <span className="text-lg font-bold text-white tracking-tight">VECNA</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-driven sustainable digital twin for institutional & commercial buildings. Continuous anomaly detection, automated root cause analysis, and verified M&V savings.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>ASHRAE Guideline 14 & IPMVP Compliant</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Twin Navigation</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('twin')} className="hover:text-white transition-colors">
                  3D/2D Building Twin
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('insights')} className="hover:text-white transition-colors">
                  Active Anomaly Detection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('diagnosis')} className="hover:text-white transition-colors">
                  Evidence-Based AI Diagnosis
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('recommendations')} className="hover:text-white transition-colors">
                  Intervention Playbooks
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Verification & Impact</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('simulation')} className="hover:text-white transition-colors">
                  What-If Fix Simulation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('verification')} className="hover:text-white transition-colors">
                  Post-Intervention M&V Audit
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('report')} className="hover:text-white transition-colors">
                  Sustainability Executive Report
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-white transition-colors">
                  Platform Architecture
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3 bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span>Facility Profile</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Active Submetering</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">MSRIT Smart Building</p>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div>Floors: <span className="text-slate-200 font-semibold">4</span></div>
              <div>Sub-Zones: <span className="text-slate-200 font-semibold">16</span></div>
              <div>IoT Sensors: <span className="text-slate-200 font-semibold">128</span></div>
              <div>Baseline Sync: <span className="text-emerald-400 font-semibold">90 Days</span></div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 VECNA Smart Systems. Continuous Building Decarbonization Twin.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> 1,842 kWh Tracked
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-400" /> 18,420 L Monitored
            </span>
            <span className="flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" /> 710 kg CO₂ Avoided
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
