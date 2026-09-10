import React, { useState, useMemo } from 'react';
import { Calculator, TrendingDown, Box, ArrowRight, Sparkles } from 'lucide-react';
import RevealSection from './common/RevealSection';

const ROUTES = [
  { label: 'Chennai → Mumbai', baseCost: 24000, perCBM: 680 },
  { label: 'Mumbai → Kochi', baseCost: 26000, perCBM: 720 },
  { label: 'Kolkata → Chennai', baseCost: 31000, perCBM: 850 },
  { label: 'Mundra → Nhava Sheva', baseCost: 22000, perCBM: 620 },
  { label: 'Visakhapatnam → Kandla', baseCost: 18000, perCBM: 550 },
];

export default function SavingsCalculator() {
  const [routeIdx, setRouteIdx] = useState(0);
  const [cbm, setCbm] = useState(8);

  const route = ROUTES[routeIdx];

  const result = useMemo(() => {
    const fullTEU = route.baseCost; // traditional full-container cost
    const cargoshareCost = Math.round(route.perCBM * cbm);
    const saved = Math.max(fullTEU - cargoshareCost, 0);
    const percent = fullTEU > 0 ? Math.round((saved / fullTEU) * 100) : 0;
    return { fullTEU, cargoshareCost, saved, percent };
  }, [route, cbm]);

  return (
    <RevealSection className="py-24 bg-white border-t border-slate-100 relative overflow-hidden" id="calculator">
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-100/40 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-4 shadow-sm">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Savings Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            See how much you could save
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Adjust your route and cargo volume to instantly compare full-container rates vs. CargoShare AI shared pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* Controls */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Trade Route
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROUTES.map((r, i) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setRouteIdx(i)}
                    className={`text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 border ${
                      routeIdx === i
                        ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-500/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Cargo Volume: <span className="text-brand-600 text-sm">{cbm} CBM</span>
              </label>
              <input
                type="range"
                min={1}
                max={30}
                value={cbm}
                onChange={(e) => setCbm(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                <span>1 CBM</span>
                <span>15 CBM</span>
                <span>30 CBM</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Traditional cost */}
            <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-200 text-slate-500">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Traditional Full TEU</p>
                    <p className="text-xs text-slate-400">20ft container, fixed price</p>
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900">₹{result.fullTEU.toLocaleString()}</p>
              </div>
            </div>

            {/* CargoShare cost */}
            <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-2xl p-5 border border-brand-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-600 text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-700 uppercase">CargoShare AI</p>
                    <p className="text-xs text-brand-500">Pay only {cbm} CBM</p>
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-brand-700">₹{result.cargoshareCost.toLocaleString()}</p>
              </div>
            </div>

            {/* Savings highlight */}
            <div className="relative bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.06] mix-blend-overlay" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">You Save</p>
                    <p className="text-xs text-emerald-100">On this route with {cbm} CBM</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold">₹{result.saved.toLocaleString()}</p>
                  <p className="text-sm font-bold text-emerald-100">{result.percent}% lower</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <a
              href="/register"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-slate-900/10"
            >
              Start saving now <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
    </RevealSection>
  );
}
