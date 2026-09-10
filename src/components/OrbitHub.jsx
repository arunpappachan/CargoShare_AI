import React from 'react';
import { Ship, Cpu, ShieldCheck, CreditCard, Users, Sparkles, Anchor } from 'lucide-react';

const SATELLITES = [
  {
    id: 'exporter',
    name: 'Exporters (SMEs)',
    desc: 'On-demand CBM space',
    icon: Users,
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-500/15 border-amber-400/40 text-amber-300',
    angle: -90, // Top
  },
  {
    id: 'carrier',
    name: 'Ocean Carriers',
    desc: 'Fill unutilized slots',
    icon: Ship,
    color: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-500/15 border-blue-400/40 text-blue-300',
    angle: -18,
  },
  {
    id: 'ai-engine',
    name: 'AI Routing Engine',
    desc: 'Predictive consolidation',
    icon: Cpu,
    color: 'from-brand-500 to-indigo-500',
    bgLight: 'bg-brand-500/15 border-brand-400/40 text-brand-300',
    angle: 54,
  },
  {
    id: 'customs',
    name: 'Customs & Docs',
    desc: 'Automated clearance',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300',
    angle: 126,
  },
  {
    id: 'payments',
    name: 'Escrow & Pay',
    desc: 'Smart contract settlements',
    icon: CreditCard,
    color: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-500/15 border-violet-400/40 text-violet-300',
    angle: 198,
  },
];

export default function OrbitHub() {
  const orbitRadius = 175; // px

  return (
    <div className="w-full max-w-[460px] mx-auto select-none py-6">
      
      {/* Desktop & Tablet: Continuous 3-Layer Orbiting Visual */}
      <div className="hidden sm:flex relative w-full aspect-square items-center justify-center">
        
        {/* Background radial atmosphere */}
        <div className="absolute inset-0 bg-radial-gradient from-brand-500/20 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Outer Orbit Path - SVG Dashed Rings */}
        <div className="absolute w-[350px] h-[350px] rounded-full border border-dashed border-brand-300/40 pointer-events-none" />
        <div className="absolute w-[250px] h-[250px] rounded-full border border-slate-200/50 pointer-events-none" />

        {/* Rotating Orbit Container */}
        <div className="absolute inset-0 flex items-center justify-center animate-orbitSlow pointer-events-none">
          {SATELLITES.map((sat) => {
            const Icon = sat.icon;

            return (
              /* Layer 1: Static inline polar anchor on the orbit circle */
              <div
                key={sat.id}
                className="absolute top-1/2 left-1/2 pointer-events-auto"
                style={{
                  transform: `rotate(${sat.angle}deg) translate(${orbitRadius}px) rotate(-${sat.angle}deg)`,
                }}
              >
                {/* Layer 2: Static inline centering offset */}
                <div style={{ transform: 'translate(-50%, -50%)' }}>
                  {/* Layer 3: Counter-rotation to keep card upright while container spins */}
                  <div className="animate-orbitReverseSlow group">
                    <div
                      className={`relative flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${sat.bgLight}`}
                    >
                      <div className={`p-1.5 sm:p-2 rounded-xl bg-gradient-to-br ${sat.color} text-white shadow-sm shrink-0`}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="text-left whitespace-nowrap">
                        <p className="text-xs font-bold text-slate-800 leading-none">
                          {sat.name}
                        </p>
                        <p className="text-[10px] text-slate-500 hidden sm:block mt-0.5 font-medium">
                          {sat.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Hub Core */}
        <div className="relative z-20 flex flex-col items-center justify-center p-6 sm:p-8 rounded-full bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950 text-white shadow-2xl border-4 border-white/80 backdrop-blur-xl group hover:scale-105 transition-transform duration-300">
          <div className="absolute -inset-2 rounded-full bg-brand-500/30 blur-md animate-pulseGlow pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="p-3.5 bg-gradient-to-tr from-brand-600 to-blue-500 rounded-2xl shadow-lg shadow-brand-500/40 text-white">
                <Ship className="w-7 h-7 animate-bob" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>

            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-400" /> CargoShare
            </span>
            <span className="text-sm font-bold text-white tracking-tight">
              AI Engine Hub
            </span>
            <span className="text-[10px] text-brand-200/80 mt-0.5">
              Real-time Consolidation
            </span>
          </div>
        </div>

      </div>

      {/* Mobile Fallback: Compact stacked ecosystem card for small screens */}
      <div className="sm:hidden bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-brand-600 rounded-2xl text-white">
            <Ship className="w-5 h-5 animate-bob" />
          </div>
          <div>
            <h3 className="text-sm font-bold">CargoShare AI Hub</h3>
            <p className="text-xs text-slate-400">Autonomous Container Marketplace</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {SATELLITES.map((sat) => {
            const Icon = sat.icon;
            return (
              <div key={sat.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <Icon className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span className="font-semibold text-slate-200 truncate">{sat.name}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
