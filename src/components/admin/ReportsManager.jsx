import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Eye, 
  Search, 
  Filter, 
  Ship, 
  Building2, 
  Layers, 
  IndianRupee, 
  Package, 
  Download, 
  Printer, 
  ExternalLink, 
  Compass, 
  Award, 
  Activity, 
  Check, 
  Sparkles, 
  Percent, 
  Calendar, 
  Info,
  Zap,
  Globe
} from 'lucide-react';

export default function ReportsManager() {
  const [timeframe, setTimeframe] = useState('q3');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  // Executive Master Intelligence Reports
  const [reports] = useState([
    {
      id: 'REP-2026-Q3-FIN',
      title: 'Q3 Financial & Automated Escrow Audit',
      category: 'Financial & Escrow',
      date: '2026-10-24',
      author: 'CargoShare Smart Escrow Engine',
      metric: '₹288.6k GMV • ₹14.4k Platform Fee',
      status: 'Audited & Reconciled',
      summary: 'Comprehensive platform-wide financial audit reconciling 25% advance deposits, 75% balance settlements, and automated 5% platform service fee collections.',
      keyFindings: [
        'Total Gross Merchandise Value (GMV) reached ₹288,600 across 38 bookings.',
        'Zero escrow leakage; 100% of two-stage payments secured via UPI QR & smart escrow.',
        'Average payout cycle to commercial shipping lines compressed to 4.2 hours upon delivery.'
      ],
      methodology: 'Automated cryptographic reconciliation against bank UTR numbers and smart escrow contract logs.'
    },
    {
      id: 'REP-2026-FLEET-CAP',
      title: 'Commercial Fleet Slot Utilization & Allocation',
      category: 'Fleet & Carriers',
      date: '2026-10-22',
      author: 'Maritime Operations Intelligence',
      metric: '74.4% Fleet Slot Fill Rate',
      status: 'Verified Operations',
      summary: 'Evaluation of container space listed by commercial ocean liners vs. actual cargo volume booked and consolidated by SME exporters.',
      keyFindings: [
        'Total commercial fleet capacity deployed across partner carriers: 245,000 CBM.',
        'Consolidated exporter bookings consumed 182,400 CBM of space.',
        'Oceanic Freight Ltd. achieved the highest slot utilization score at 78.8%.'
      ],
      methodology: 'Real-time telemetry aggregation from vessel AIS tracking, EDI manifests, and carrier space postings.'
    },
    {
      id: 'REP-2026-APPROVAL-VEL',
      title: 'Two-Stage Carrier Approval & Booking Velocity',
      category: 'Workflow & SLAs',
      date: '2026-10-20',
      author: 'Platform SLA Monitor',
      metric: '2.4 Hours Avg Approval SLA',
      status: 'Compliant (98.7%)',
      summary: 'Analysis of carrier response times to exporter shipping document uploads (Commercial Invoice, Packing List, Shipping Bill) following 25% advance payment.',
      keyFindings: [
        '96.2% of bookings approved by carriers on the first submission without doc revisions.',
        'Average carrier review turnaround: 2 hours 24 minutes (down from 8.6 hours in Q2).',
        'Stage 1 advance to Stage 3 final balance completion rate reached 98.9%.'
      ],
      methodology: 'System event timestamp diffing between payment confirmation and carrier approval dispatch.'
    },
    {
      id: 'REP-2026-CORRIDOR-TR',
      title: 'Indian Coastal & International Corridor Throughput',
      category: 'Trade Corridors',
      date: '2026-10-18',
      author: 'Corridor Analytics Lab',
      metric: 'Mumbai-Mundra: 38% Volume',
      status: 'Benchmark Active',
      summary: 'Port-to-port trade volume distribution across Western, Eastern, and international coastal container routes.',
      keyFindings: [
        'Mumbai (JNPT) ↔ Mundra Port remains the highest throughput route with 38% of total volume.',
        'Cochin Port ↔ Visakhapatnam Port demonstrated the fastest month-over-month growth at +26.4%.',
        'International feeder route Nhava Sheva ↔ Jebel Ali, UAE recorded 99.1% on-time container vessel departures.'
      ],
      methodology: 'Vessel departure/arrival port logs correlated with customs clearance EDI filings.'
    },
    {
      id: 'REP-2026-ESG-CARBON',
      title: 'Container Consolidation ESG & Carbon Offset Report',
      category: 'Sustainability (ESG)',
      date: '2026-10-15',
      author: 'Green Maritime Initiative',
      metric: '428 Metric Tons CO₂ Avoided',
      status: 'ISO 14064 Aligned',
      summary: 'Environmental impact analysis detailing greenhouse gas emission reductions achieved by consolidating LCL cargo into shared slots rather than running underutilized containers.',
      keyFindings: [
        'Sharing container space avoided 428.6 metric tons of CO₂ equivalent emissions in Q3.',
        'Average container capacity utilization increased from 42% (traditional LCL) to 84% on CargoShare AI.',
        'Participating SME exporters earned verified Green Maritime Carbon Offset certificates.'
      ],
      methodology: 'Calculated using Clean Cargo Working Group (CCWG) maritime emissions baseline factors.'
    }
  ]);

  // Filter reports
  const filteredReports = reports.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.metric.toLowerCase().includes(q);

    if (categoryFilter === 'financial') return matchesSearch && r.category.includes('Financial');
    if (categoryFilter === 'fleet') return matchesSearch && r.category.includes('Fleet');
    if (categoryFilter === 'workflow') return matchesSearch && r.category.includes('Workflow');
    if (categoryFilter === 'corridors') return matchesSearch && r.category.includes('Corridors');
    if (categoryFilter === 'esg') return matchesSearch && r.category.includes('Sustainability');

    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              📊 Executive Platform Analytics & Intelligence Reports
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-600" /> Read-Only Intelligence View
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">
            Supervisory analytics evaluating commercial freight volumes, 5% escrow commission revenue, carrier fill rates, and route throughput.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === '30d' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeframe('q3')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'q3' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Q3 2026
            </button>
            <button
              onClick={() => setTimeframe('ytd')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'ytd' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              YTD 2026
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Audit Only (No Edit/Delete)</span>
          </div>
        </div>
      </div>

      {/* Top Analytical KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Freight GMV</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹288.6k</div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> +22.4% MoM
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform Take Rate</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">5.0%</div>
          <span className="text-[10px] text-emerald-600 font-semibold">₹14.4k Realized Fees</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cargo Consolidated</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900">182.4k <span className="text-xs font-bold text-slate-400">CBM</span></div>
          <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> +14.8% growth
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fleet Slot Fill Rate</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Ship className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900">74.4%</div>
          <span className="text-[10px] text-indigo-600 font-semibold">+6.2% vs industry avg</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approval Velocity</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">2.4 <span className="text-xs font-bold text-slate-400">Hrs</span></div>
          <span className="text-[10px] text-amber-600 font-semibold">96.2% Carrier SLA</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CO₂ Avoided</span>
            <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-700">428 <span className="text-xs font-bold text-slate-400">MT</span></div>
          <span className="text-[10px] text-teal-600 font-semibold">Shared slot efficiency</span>
        </div>

      </div>

      {/* Analytical Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Monthly Freight Volume & 5% Platform Revenue Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-600" />
                <span>Monthly Freight Volume & Commission Revenue</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Total booked CBM (bars) vs. 5% platform take rate (line)</p>
            </div>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
              May – Oct 2026
            </span>
          </div>

          {/* Custom SVG Modern Trend Visualization */}
          <div className="relative pt-4 pb-2">
            <div className="h-44 w-full flex items-end justify-between gap-3 px-2">
              {[
                { month: 'May', cbm: 24, gmv: 34, comm: 1.7 },
                { month: 'Jun', cbm: 31, gmv: 42, comm: 2.1 },
                { month: 'Jul', cbm: 42, gmv: 58, comm: 2.9 },
                { month: 'Aug', cbm: 58, gmv: 76, comm: 3.8 },
                { month: 'Sep', cbm: 74, gmv: 98, comm: 4.9 },
                { month: 'Oct', cbm: 92, gmv: 124, comm: 6.2 },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{bar.comm}k
                  </div>
                  
                  {/* Visual Bar Stack */}
                  <div className="w-full bg-slate-100 rounded-xl relative overflow-hidden flex flex-col justify-end" style={{ height: '120px' }}>
                    <div 
                      className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-xl transition-all duration-700 group-hover:brightness-110"
                      style={{ height: `${(bar.cbm / 100) * 100}%` }}
                    ></div>
                  </div>

                  <span className="text-[11px] font-bold text-slate-700">{bar.month}</span>
                  <span className="text-[9px] font-medium text-slate-400">{bar.cbm}k CBM</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-3 border-t border-slate-100 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-600 inline-block"></span>
                <span>Container Space Volume (CBM)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>5% Platform Take Rate Realized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Partner Carrier Fleet Capacity & Slot Fill Rates */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Ship className="w-4 h-4 text-blue-600" />
                <span>Partner Shipping Lines — Fleet Fill Rates</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Capacity allocated vs. listed container space</p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              5 Partner Liners
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {[
              { name: 'Oceanic Freight Ltd.', listed: '65k CBM', booked: '51.2k CBM', pct: 78.8, color: 'bg-blue-600' },
              { name: 'Maersk Line Logistics', listed: '75k CBM', booked: '58.5k CBM', pct: 78.0, color: 'bg-sky-500' },
              { name: 'Hapag-Lloyd Maritime', listed: '40k CBM', booked: '29.4k CBM', pct: 73.5, color: 'bg-indigo-600' },
              { name: 'CMA CGM Global Logistics', listed: '30k CBM', booked: '21.5k CBM', pct: 71.7, color: 'bg-purple-600' },
              { name: 'Pacific Blue Shipping Co.', listed: '35k CBM', booked: '24.8k CBM', pct: 70.9, color: 'bg-emerald-600' },
            ].map((carrier, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-slate-800">{carrier.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-normal text-[11px]">{carrier.booked} / {carrier.listed}</span>
                    <strong className="text-slate-900 font-bold">{carrier.pct}% Fill</strong>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${carrier.color}`} style={{ width: `${carrier.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Overall Fleet Fill Average: <strong className="text-slate-900 font-bold">74.4%</strong></span>
            <span className="text-emerald-600 font-bold">Target SLA: 70%+</span>
          </div>
        </div>

      </div>

      {/* Two-Stage Escrow & Route Corridor Performance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Trade Lane & Route Reliability */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-red-500" />
                <span>Trade Corridors Throughput & Reliability</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Transit duration and on-time performance</p>
            </div>
            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
              Sea Routes
            </span>
          </div>

          <div className="space-y-3">
            {[
              { route: 'Mumbai (JNPT) ↔ Mundra Port', share: '38%', onTime: '99.2%', transit: '48h avg' },
              { route: 'Cochin Port ↔ Visakhapatnam', share: '24%', onTime: '98.4%', transit: '72h avg' },
              { route: 'Chennai Port ↔ Kolkata Port', share: '20%', onTime: '97.9%', transit: '60h avg' },
              { route: 'Nhava Sheva ↔ Jebel Ali, UAE', share: '18%', onTime: '99.1%', transit: '96h avg' },
            ].map((lane, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block font-bold">{lane.route}</strong>
                  <span className="text-[11px] text-slate-400">Transit: {lane.transit}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-indigo-700 block">{lane.share} Share</span>
                  <span className="text-[10px] font-bold text-emerald-600">{lane.onTime} On-Time</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Stage Payment Funnel & Approval Velocity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Two-Stage Escrow & Approval Conversion Funnel</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Stage 1 advance → Carrier approval → Stage 3 settlement</p>
            </div>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
              98.9% Conversion
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex justify-between items-center">
              <div>
                <strong className="text-purple-950 block">1. Space Booked & 25% Advance Paid</strong>
                <span className="text-[11px] text-purple-700">Held securely in smart escrow</span>
              </div>
              <span className="font-black text-purple-900 text-sm">100% (140)</span>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex justify-between items-center ml-3">
              <div>
                <strong className="text-indigo-950 block">2. Carrier Approved Shipping Docs</strong>
                <span className="text-[11px] text-indigo-700">Commercial Invoice & EDI verified (2.4h avg)</span>
              </div>
              <span className="font-black text-indigo-900 text-sm">96.2% (135)</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center ml-6">
              <div>
                <strong className="text-emerald-950 block">3. Exporter 75% Balance Settled</strong>
                <span className="text-[11px] text-emerald-700">Full payment cleared prior to container gate-in</span>
              </div>
              <span className="font-black text-emerald-900 text-sm">95.1% (133)</span>
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xs flex justify-between items-center ml-9">
              <div>
                <strong className="text-white block">4. Cargo Delivered & 5% Fee Realized</strong>
                <span className="text-[11px] text-slate-300">Carrier disbursed 95% net payout</span>
              </div>
              <span className="font-black text-emerald-400 text-sm">94.4% (131)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Master Intelligence Reports Registry */}
      <div className="space-y-4">
        
        {/* Search and Category Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by ID, topic, metric, category..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto">
            {[
              { id: 'all', label: `All Reports (${reports.length})` },
              { id: 'financial', label: 'Financial & Escrow' },
              { id: 'fleet', label: 'Fleet & Carriers' },
              { id: 'workflow', label: 'Workflow & SLAs' },
              { id: 'corridors', label: 'Trade Corridors' },
              { id: 'esg', label: 'Sustainability (ESG)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  categoryFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Table (Read-Only) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-4">Report Reference</th>
                  <th className="px-5 py-4">Title & Description</th>
                  <th className="px-5 py-4">Domain Category</th>
                  <th className="px-5 py-4">Key Performance Metric</th>
                  <th className="px-5 py-4">Audit Status</th>
                  <th className="px-5 py-4 text-right">Audit Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Report Reference */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md text-xs inline-block">
                        {r.id}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{r.date}</span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-5 py-4">
                      <strong className="text-slate-900 text-xs block font-bold">{r.title}</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm line-clamp-1">{r.summary}</p>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {r.category}
                      </span>
                    </td>

                    {/* Key Metric */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-black text-slate-900 text-xs">{r.metric}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{r.author}</span>
                    </td>

                    {/* Audit Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {r.status}
                      </span>
                    </td>

                    {/* Dossier Action */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedReport(r)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Inspect full audit intelligence dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Report</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ----------------- COMPREHENSIVE INTELLIGENCE REPORT DOSSIER MODAL ----------------- */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{selectedReport.title}</span>
                    <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
                      {selectedReport.id}
                    </span>
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Issued on {selectedReport.date} by {selectedReport.author}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedReport(null)} 
                className="text-slate-400 hover:text-slate-600 text-2xl font-light leading-none cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Executive Summary Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Executive Summary</span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedReport.summary}
                </p>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500">Benchmark Key Indicator:</span>
                  <strong className="text-indigo-900 font-bold">{selectedReport.metric}</strong>
                </div>
              </div>

              {/* Key Audit Findings */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Key Audit Findings & Verified Metrics
                </h4>
                <div className="space-y-2">
                  {selectedReport.keyFindings.map((finding, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methodology & Verification */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-2">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Auditing Methodology</span>
                <p className="text-slate-600 leading-relaxed">
                  {selectedReport.methodology}
                </p>
                <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500">
                  <span>Tamper-Proof Audit Hash: 0x9f8b...2b5e</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Cryptographically Verified
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Official electronic platform report certified for administrator review.
              </span>
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
