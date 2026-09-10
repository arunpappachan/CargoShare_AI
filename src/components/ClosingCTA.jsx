import React from 'react';
import { ArrowRight, Anchor } from 'lucide-react';
import MagneticButton from './common/MagneticButton';
import RevealSection from './common/RevealSection';

export default function ClosingCTA() {
  return (
    <RevealSection className="relative overflow-hidden bg-slate-900">
      {/* Layered gradient + glow, echoes the hero treatment so the page feels bookended */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-slate-900 to-indigo-950" />
      <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full bg-brand-500/20 blur-[120px]" />
      <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full bg-indigo-500/20 blur-[120px]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] mix-blend-overlay" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-brand-200 text-xs font-bold mb-6">
          <Anchor className="w-3.5 h-3.5" />
          <span>Book your first shared container in minutes</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
          Ready to ship smarter?
        </h2>
        <p className="text-brand-100/80 text-base sm:text-lg max-w-2xl mx-auto mb-10">
          Join exporters and carriers already cutting freight costs and filling
          idle capacity on CargoShare AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <MagneticButton
            to="/register"
            className="inline-flex justify-center items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-semibold shadow-xl shadow-black/20 hover:shadow-white/20 transition-all duration-300"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </MagneticButton>
          <a
            href="#how-it-works"
            className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-2xl font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/15 transition-all"
          >
            See How it Works
          </a>
        </div>
      </div>
    </RevealSection>
  );
}
