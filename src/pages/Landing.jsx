import React from 'react';
import { Link } from 'react-router-dom';
import { Box, TrendingDown, ShieldCheck, Zap, ArrowRight, Ship, Search, Cpu, CreditCard, Map, CheckCircle, Sparkles } from 'lucide-react';
import OrbitHub from '../components/OrbitHub';
import StatsSection from '../components/StatsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ProductPreview from '../components/ProductPreview';
import SavingsCalculator from '../components/SavingsCalculator';
import ClosingCTA from '../components/ClosingCTA';
import RevealSection from '../components/common/RevealSection';
import TiltCard from '../components/common/TiltCard';
import MagneticButton from '../components/common/MagneticButton';

export default function Landing() {
  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 md:pt-24 md:pb-36 overflow-hidden bg-gradient-to-br from-brand-100 via-blue-50 to-indigo-100 animate-gradient-xy">
        {/* Dynamic Abstract Background Mesh */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] z-0 mix-blend-overlay"></div>
        <div className="absolute top-0 right-10 w-[500px] h-[500px] rounded-full bg-brand-400/20 blur-[120px] mix-blend-multiply animate-pulseGlow pointer-events-none z-0"></div>
        <div className="absolute bottom-10 left-10 w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[150px] mix-blend-multiply animate-pulseGlow pointer-events-none z-0" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-emerald-400/10 blur-[150px] mix-blend-multiply pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Text & Action Column */}
            <div className="lg:col-span-7 text-center lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-brand-200 text-brand-700 text-xs sm:text-sm font-bold mb-6 shadow-sm shadow-brand-500/10">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Next-Gen Smart Logistics for SMEs</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                Share Containers. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 drop-shadow-sm">
                  Multiply Growth.
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                The AI-powered container-sharing marketplace. Book only the space you need, share ocean freight with verified shippers, and let our intelligent engine orchestrate routes and compliance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-10">
                <MagneticButton 
                  as={Link}
                  to="/register" 
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-brand-600 shadow-xl shadow-slate-900/20 hover:shadow-brand-500/30 transition-all duration-300"
                >
                  Start Shipping <ArrowRight className="w-5 h-5" />
                </MagneticButton>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-7 py-4 rounded-2xl font-semibold bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-sm hover:shadow transition-all"
                >
                  See How it Works
                </a>
              </div>

              {/* Micro-trust indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>No Minimum TEU Limit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Verified Ocean Carriers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Smart Escrow Protection</span>
                </div>
              </div>

            </div>

            {/* Right Hero Moving Orbit Visual */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <OrbitHub />
            </div>

          </div>

        </div>
      </section>

      {/* Floating Animated Stats Strip */}
      <StatsSection />

      {/* Features Section */}
      <RevealSection className="py-24 bg-white relative overflow-hidden" id="features">
        {/* Subtle dot-grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Why choose CargoShare AI?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
              Our digital platform bridges the gap between SME exporters and shipping carriers to make global maritime trade accessible, affordable, and transparent.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TiltCard maxTilt={8}>
              <div className="h-full p-8 rounded-3xl bg-slate-50 border border-slate-100/90 hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                    <TrendingDown className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Reduce Shipping Costs
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Pay only for the exact CBM volume you require rather than chartering an entire empty container. Cut export logistics costs by up to 40%.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-bold text-blue-600">
                  <span>Pay-as-you-ship model</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </TiltCard>
            
            <TiltCard maxTilt={8}>
              <div className="h-full p-8 rounded-3xl bg-slate-50 border border-slate-100/90 hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-6 shadow-sm">
                    <Box className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Maximize Vessel Utilization
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Carriers monetize unallocated slots and last-minute cancellations, turning empty air and deadweight into high-margin shared revenue.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-bold text-brand-600">
                  <span>Zero deadweight loss</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </TiltCard>

            <TiltCard maxTilt={8}>
              <div className="h-full p-8 rounded-3xl bg-slate-50 border border-slate-100/90 hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    AI Routing & Matching
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Our machine learning models calculate optimal container packing, route compatibility, customs clearance windows, and port congestion factors.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <span>Smart consolidation</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </RevealSection>

      {/* Interactive Savings Calculator */}
      <SavingsCalculator />

      {/* Product Live Platform Preview */}
      <ProductPreview />

      {/* Section Transition Soft Blend into Dark Section */}
      <div className="h-20 bg-gradient-to-b from-white to-brand-900 -mb-px relative z-10 pointer-events-none" />

      {/* How it Works & Animation */}
      <RevealSection className="py-24 bg-brand-900 text-white overflow-hidden relative" id="how-it-works">
        {/* Animated Cargo Ship */}
        <div className="absolute top-10 left-0 w-full h-32 opacity-10 pointer-events-none">
          <div className="animate-sail absolute">
            <Ship className="w-48 h-48 text-brand-100 animate-bob" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
              How CargoShare Works
            </h2>
            <p className="text-brand-200 max-w-2xl mx-auto text-base sm:text-lg">
              A frictionless 4-step workflow connecting exporters directly to tier-1 shipping lines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center relative">
            {/* Desktop connector line between steps */}
            <div className="hidden md:block absolute top-[3.5rem] left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-brand-500/30 pointer-events-none z-0" />

            {[
              { step: 1, icon: Search, title: 'Search Space', desc: 'Specify cargo volume (CBM), commodity type, port pairs, and target readiness date.', color: 'from-brand-500 to-cyan-400' },
              { step: 2, icon: Cpu, title: 'AI Optimization', desc: 'Our engine aggregates compatible LCL shipments to book high-priority container bays.', color: 'from-blue-500 to-indigo-400' },
              { step: 3, icon: CreditCard, title: 'Book & Escrow', desc: 'Lock in guaranteed slots with transparent pricing and milestone-protected escrow.', color: 'from-violet-500 to-purple-400' },
              { step: 4, icon: Map, title: 'Track & Clear', desc: 'Live GPS vessel position, dynamic ETAs, and digitized customs documentation.', color: 'from-emerald-500 to-teal-400' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative z-10 space-y-4 p-6 rounded-3xl bg-brand-800 border border-brand-700/60 hover:border-brand-500/60 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 group">
                  {/* Step number badge */}
                  <div className="relative mx-auto">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-brand-900 text-xs font-extrabold flex items-center justify-center shadow-md">
                      {item.step}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{item.title}</h4>
                  <p className="text-sm text-brand-200/90 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </RevealSection>

      {/* Testimonials & Trust Section */}
      <RevealSection>
        <TestimonialsSection />
      </RevealSection>

      {/* About Section - Structured Two-Column Layout */}
      <RevealSection className="py-24 bg-slate-50 border-t border-slate-200" id="about">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
                About CargoShare AI
              </h2>
              <div className="space-y-5 text-slate-700 leading-relaxed">
                <p>
                  CargoShare AI is an AI-powered container-sharing logistics marketplace engineered to
                  dismantle high barrier-to-entry costs for small and medium exporters. By allowing
                  shippers to book exactly the volumetric space they need rather than full TEU
                  containers, we democratize international ocean logistics.
                </p>
                <p>
                  The platform orchestrates a multi-tenant digital ecosystem where exporters, ocean
                  carriers, customs officers, and freight operators collaborate in real time.
                </p>
              </div>
            </div>

            {/* Value pillar list — fills the previously-empty right column */}
            <div className="space-y-4">
              {[
                { icon: Box, title: 'Shared container capacity', text: 'Book by CBM, not by full TEU.' },
                { icon: ShieldCheck, title: 'Escrow-protected bookings', text: 'Funds released on verified milestones.' },
                { icon: Cpu, title: 'AI-matched routing', text: 'Optimal carrier and lane selection, automatically.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-200 transition-colors">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </RevealSection>

      {/* Closing CTA Band */}
      <ClosingCTA />
      
    </div>
  );
}
