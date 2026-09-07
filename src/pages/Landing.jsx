import React from 'react';
import { Link } from 'react-router-dom';
import { Box, TrendingDown, ShieldCheck, Zap, ArrowRight, Ship, Search, Cpu, CreditCard, Map } from 'lucide-react';

export default function Landing() {
  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-40 overflow-hidden bg-gradient-to-br from-brand-100 via-blue-50 to-indigo-100 animate-gradient-xy">
        {/* Dynamic Abstract Background Mesh */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] z-0 mix-blend-overlay"></div>
        <div className="absolute top-0 right-10 w-[500px] h-[500px] rounded-full bg-brand-400/20 blur-[120px] mix-blend-multiply animate-pulseGlow pointer-events-none z-0"></div>
        <div className="absolute bottom-10 left-10 w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[150px] mix-blend-multiply animate-pulseGlow pointer-events-none z-0" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-emerald-400/10 blur-[150px] mix-blend-multiply pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Floating UI Elements removed per request for a cleaner international look */}

          <div className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-brand-200 text-brand-700 text-sm font-bold mb-8 shadow-sm shadow-brand-500/5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Smarter Logistics for SMEs</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
              Share Containers. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 drop-shadow-sm">
                Multiply Growth.
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              An AI-powered container-sharing logistics marketplace. Book only the space you need and let our intelligent engine handle the rest.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="inline-flex justify-center items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl font-semibold hover:bg-brand-600 shadow-xl shadow-slate-900/20 hover:shadow-brand-500/30 hover:-translate-y-1 transition-all duration-300"
              >
                Start Shipping <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why choose CargoShare AI?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Our platform bridges the gap between small exporters and shipping companies to make global trade accessible and efficient.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:border-brand-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Reduce Shipping Costs</h3>
              <p className="text-slate-600">Pay only for the container space you actually need instead of booking an entire container. Perfect for SMEs.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:border-brand-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 transition-transform">
                <Box className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Maximize Utilization</h3>
              <p className="text-slate-600">Shipping companies can fill empty space intelligently, turning unutilized capacity into new revenue streams.</p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:border-brand-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Recommendations</h3>
              <p className="text-slate-600">Our machine learning models recommend the best shipping options based on cost, transit time, and reliability.</p>
            </div>
          </div>
        </div>
      </section>
      {/* How it Works & Animation */}
      <section className="py-24 bg-brand-900 text-white overflow-hidden relative" id="how-it-works">
        {/* Animated Cargo Ship */}
        <div className="absolute top-10 left-0 w-full h-32 opacity-10 pointer-events-none">
          <div className="animate-sail absolute">
            <Ship className="w-48 h-48 text-brand-100 animate-bob" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it Works</h2>
            <p className="text-brand-200 max-w-2xl mx-auto">A seamless workflow connecting exporters to the best shipping options.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-4 relative">
              <div className="w-16 h-16 mx-auto bg-brand-800 rounded-2xl flex items-center justify-center border-4 border-brand-700 z-10 relative text-brand-300">
                <Search className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold">1. Search Space</h4>
              <p className="text-sm text-brand-300">SMEs specify cargo volume and destination.</p>
            </div>
            
            <div className="space-y-4 relative">
              <div className="w-16 h-16 mx-auto bg-brand-800 rounded-2xl flex items-center justify-center border-4 border-brand-700 z-10 relative text-brand-300">
                <Cpu className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold">2. AI Optimization</h4>
              <p className="text-sm text-brand-300">Our engine finds the most efficient shared space.</p>
            </div>
            
            <div className="space-y-4 relative">
              <div className="w-16 h-16 mx-auto bg-brand-800 rounded-2xl flex items-center justify-center border-4 border-brand-700 z-10 relative text-brand-300">
                <CreditCard className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold">3. Book & Pay</h4>
              <p className="text-sm text-brand-300">Secure digital contracts and integrated payments.</p>
            </div>
            
            <div className="space-y-4 relative">
              <div className="w-16 h-16 mx-auto bg-brand-800 rounded-2xl flex items-center justify-center border-4 border-brand-700 z-10 relative text-brand-300">
                <Map className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold">4. Track & Ship</h4>
              <p className="text-sm text-brand-300">Real-time GPS tracking and customs documentation.</p>
            </div>
          </div>
        </div>
      </section>


      {/* About Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200" id="about">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">About CargoShare AI</h2>
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 text-lg text-slate-700 leading-relaxed text-justify sm:text-center space-y-6">
            <p>
              CargoShare AI is an AI-powered container-sharing logistics marketplace designed to bridge the gap between small exporters and shipping companies by enabling exporters to book only the container space they require instead of an entire container.
            </p>
            <p>
              The platform provides a centralized digital ecosystem where exporters, shipping companies, customs officers, importers, and administrators can securely manage bookings, documentation, payments, and shipment tracking through an integrated web-based application.
            </p>
          </div>
        </div>
      </section>
      
    </div>
  );
}
