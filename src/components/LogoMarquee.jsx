import React from 'react';
import { Anchor, Ship, Waves, Compass, Globe, Container, ShieldCheck, Cpu } from 'lucide-react';

const PARTNERS = [
  { name: 'Pacific Sealink', icon: Anchor },
  { name: 'Trans-Atlantic Cargo', icon: Ship },
  { name: 'Nordic Sea Express', icon: Waves },
  { name: 'Asia-Pacific Forwarding', icon: Compass },
  { name: 'Global Port Authority', icon: Globe },
  { name: 'Mediterranean Freight Corp', icon: Container },
  { name: 'InsurShip Marine', icon: ShieldCheck },
  { name: 'AutoRoute Intelligence', icon: Cpu },
];

function MarqueeRow({ reverse = false }) {
  // Duplicate for seamless loop
  const items = [...PARTNERS, ...PARTNERS];

  return (
    <div className="flex overflow-hidden relative group">
      <div
        className={`flex shrink-0 gap-8 py-4 ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        } group-hover:[animation-play-state:paused]`}
      >
        {items.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={`${p.name}-${i}`}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm whitespace-nowrap hover:border-brand-300 hover:shadow-md transition-all duration-200"
            >
              <Icon className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="text-sm font-semibold text-slate-700">{p.name}</span>
            </div>
          );
        })}
      </div>
      {/* Duplicate for seamless loop */}
      <div
        aria-hidden
        className={`flex shrink-0 gap-8 py-4 ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        } group-hover:[animation-play-state:paused]`}
      >
        {items.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={`dup-${p.name}-${i}`}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm whitespace-nowrap hover:border-brand-300 hover:shadow-md transition-all duration-200"
            >
              <Icon className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="text-sm font-semibold text-slate-700">{p.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LogoMarquee() {
  return (
    <section className="py-12 bg-slate-50 border-t border-b border-slate-200 overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

      <div className="text-center mb-4">
        <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
          Trusted by Leading Maritime & Logistics Companies
        </p>
      </div>

      <MarqueeRow />
      <MarqueeRow reverse />
    </section>
  );
}
