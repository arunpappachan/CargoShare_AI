import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  IndianRupee, 
  Ship, 
  Building2, 
  Package, 
  Eye, 
  ExternalLink, 
  Download, 
  Printer, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  Truck, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Layers,
  Sparkles,
  Shield,
  Info,
  Plus,
  X,
  Check
} from 'lucide-react';
import { API_BASE } from '../../lib/apiConfig';
import CarrierDocumentViewerModal from '../carrier/CarrierDocumentViewerModal';
import { syncBookingToAdmin, autoSyncAllBookingsToAdmin } from '../../lib/syncAdminData';

export default function BookingManager() {
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('cargoshare_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals state
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);
  const [selectedBookingForDocs, setSelectedBookingForDocs] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Blank manual entry form (No demo pre-fills)
  const [newBooking, setNewBooking] = useState({
    id: '',
    exporterName: '',
    email: '',
    carrier: '',
    vessel: '',
    route: '',
    commodity: '',
    cbm: '',
    weight: '',
    totalAmount: '',
    advanceAmount: '',
    balanceAmount: '',
    status: 'Pending Confirmation',
    paymentStatus: 'Advance Paid (25%)',
    paymentMethod: 'UPI QR Scanner',
    transactionId: '',
    specialReq: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchBookings();
    
    // Reactive sync listener when bookings are placed by exporters in real time
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('cargoshare_bookings');
        if (saved) {
          setBookings(JSON.parse(saved));
        }
      } catch (e) {
        console.warn('Sync read error:', e);
      }
    };

    window.addEventListener('cargoshare_data_synced', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cargoshare_data_synced', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('cargoshare_bookings');
      let currentBookings = saved ? JSON.parse(saved) : [];

      const res = await fetch(`${API_BASE}/api/bookings`).catch(() => null);
      if (res && res.ok) {
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          // Merge API bookings with existing local bookings
          const existingIds = new Set(currentBookings.map(b => b.id));
          const newFromApi = json.data.filter(b => !existingIds.has(b.id));
          currentBookings = [...currentBookings, ...newFromApi];
          localStorage.setItem('cargoshare_bookings', JSON.stringify(currentBookings));
        }
      }
      
      // Auto-populate exporters, carriers, and commissions from all bookings
      autoSyncAllBookingsToAdmin(currentBookings);
      setBookings(currentBookings);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      const saved = localStorage.getItem('cargoshare_bookings');
      if (saved) {
        setBookings(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBooking = (e) => {
    e.preventDefault();
    if (!newBooking.exporterName || !newBooking.carrier || !newBooking.route) {
      alert('Exporter name, carrier name, and route are required.');
      return;
    }
    const total = Number(newBooking.totalAmount) || 0;
    const adv = newBooking.advanceAmount ? Number(newBooking.advanceAmount) : Math.round(total * 0.25);
    const bal = newBooking.balanceAmount ? Number(newBooking.balanceAmount) : Math.max(0, total - adv);
    const id = newBooking.id.trim() || `CS-${Math.floor(1000 + Math.random() * 9000)}`;

    const bookingObj = {
      id,
      spaceId: `SP-${Math.floor(5000 + Math.random() * 1000)}`,
      route: newBooking.route.trim(),
      carrier: newBooking.carrier.trim(),
      vessel: newBooking.vessel.trim() || 'Commercial Cargo Vessel',
      exporterName: newBooking.exporterName.trim(),
      email: newBooking.email.trim(),
      cbm: Number(newBooking.cbm) || 1,
      commodity: newBooking.commodity.trim() || 'General Cargo',
      weight: Number(newBooking.weight) || 1000,
      specialReq: newBooking.specialReq.trim(),
      status: newBooking.status || 'Pending Confirmation',
      paymentStatus: newBooking.paymentStatus || 'Advance Paid (25%)',
      paymentMethod: newBooking.paymentMethod || 'UPI QR Scanner',
      amountPaid: adv,
      advanceAmount: adv,
      balanceAmount: bal,
      totalAmount: total,
      transactionId: newBooking.transactionId.trim() || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      date: newBooking.date || new Date().toISOString().split('T')[0],
      documentName: 'Shipping_Manifest.pdf',
      documents: ['Shipping_Manifest.pdf', 'Packing_List.pdf']
    };

    const updated = [bookingObj, ...bookings];
    setBookings(updated);
    localStorage.setItem('cargoshare_bookings', JSON.stringify(updated));
    
    // Automatically store exporter and carrier details to Admin Dashboard
    syncBookingToAdmin(bookingObj);
    setIsAddModalOpen(false);
    setNewBooking({
      id: '',
      exporterName: '',
      email: '',
      carrier: '',
      vessel: '',
      route: '',
      commodity: '',
      cbm: '',
      weight: '',
      totalAmount: '',
      advanceAmount: '',
      balanceAmount: '',
      status: 'Pending Confirmation',
      paymentStatus: 'Advance Paid (25%)',
      paymentMethod: 'UPI QR Scanner',
      transactionId: '',
      specialReq: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Corrected Carrier Approval Status Renderer
  const renderCarrierApprovalStatus = (b) => {
    const isApproved = b.status === 'Approved' || b.status === 'Accepted';
    const isRejected = b.status === 'Rejected';
    const isTransit = b.status === 'In Transit';
    const isDelivered = b.status === 'Delivered';
    const isFullyPaid = b.paymentStatus === 'Fully Paid' || b.paymentStatus === 'Paid' || b.balanceAmount === 0;
    const isAdvancePaid = (b.paymentStatus || '').includes('Advance') || (b.advanceAmount > 0 && b.amountPaid > 0);

    if (isDelivered) {
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
          title="Voyage completed and cargo delivered"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Approved & Delivered</span>
        </span>
      );
    }

    if (isTransit) {
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-50 text-blue-800 border border-blue-200"
          title="Space verified & vessel currently sailing"
        >
          <Ship className="w-3.5 h-3.5 text-blue-600" />
          <span>Approved & Sailing</span>
        </span>
      );
    }

    if (isApproved) {
      if (isFullyPaid) {
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
            title="Carrier confirmed space allocation and 100% freight settled"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved by Carrier</span>
          </span>
        );
      }
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-50 text-purple-800 border border-purple-200"
          title="Carrier approved booking after document check. Exporter remaining balance is due."
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
          <span>Approved (Balance Due)</span>
        </span>
      );
    }

    if (isRejected) {
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-red-50 text-red-800 border border-red-200"
          title="Carrier rejected the booking. Escrow advance refund in progress."
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Rejected by Carrier</span>
        </span>
      );
    }

    // Pending review after advance is deposited
    if (isAdvancePaid) {
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-300 animate-pulse"
          title="25% advance held in escrow. Carrier is reviewing cargo specs and documents."
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Awaiting Carrier Review</span>
        </span>
      );
    }

    return (
      <span 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200"
        title="Exporter has not yet completed initial 25% advance payment"
      >
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>Awaiting 25% Advance</span>
      </span>
    );
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (b.id || '').toLowerCase().includes(q) ||
      (b.exporterName || '').toLowerCase().includes(q) ||
      (b.carrier || '').toLowerCase().includes(q) ||
      (b.route || '').toLowerCase().includes(q) ||
      (b.commodity || '').toLowerCase().includes(q);

    const isFullyPaid = b.paymentStatus === 'Fully Paid' || b.paymentStatus === 'Paid' || b.balanceAmount === 0;
    const isAdvance = (b.paymentStatus || '').includes('Advance') && (b.balanceAmount > 0 || b.balanceAmount === undefined);
    const isApproved = b.status === 'Approved' || b.status === 'Accepted';

    if (statusFilter === 'advance_pending') return matchesSearch && isAdvance && !isApproved;
    if (statusFilter === 'approved_balance_due') return matchesSearch && isApproved && isAdvance;
    if (statusFilter === 'fully_paid') return matchesSearch && isFullyPaid;
    if (statusFilter === 'in_transit') return matchesSearch && b.status === 'In Transit';
    if (statusFilter === 'delivered') return matchesSearch && b.status === 'Delivered';

    return matchesSearch;
  });

  // KPI Metrics Calculations
  const totalBookingsCount = bookings.length;
  const totalCargoCbm = bookings.reduce((sum, b) => sum + (Number(b.cbm) || 0), 0);
  const totalFreightGmv = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || (Number(b.cbm || 1) * 520 * 1.18 + 1650)), 0);
  const totalAdvanceEscrow = bookings.reduce((sum, b) => sum + (Number(b.advanceAmount || b.amountPaid) || 0), 0);
  const awaitingCarrierReviewCount = bookings.filter(b => b.status === 'Pending Confirmation' && (b.paymentStatus || '').includes('Advance')).length;
  const fullySettledCount = bookings.filter(b => b.paymentStatus === 'Fully Paid' || b.paymentStatus === 'Paid' || b.balanceAmount === 0).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header with Read-Only Audit Indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              📋 All Exporter Booked Details & Freight Ledger
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <Shield className="w-3 h-3 text-purple-600" /> Read-Only System Performance
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Exporter Bookings & Reservations</h1>
          <p className="text-slate-500 mt-1">
            Supervisory view of platform cargo bookings, two-stage escrow deposits, carrier verification approvals, and commercial documents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Booking Manually</span>
          </button>

          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Refresh bookings data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Audit Only (No Edit/Delete)</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalBookingsCount}</div>
          <span className="text-[10px] text-purple-600 font-semibold">Across all exporters</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cargo</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900">{totalCargoCbm} <span className="text-xs font-bold text-slate-400">CBM</span></div>
          <span className="text-[10px] text-blue-600 font-semibold">Allocated container space</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Freight Value</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">₹{(totalFreightGmv / 1000).toFixed(1)}k</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Total freight committed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">25% Advance Escrow</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900">₹{(totalAdvanceEscrow / 1000).toFixed(1)}k</div>
          <span className="text-[10px] text-indigo-600 font-semibold">Secured in smart escrow</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Awaiting Review</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{awaitingCarrierReviewCount}</div>
          <span className="text-[10px] text-amber-600 font-semibold">Carrier document review</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fully Settled</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{fullySettledCount}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">100% balance cleared</span>
        </div>

      </div>

      {/* Two-Stage Payment Lifecycle Explanation Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-4 rounded-2xl border border-purple-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-purple-950 flex items-center gap-2">
              <span>Two-Stage Exporter Advance & Carrier Approval Workflow</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-200 text-purple-800 font-semibold">Read-Only Audit</span>
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              1. <strong>Exporter</strong> books space with 25% Advance held in Escrow. &nbsp;•&nbsp;
              2. <strong>Carrier</strong> approves the booking after inspecting uploaded documents. &nbsp;•&nbsp;
              3. <strong>Exporter</strong> pays remaining 75% balance. Admin monitors aggregate performance without editing or deleting records.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by exporter, booking ref, carrier, route, commodity..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto">
          {[
            { id: 'all', label: `All Bookings (${bookings.length})` },
            { id: 'advance_pending', label: `Awaiting Review (${awaitingCarrierReviewCount})` },
            { id: 'approved_balance_due', label: 'Approved & Balance Due' },
            { id: 'fully_paid', label: `Fully Paid (${fullySettledCount})` },
            { id: 'in_transit', label: 'In Transit' },
            { id: 'delivered', label: 'Delivered' }
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

      {/* All Exporter Booked Details Master Table (Read-Only) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4">Booking Ref</th>
                <th className="px-5 py-4">Exporter (Shipper)</th>
                <th className="px-5 py-4">Carrier & Vessel</th>
                <th className="px-5 py-4">Route & Cargo</th>
                <th className="px-5 py-4">Space</th>
                <th className="px-5 py-4">Payment & Advance</th>
                <th className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <span>Carrier Approval</span>
                    <Info className="w-3 h-3 text-slate-400" title="Approval is issued exclusively by the carrier after inspecting documentation" />
                  </div>
                </th>
                <th className="px-5 py-4">Documents</th>
                <th className="px-5 py-4 text-right">System Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading all exporter booked records...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center text-slate-500">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-3">
                        <Package className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">No Bookings Recorded</h4>
                      <p className="text-xs text-slate-400 mb-4">
                        {bookings.length === 0
                          ? "No exporter bookings exist in the system yet. Click 'Add Booking Manually' to register your first cargo booking."
                          : "No exporter bookings match your current filter and search query."}
                      </p>
                      {bookings.length === 0 && (
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Booking Manually</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isFullyPaid = b.paymentStatus === 'Fully Paid' || b.paymentStatus === 'Paid' || b.balanceAmount === 0;
                  const isAdvance = (b.paymentStatus || '').includes('Advance') && (b.balanceAmount > 0 || b.balanceAmount === undefined);
                  const totalAmt = b.totalAmount || ((b.cbm || 1) * 520 * 1.18 + 1650);
                  const advAmt = b.advanceAmount || b.amountPaid || Math.round(totalAmt * 0.25);
                  const balAmt = isFullyPaid ? 0 : (b.balanceAmount || Math.round(totalAmt - advAmt));

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Booking Ref */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md text-xs">
                            {b.id}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{b.date || '2026-10-24'}</span>
                        </div>
                      </td>

                      {/* Exporter (Shipper) */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>{b.exporterName || 'Apex Textiles SME'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                          Ref: {b.transactionId || 'TXN-98421033'}
                        </div>
                      </td>

                      {/* Carrier & Vessel */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                          <Ship className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{b.carrier || 'Oceanic Freight Ltd.'}</span>
                        </div>
                        <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                          Vessel: {b.vessel || 'MSC Oscar'}
                        </div>
                      </td>

                      {/* Route & Cargo */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span className="truncate max-w-[190px]">{b.route}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                          Cargo: <strong className="text-slate-700">{b.commodity || 'General Freight'}</strong>
                        </div>
                      </td>

                      {/* Space & Weight */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-black text-slate-900 text-xs">
                          {b.cbm} <span className="text-[10px] font-bold text-slate-500">CBM</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {b.weight ? `${b.weight.toLocaleString()} kg` : '3,200 kg'}
                        </div>
                      </td>

                      {/* Payment & Advance Ledger */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs">₹{totalAmt.toLocaleString()}</span>
                            {isFullyPaid ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                100% Settled
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Bal: ₹{balAmt.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {isAdvance && (
                            <span className="text-[10px] font-semibold text-purple-700 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-purple-600" />
                              <span>25% Adv: ₹{advAmt.toLocaleString()}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Corrected Carrier Approval Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {renderCarrierApprovalStatus(b)}
                      </td>

                      {/* Documents View Button */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBookingForDocs(b)}
                          className="px-2.5 py-1.5 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="View uploaded invoices, packing lists, and EDI filings"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Docs</span>
                        </button>
                      </td>

                      {/* Read-Only System Dossier (No Edit / No Delete) */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBookingForDetails(b)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Inspect complete read-only booking dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- COMPREHENSIVE EXPORTER BOOKING DOSSIER MODAL (READ-ONLY) ----------------- */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Exporter Booking Dossier: {selectedBookingForDetails.id}</span>
                    <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                      Audit Record
                    </span>
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Placed on {selectedBookingForDetails.date || '2026-10-24'} • Carrier space ID: {selectedBookingForDetails.spaceId || 'SP-5001'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedBookingForDetails(null)} 
                className="text-slate-400 hover:text-slate-600 text-2xl font-light leading-none cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Status Banner */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logistics Status</span>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                    {selectedBookingForDetails.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carrier Approval</span>
                  <div className="mt-1">
                    {renderCarrierApprovalStatus(selectedBookingForDetails)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Status</span>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    {selectedBookingForDetails.paymentStatus || 'Advance Paid (25%)'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Escrow / UTR Ref</span>
                  <span className="font-mono font-bold text-slate-800 block mt-1">
                    {selectedBookingForDetails.transactionId || 'TXN-98421033'}
                  </span>
                </div>
              </div>

              {/* Grid 1: Exporter & Cargo Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Exporter Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    Exporter (Shipper) Profile
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Company Name:</span>
                      <strong className="text-slate-800">{selectedBookingForDetails.exporterName || 'Exporter'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-700">{selectedBookingForDetails.email || 'export@cargoshare.io'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Logistics Reference:</span>
                      <span className="font-mono text-slate-700">{selectedBookingForDetails.id}</span>
                    </div>
                  </div>
                </div>

                {/* Carrier & Vessel Allocation Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <Ship className="w-4 h-4 text-blue-600" />
                    Carrier & Vessel Assignment
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Commercial Carrier:</span>
                      <strong className="text-blue-900">{selectedBookingForDetails.carrier || 'Oceanic Freight Ltd.'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned Vessel:</span>
                      <strong className="text-slate-800">{selectedBookingForDetails.vessel || 'MSC Oscar (IMO 9703291)'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Voyage / Slot ID:</span>
                      <strong className="font-mono text-slate-800">VOY-2026-IN-UAE</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimated Transit:</span>
                      <span className="text-slate-700">4 Days (Port-to-Port)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Grid 2: Route & Commodity Specifications */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Route & Cargo Specifications
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Shipping Lane</span>
                    <strong className="text-slate-900 block mt-0.5">{selectedBookingForDetails.route}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Cargo Commodity</span>
                    <strong className="text-slate-900 block mt-0.5">{selectedBookingForDetails.commodity || 'General Cargo'}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Reserved Space</span>
                    <strong className="text-blue-900 block mt-0.5">{selectedBookingForDetails.cbm} CBM</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Gross Weight</span>
                    <strong className="text-slate-900 block mt-0.5">{selectedBookingForDetails.weight ? `${selectedBookingForDetails.weight.toLocaleString()} kg` : '3,200 kg'}</strong>
                  </div>
                </div>
                {selectedBookingForDetails.specialReq && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                    <strong>Special Handling Instructions:</strong> {selectedBookingForDetails.specialReq}
                  </div>
                )}
              </div>

              {/* Grid 3: Comprehensive Financial Ledger Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    Itemized Freight Ledger Breakdown
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">Currency: INR (₹)</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Freight</span>
                    <span className="font-bold text-slate-800 text-sm">
                      ₹{((selectedBookingForDetails.cbm || 1) * 520).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Terminal THC & EDI</span>
                    <span className="font-bold text-slate-800 text-sm">₹1,650</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Integrated GST (18%)</span>
                    <span className="font-bold text-slate-800 text-sm">
                      ₹{Math.round(((selectedBookingForDetails.cbm || 1) * 520 + 1650) * 0.18).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-purple-200 text-center">
                    <span className="text-[10px] text-purple-600 uppercase font-bold block">Total Freight Charges</span>
                    <span className="font-black text-purple-900 text-sm">
                      ₹{(selectedBookingForDetails.totalAmount || ((selectedBookingForDetails.cbm || 1) * 520 * 1.18 + 1650)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-wrap justify-between items-center text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-700 font-bold bg-purple-100 px-2.5 py-1 rounded-lg">
                      25% Advance Paid: ₹{(selectedBookingForDetails.advanceAmount || selectedBookingForDetails.amountPaid || 7113).toLocaleString()}
                    </span>
                    <span className="text-slate-500 font-medium">via {selectedBookingForDetails.paymentMethod || 'UPI QR Scanner'}</span>
                  </div>

                  <div>
                    {selectedBookingForDetails.balanceAmount > 0 ? (
                      <span className="text-amber-800 font-bold bg-amber-100 px-2.5 py-1 rounded-lg">
                        Remaining Balance Due: ₹{selectedBookingForDetails.balanceAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-emerald-800 font-bold bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% Fully Paid (₹0 Due)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Uploaded Shipping Documents ({selectedBookingForDetails.documents?.length || 3})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedBookingForDocs(selectedBookingForDetails);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    Open Document Inspector <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {(selectedBookingForDetails.documents || ['Commercial_Invoice_Apex.pdf', 'Packing_List_Apex.pdf', 'Shipping_Bill_EDI.pdf']).map((doc, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-mono text-slate-800 truncate text-[11px]">{doc}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Verified</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer (Read-Only) */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Official electronic freight record managed by CargoShare AI Escrow Gateway. Read-only audit view.
              </span>
              <button 
                onClick={() => setSelectedBookingForDetails(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Exporter Documents Viewer Modal Integration */}
      {selectedBookingForDocs && (
        <CarrierDocumentViewerModal 
          isOpen={!!selectedBookingForDocs}
          onClose={() => setSelectedBookingForDocs(null)}
          booking={selectedBookingForDocs}
        />
      )}

      {/* ----------------- MANUAL ADD BOOKING MODAL (BLANK INPUTS - NO GST / NO PHONE) ----------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Exporter Booking Manually</h3>
                  <p className="text-slate-500 text-xs">Enter complete shipment reservation and escrow financial details.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Booking Reference ID (Optional)</label>
                  <input 
                    type="text" 
                    value={newBooking.id} 
                    onChange={e => setNewBooking({ ...newBooking, id: e.target.value })} 
                    placeholder="Leave blank for auto ID (e.g. CS-1001)..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Booking Date</label>
                  <input 
                    type="date" 
                    value={newBooking.date} 
                    onChange={e => setNewBooking({ ...newBooking, date: e.target.value })} 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Exporter (Shipper) Name *</label>
                  <input 
                    type="text" 
                    value={newBooking.exporterName} 
                    onChange={e => setNewBooking({ ...newBooking, exporterName: e.target.value })} 
                    placeholder="Enter exporter company name..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Exporter Contact Email * (No Phone)</label>
                  <input 
                    type="email" 
                    value={newBooking.email} 
                    onChange={e => setNewBooking({ ...newBooking, email: e.target.value })} 
                    placeholder="Enter email address..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Carrier Line *</label>
                  <input 
                    type="text" 
                    value={newBooking.carrier} 
                    onChange={e => setNewBooking({ ...newBooking, carrier: e.target.value })} 
                    placeholder="e.g. Oceanic Freight Ltd., Maersk..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Vessel Name</label>
                  <input 
                    type="text" 
                    value={newBooking.vessel} 
                    onChange={e => setNewBooking({ ...newBooking, vessel: e.target.value })} 
                    placeholder="e.g. MSC Oscar, Ever Given..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Shipping Route *</label>
                <input 
                  type="text" 
                  value={newBooking.route} 
                  onChange={e => setNewBooking({ ...newBooking, route: e.target.value })} 
                  placeholder="e.g. Mumbai (Nhava Sheva/JNPT) → Mundra Port" 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                  required 
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Commodity / Cargo</label>
                  <input 
                    type="text" 
                    value={newBooking.commodity} 
                    onChange={e => setNewBooking({ ...newBooking, commodity: e.target.value })} 
                    placeholder="e.g. Garments, Basmati Rice..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Space (CBM)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={newBooking.cbm} 
                    onChange={e => setNewBooking({ ...newBooking, cbm: e.target.value })} 
                    placeholder="e.g. 25" 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white font-bold" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Gross Weight (kg)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={newBooking.weight} 
                    onChange={e => setNewBooking({ ...newBooking, weight: e.target.value })} 
                    placeholder="e.g. 4200" 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white font-bold" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Total Freight Amount (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                    <input 
                      type="number" 
                      min="0" 
                      value={newBooking.totalAmount} 
                      onChange={e => {
                        const total = e.target.value;
                        const adv = total ? Math.round(Number(total) * 0.25) : '';
                        const bal = total ? Math.round(Number(total) * 0.75) : '';
                        setNewBooking({ ...newBooking, totalAmount: total, advanceAmount: adv, balanceAmount: bal });
                      }} 
                      placeholder="e.g. 28450" 
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white font-bold text-purple-900" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">25% Advance Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                    <input 
                      type="number" 
                      min="0" 
                      value={newBooking.advanceAmount} 
                      onChange={e => setNewBooking({ ...newBooking, advanceAmount: e.target.value })} 
                      placeholder="Auto 25% or enter amount..." 
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white font-bold" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Payment Status</label>
                  <select 
                    value={newBooking.paymentStatus} 
                    onChange={e => setNewBooking({ ...newBooking, paymentStatus: e.target.value })} 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white font-medium"
                  >
                    <option value="Advance Paid (25%)">Advance Paid (25%)</option>
                    <option value="Fully Paid">Fully Paid (100%)</option>
                    <option value="Pending Verification">Pending Verification</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Carrier Approval</label>
                  <select 
                    value={newBooking.status} 
                    onChange={e => setNewBooking({ ...newBooking, status: e.target.value })} 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white font-medium"
                  >
                    <option value="Pending Confirmation">Pending Confirmation</option>
                    <option value="Approved">Approved</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Special Handling Instructions</label>
                <input 
                  type="text" 
                  value={newBooking.specialReq} 
                  onChange={e => setNewBooking({ ...newBooking, specialReq: e.target.value })} 
                  placeholder="e.g. Moisture proof packaging, Keep dry..." 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Booking Manually
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
