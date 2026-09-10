import React from 'react';
import { Search, Ship, MapPin, ArrowRight, CircleDot } from 'lucide-react';
import RevealSection from './common/RevealSection';

export default function ProductPreview() {
  return (
    <RevealSection className="py-24 bg-white border-t border-slate-100" id="product">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            See the platform in action
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            A live look at how exporters search, compare, and book shared container space.
          </p>
        </div>

        {/* Browser-chrome mockup */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden">
          {/* Chrome bar */}
          <div className="flex items-center gap-2 bg-slate-100 border-b border-slate-200 px-4 py-3">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <div className="ml-4 flex-1 bg-white rounded-lg px-3 py-1 text-xs text-slate-400 border border-slate-200">
              app.cargoshare.ai/dashboard/exporter
            </div>
          </div>

          {/* Fake dashboard body */}
          <div className="bg-slate-50 p-6 sm:p-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
                <MapPin className="w-4 h-4 text-brand-600" /> Chennai &rarr; Mumbai
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
                6.5 CBM
              </div>
              <button className="ml-auto flex items-center gap-2 bg-brand-600 text-white text-sm font-bold px-4 py-2 rounded-xl">
                <Search className="w-4 h-4" /> Search
              </button>
            </div>

            {[
              { carrier: 'Oceanic Maritime Carriers', eta: '18 days', price: '₹412', match: 98 },
              { carrier: 'Nordic Sea Express', eta: '21 days', price: '₹379', match: 91 },
            ].map((row) => (
              <div key={row.carrier} className="bg-white rounded-2xl border border-slate-200 p-4 mb-3 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Ship className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{row.carrier}</p>
                  <p className="text-xs text-slate-500">ETA {row.eta}</p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <CircleDot className="w-3 h-3" /> {row.match}% match
                </div>
                <div className="text-sm font-extrabold text-slate-900">{row.price}</div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
