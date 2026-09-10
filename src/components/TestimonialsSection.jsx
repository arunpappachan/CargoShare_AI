import React from 'react';
import { Star, Quote, ShieldCheck, CheckCircle, Ship, Award, Anchor, Container, Waves, Compass, Globe } from 'lucide-react';
import TiltCard from './common/TiltCard';

const TESTIMONIALS = [
  {
    id: 1,
    quote: "We used to pay for half-empty 20ft containers for our seasonal textile exports. With CargoShare AI, we book only 4 to 8 CBM and cut our freight bills by over 35%.",
    author: "Priya Sharma",
    role: "Director of Logistics",
    company: "SilkRoute Handicrafts SME",
    initials: "PS",
    badge: "Verified Exporter",
    accent: "bg-amber-100 text-amber-700",
  },
  {
    id: 2,
    quote: "Filling remaining slot capacity 48 hours before departure was always a loss. The automated matching engine filled our secondary bays with zero friction.",
    author: "Capt. Ronald Lee",
    role: "Fleet Operations Manager",
    company: "Oceanic Maritime Carriers",
    initials: "RL",
    badge: "Verified Carrier",
    accent: "bg-blue-100 text-blue-700",
  },
  {
    id: 3,
    quote: "The unified documentation and live customs milestones give our clearing agents complete certainty. Shipment tracking is clear from port gate to destination.",
    author: "Elena Rostova",
    role: "Global Trade Compliance Lead",
    company: "Vanguard Forwarding",
    initials: "ER",
    badge: "Customs Specialist",
    accent: "bg-emerald-100 text-emerald-700",
  },
];

const TRUST_PARTNERS = [
  { name: "Pacific Sealink", icon: Anchor },
  { name: "Trans-Atlantic Cargo", icon: Container },
  { name: "Nordic Sea Express", icon: Waves },
  { name: "Asia-Pacific Forwarding", icon: Compass },
  { name: "Global Port Escrow", icon: Globe },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-4 shadow-sm">
            <Award className="w-3.5 h-3.5 text-brand-600" />
            <span>Trusted Worldwide</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Built for Real Maritime Trade
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Hear from global SMEs, container line operators, and logistics professionals who depend on CargoShare AI.
          </p>
        </div>

        {/* Testimonials 3-column Grid with TiltCard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {TESTIMONIALS.map((t) => (
            <TiltCard
              key={t.id}
              maxTilt={7}
              className="h-full"
            >
              <div className="h-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-brand-300 transition-colors duration-300">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-slate-200" />
                  </div>

                  <p className="text-slate-700 text-sm leading-relaxed mb-8 italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                  <div className="w-11 h-11 rounded-2xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-brand-500/20">
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {t.author}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {t.role} • {t.company}
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* Partner Trust Strip */}
        <div className="pt-10 border-t border-slate-200 text-center">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-6">
            Compatible with Leading Sea Carriers & Freight Forwarders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-60">
            {TRUST_PARTNERS.map((partner, idx) => {
              const Icon = partner.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-slate-500 font-bold text-sm tracking-tight hover:opacity-100 hover:text-slate-800 transition-opacity"
                >
                  <Icon className="w-4 h-4 text-brand-600" />
                  <span>{partner.name}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
