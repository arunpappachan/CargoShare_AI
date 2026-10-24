import React, { useState } from 'react';
import { 
  IndianRupee, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Eye, 
  Search, 
  Filter, 
  Ship, 
  Building2, 
  Layers, 
  Receipt, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  Wallet, 
  Percent,
  Calendar,
  CreditCard,
  Check,
  Plus
} from 'lucide-react';
import { autoSyncAllBookingsToAdmin } from '../../lib/syncAdminData';

export default function CommissionManager() {
  const [commissions, setCommissions] = useState(() => {
    try {
      const saved = localStorage.getItem('cargoshare_commissions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const loadCommissionsFromStorage = () => {
    try {
      const saved = localStorage.getItem('cargoshare_commissions');
      if (saved) {
        setCommissions(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error reading cargoshare_commissions:', e);
    }
  };

  React.useEffect(() => {
    loadCommissionsFromStorage();

    // Auto check if any bookings exist and ensure their 5% escrow commission is generated
    try {
      const savedBookings = JSON.parse(localStorage.getItem('cargoshare_bookings') || '[]');
      if (savedBookings.length > 0) {
        autoSyncAllBookingsToAdmin(savedBookings);
        loadCommissionsFromStorage();
      }
    } catch (e) {
      console.warn('Commission auto sync check error:', e);
    }

    const handleSync = () => {
      loadCommissionsFromStorage();
    };

    window.addEventListener('cargoshare_data_synced', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cargoshare_data_synced', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Blank form for manual entry (No demo pre-fills)
  const [newEntry, setNewEntry] = useState({
    bookingId: '',
    carrier: '',
    carrierAccount: '',
    exporter: '',
    route: '',
    cbm: '',
    grossAmount: '',
    advancePaid: '',
    ratePercent: '5.0',
    status: 'Held in Escrow',
    utr: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleSaveCommission = (e) => {
    e.preventDefault();
    const gross = Number(newEntry.grossAmount) || 0;
    if (!newEntry.bookingId || gross <= 0) {
      alert('Valid booking reference and gross freight amount are required.');
      return;
    }

    const rate = Number(newEntry.ratePercent) || 5.0;
    const fee = Math.round(gross * (rate / 100));
    const carrierNet = gross - fee;
    const adv = Number(newEntry.advancePaid) || Math.round(gross * 0.25);

    const commissionObj = {
      id: `COM-${Math.floor(500 + Math.random() * 500)}`,
      bookingId: newEntry.bookingId.trim().toUpperCase(),
      carrier: newEntry.carrier.trim() || 'Commercial Carrier',
      carrierCode: (newEntry.carrier.substring(0, 3) || 'CAR').toUpperCase(),
      carrierAccount: newEntry.carrierAccount.trim() || 'Bank Transfer Account',
      exporter: newEntry.exporter.trim() || 'SME Shipper',
      route: newEntry.route.trim() || 'Port Route',
      cbm: Number(newEntry.cbm) || 1,
      grossAmount: gross,
      advancePaid: adv,
      balancePaid: Math.max(0, gross - adv),
      ratePercent: rate,
      commissionAmount: fee,
      carrierPayout: carrierNet,
      status: newEntry.status || 'Held in Escrow',
      escrowStage: newEntry.status === 'Settled & Disbursed' 
        ? 'Funds Released to Carrier Account' 
        : 'Funds Secured in Escrow (Awaiting Voyage Completion)',
      utr: newEntry.utr.trim() || `UTR-${Math.floor(10000000 + Math.random() * 90000000)}`,
      date: new Date().toISOString().split('T')[0],
      gstInvoiceRef: `INV-CS-2026-${Math.floor(100 + Math.random() * 900)}`
    };

    const updated = [commissionObj, ...commissions];
    setCommissions(updated);
    try {
      localStorage.setItem('cargoshare_commissions', JSON.stringify(updated));
    } catch (err) {
      console.warn('Storage save error:', err);
    }

    // Reset blank form
    setNewEntry({
      bookingId: '',
      carrier: '',
      carrierAccount: '',
      exporter: '',
      route: '',
      cbm: '',
      grossAmount: '',
      advancePaid: '',
      ratePercent: '5.0',
      status: 'Held in Escrow',
      utr: ''
    });
    setIsAddModalOpen(false);
    showToast(`Commission ledger #${commissionObj.id} recorded successfully`);
  };

  // Filter commissions
  const filteredCommissions = commissions.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      c.id.toLowerCase().includes(q) ||
      (c.bookingId || '').toLowerCase().includes(q) ||
      (c.carrier || '').toLowerCase().includes(q) ||
      (c.exporter || '').toLowerCase().includes(q) ||
      (c.route || '').toLowerCase().includes(q) ||
      (c.utr || '').toLowerCase().includes(q);

    if (statusFilter === 'settled') return matchesSearch && c.status === 'Settled & Disbursed';
    if (statusFilter === 'escrow') return matchesSearch && c.status === 'Held in Escrow';
    if (statusFilter === 'awaiting') return matchesSearch && c.status === 'Awaiting Carrier Review';

    return matchesSearch;
  });

  // KPI Calculations
  const totalGrossFreight = commissions.reduce((sum, c) => sum + (Number(c.grossAmount) || 0), 0);
  const totalCommissionEarned = commissions.reduce((sum, c) => sum + (Number(c.commissionAmount) || 0), 0);
  const totalSettledCommissions = commissions
    .filter(c => c.status === 'Settled & Disbursed')
    .reduce((sum, c) => sum + (Number(c.commissionAmount) || 0), 0);
  const totalEscrowHeldCommissions = commissions
    .filter(c => c.status !== 'Settled & Disbursed')
    .reduce((sum, c) => sum + (Number(c.commissionAmount) || 0), 0);
  const totalCarrierDisbursements = commissions
    .filter(c => c.status === 'Settled & Disbursed')
    .reduce((sum, c) => sum + (Number(c.carrierPayout) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              ₹ Platform Revenue & Commission Ledger
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Revenue Ledger
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Commission Management</h1>
          <p className="text-slate-500 mt-1">
            Track automated 5.0% platform fee retentions, smart escrow holdings, and carrier payout disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Record Commission Manually
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Metrics Strip (IndianRupee Icon Used) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Commission</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">₹{totalCommissionEarned.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">5.0% Platform Take Rate</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settled & Realized</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900">₹{totalSettledCommissions.toLocaleString()}</div>
          <span className="text-[10px] text-purple-600 font-semibold">Completed voyages</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escrow Held Fees</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">₹{totalEscrowHeldCommissions.toLocaleString()}</div>
          <span className="text-[10px] text-amber-600 font-semibold">Pending voyage delivery</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Freight GMV</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900">₹{(totalGrossFreight / 1000).toFixed(1)}k</div>
          <span className="text-[10px] text-blue-600 font-semibold">Total cargo value</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Carrier Disbursed</span>
            <div className="p-1.5 bg-slate-50 text-slate-700 rounded-lg">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{(totalCarrierDisbursements / 1000).toFixed(1)}k</div>
          <span className="text-[10px] text-slate-500 font-semibold">95.0% Net to Shipping Lines</span>
        </div>

      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ledger ID, booking ref, carrier, exporter, UTR..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto">
          {[
            { id: 'all', label: `All Ledgers (${commissions.length})` },
            { id: 'settled', label: `Settled & Disbursed (${commissions.filter(c => c.status === 'Settled & Disbursed').length})` },
            { id: 'escrow', label: `Held in Escrow (${commissions.filter(c => c.status === 'Held in Escrow').length})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Commission Ledger Table (Read-Only) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4">Ledger Ref / Date</th>
                <th className="px-5 py-4">Linked Booking</th>
                <th className="px-5 py-4">Commercial Carrier</th>
                <th className="px-5 py-4">Shipper Exporter</th>
                <th className="px-5 py-4">Gross Freight</th>
                <th className="px-5 py-4">CargoShare 5% Fee</th>
                <th className="px-5 py-4">Carrier Net Payout</th>
                <th className="px-5 py-4">Escrow Status</th>
                <th className="px-5 py-4 text-right">Audit Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center text-slate-400">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No commission ledger records entered yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Click "+ Record Commission Manually" above to enter a transaction.</p>
                  </td>
                </tr>
              ) : (
                filteredCommissions.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md text-xs inline-block">
                        {c.id}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{c.date}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-purple-700 text-xs">
                        #{c.bookingId}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {c.cbm} CBM Allocated
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{c.carrier}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                        {c.carrierAccount}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800 text-xs flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{c.exporter}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[170px]">
                        {c.route}
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-xs">
                        ₹{c.grossAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Adv: ₹{c.advancePaid.toLocaleString()}
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-black text-emerald-700 text-xs flex items-center gap-0.5">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{c.commissionAmount.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        {c.ratePercent}% fee rate
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-black text-blue-900 text-xs">
                        ₹{c.carrierPayout.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        95% Net to Carrier
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {c.status === 'Settled & Disbursed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Settled & Disbursed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3 text-blue-600" /> Escrow Held
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCommission(c)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="View complete escrow commission ledger dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Breakdown</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- COMMISSION BREAKDOWN & ESCROW DOSSIER MODAL ----------------- */}
      {selectedCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Commission Ledger Dossier: {selectedCommission.id}</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      Smart Escrow Verified
                    </span>
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Linked to Booking #{selectedCommission.bookingId} • Recorded on {selectedCommission.date}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCommission(null)} 
                className="text-slate-400 hover:text-slate-600 text-2xl font-light leading-none cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Escrow Settlement Status</span>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                    selectedCommission.status === 'Settled & Disbursed' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {selectedCommission.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Escrow Protocol Stage</span>
                  <span className="text-slate-700 font-semibold block mt-1">
                    {selectedCommission.escrowStage}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bank Transfer UTR</span>
                  <span className="font-mono font-bold text-slate-900 block mt-1">
                    {selectedCommission.utr}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <Ship className="w-4 h-4 text-blue-600" />
                    Carrier Beneficiary (95% Payout)
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Shipping Line:</span>
                      <strong className="text-slate-800">{selectedCommission.carrier}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Settlement Bank:</span>
                      <span className="text-slate-700 text-[11px]">{selectedCommission.carrierAccount}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    Exporter Remitter
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Exporter Shipper:</span>
                      <strong className="text-slate-800">{selectedCommission.exporter}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Port Route:</span>
                      <strong className="text-slate-800">{selectedCommission.route}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consolidated Space:</span>
                      <strong className="text-purple-700">{selectedCommission.cbm} CBM</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Financial Waterfall Breakdown (IndianRupee Icon Used) */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                  <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    Escrow Financial Waterfall & Split
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700">Invoice: {selectedCommission.gstInvoiceRef}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Gross Freight</span>
                    <span className="font-black text-slate-900 text-sm">₹{selectedCommission.grossAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">25% Advance Paid</span>
                    <span className="font-black text-purple-800 text-sm">₹{selectedCommission.advancePaid.toLocaleString()}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-300">
                    <span className="text-[10px] text-emerald-600 uppercase font-bold block">CargoShare 5% Fee</span>
                    <span className="font-black text-emerald-700 text-sm flex items-center justify-center gap-0.5">
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>{selectedCommission.commissionAmount.toLocaleString()}</span>
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-blue-300">
                    <span className="text-[10px] text-blue-600 uppercase font-bold block">Carrier Net Payout</span>
                    <span className="font-black text-blue-900 text-sm">₹{selectedCommission.carrierPayout.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    Automated smart escrow settlement fee voucher.
                  </span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Escrow Reconciled
                  </span>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Official electronic revenue voucher generated by CargoShare AI Escrow Engine.
              </span>
              <button 
                onClick={() => setSelectedCommission(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close Ledger
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- MANUAL RECORD COMMISSION MODAL (BLANK INPUTS - NO DEMO PREFILLS) ----------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <IndianRupee className="text-emerald-600 w-5 h-5" /> 
                <span>Record Commission Entry Manually</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 text-xl leading-none cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCommission} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Booking Ref ID *</label>
                  <input 
                    type="text" 
                    value={newEntry.bookingId} 
                    onChange={e => setNewEntry({ ...newEntry, bookingId: e.target.value })} 
                    placeholder="e.g. CS-1001..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Allocated Space (CBM)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={newEntry.cbm} 
                    onChange={e => setNewEntry({ ...newEntry, cbm: e.target.value })} 
                    placeholder="e.g. 20" 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Commercial Shipping Line</label>
                  <input 
                    type="text" 
                    value={newEntry.carrier} 
                    onChange={e => setNewEntry({ ...newEntry, carrier: e.target.value })} 
                    placeholder="e.g. Oceanic Freight Ltd." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Shipper Exporter</label>
                  <input 
                    type="text" 
                    value={newEntry.exporter} 
                    onChange={e => setNewEntry({ ...newEntry, exporter: e.target.value })} 
                    placeholder="e.g. Apex Textiles SME..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Maritime Trade Route</label>
                <input 
                  type="text" 
                  value={newEntry.route} 
                  onChange={e => setNewEntry({ ...newEntry, route: e.target.value })} 
                  placeholder="e.g. Mumbai (JNPT) → Mundra Port..." 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Gross Freight Amount (₹) *</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={newEntry.grossAmount} 
                    onChange={e => setNewEntry({ ...newEntry, grossAmount: e.target.value })} 
                    placeholder="e.g. 25000" 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white font-bold" 
                    required 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">25% Advance Paid (₹)</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={newEntry.advancePaid} 
                    onChange={e => setNewEntry({ ...newEntry, advancePaid: e.target.value })} 
                    placeholder="Leave blank for 25%" 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Commission Rate (%)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={newEntry.ratePercent} 
                    onChange={e => setNewEntry({ ...newEntry, ratePercent: e.target.value })} 
                    placeholder="5.0" 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white font-bold" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Escrow Status</label>
                  <select 
                    value={newEntry.status} 
                    onChange={e => setNewEntry({ ...newEntry, status: e.target.value })} 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white font-semibold cursor-pointer"
                  >
                    <option value="Held in Escrow">Held in Escrow</option>
                    <option value="Settled & Disbursed">Settled & Disbursed</option>
                    <option value="Awaiting Carrier Review">Awaiting Carrier Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Bank UTR / Escrow Reference</label>
                <input 
                  type="text" 
                  value={newEntry.utr} 
                  onChange={e => setNewEntry({ ...newEntry, utr: e.target.value })} 
                  placeholder="e.g. UTR-HDFC-98421033..." 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Commission Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
