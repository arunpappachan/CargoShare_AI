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
    angle: 0, // Top
  },
  {
    id: 'carrier',
    name: 'Ocean Carriers',
    desc: 'Fill unutilized slots',
    icon: Ship,
    color: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-500/15 border-blue-400/40 text-blue-300',
    angle: 72,
  },
  {
    id: 'ai-engine',
    name: 'AI Routing Engine',
    desc: 'Predictive consolidation',
    icon: Cpu,
    color: 'from-brand-500 to-indigo-500',
    bgLight: 'bg-brand-500/15 border-brand-400/40 text-brand-300',
    angle: 144,
  },
  {
    id: 'customs',
    name: 'Customs & Docs',
    desc: 'Automated clearance',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300',
    angle: 216,
  },
  {
    id: 'payments',
    name: 'Escrow & Pay',
    desc: 'Smart contract settlements',
    icon: CreditCard,
    color: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-500/15 border-violet-400/40 text-violet-300',
    angle: 288,
  },
];

export default function OrbitHub() {
  return (
    <div className="relative w-full max-w-[460px] aspect-square mx-auto flex items-center justify-center select-none py-6">
      
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-500/20 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Outer Orbit Path - SVG Dashed Ring with particle blip */}
      <div className="absolute inset-4 rounded-full border border-dashed border-brand-300/40 pointer-events-none" />
      <div className="absolute inset-16 rounded-full border border-slate-200/50 pointer-events-none" />

      {/* Rotating Orbit Container */}
      <div className="absolute inset-4 rounded-full animate-orbit pointer-events-none">
        {SATELLITES.map((sat) => {
          const Icon = sat.icon;
          // Calculate polar position on the ring (radius 50%)
          const rad = (sat.angle * Math.PI) / 180;
          // center is at 50%, 50%
          const left = 50 + 50 * Math.cos(rad);
          const top = 50 + 50 * Math.sin(rad);

          return (
            <div
              key={sat.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Counter-rotating child keeps the satellite upright! */}
              <div className="animate-orbitReverse group">
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
  );
}
