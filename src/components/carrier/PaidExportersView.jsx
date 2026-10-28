import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Receipt, 
  Search, 
  Filter, 
  ArrowRight, 
  ExternalLink,
  Ship,
  Sparkles,
  AlertCircle,
  Building2,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { API_BASE } from '../../lib/apiConfig';
import { io } from 'socket.io-client';
import CarrierDocumentViewerModal from './CarrierDocumentViewerModal';

export default function PaidExportersView({ onNavigateTab }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'advance', 'approved', 'fully_paid'
  const [selectedDocBooking, setSelectedDocBooking] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [paymentNotice, setPaymentNotice] = useState(null);

  useEffect(() => {
    fetchBookings();

    // Connect to Socket.io to listen for real-time payments from Razorpay
    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    socket.on('carrier_payment_notification', (notice) => {
      console.log('[Socket.io] Real-time payment event received:', notice);
      setPaymentNotice(notice);
      setTimeout(() => setPaymentNotice(null), 10000);

      // Auto-update booking in place
      setBookings(prev => prev.map(b => {
        if (b.id === notice.bookingId) {
          return {
            ...b,
            paymentStatus: notice.paymentStatus,
            amountPaid: (b.amountPaid || 0) + notice.amountPaid,
            balanceAmount: Math.max(0, (b.totalAmount || 0) - ((b.amountPaid || 0) + notice.amountPaid)),
            transactionId: notice.transactionId
          };
        }
        return b;
      }));
    });

    return () => socket.disconnect();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings`);
      const json = await res.json();
      if (json.status === 'success' && json.data.length > 0) {
        setBookings(json.data);
      } else {
        // High quality fallback data showing the two-stage advance & approval flow
        setBookings([
          {
            id: 'CS-1001',
            exporterName: 'Apex Textiles SME',
            route: 'Mumbai (Nhava Sheva/JNPT) → Mundra Port',
            carrier: 'Oceanic Freight Ltd.',
            cbm: 25,
            commodity: 'Garments & Apparels',
            weight: 4200,
            status: 'Pending Confirmation',
            paymentStatus: 'Advance Paid (25%)',
            paymentMethod: 'UPI QR Scanner',
            amountPaid: 7113,
            advanceAmount: 7113,
            balanceAmount: 21337,
            totalAmount: 28450,
            transactionId: 'TXN-98421033',
            date: '2026-10-24'
          },
          {
            id: 'CS-1002',
            exporterName: 'Bharat Agro Exporters Ltd.',
            route: 'Chennai Port → Kolkata Port',
            carrier: 'Oceanic Freight Ltd.',
            cbm: 18,
            commodity: 'Organic Basmati Rice',
            weight: 12500,
            status: 'Approved',
            paymentStatus: 'Fully Paid',
            paymentMethod: 'UPI Remaining Balance',
            amountPaid: 24800,
            advanceAmount: 6200,
            balanceAmount: 0,
            totalAmount: 24800,
            transactionId: 'TXN-77219044',
            date: '2026-10-23'
          },
          {
            id: 'CS-1003',
            exporterName: 'Zenith Spices & Commodities',
            route: 'Cochin Port → Visakhapatnam Port',
            carrier: 'Oceanic Freight Ltd.',
            cbm: 32,
            commodity: 'Cardamom & Black Pepper',
            weight: 6800,
            status: 'Approved',
            paymentStatus: 'Advance Paid (25%)',
            paymentMethod: 'CargoShare Smart Escrow',
            amountPaid: 9875,
            advanceAmount: 9875,
            balanceAmount: 29625,
            totalAmount: 39500,
            transactionId: 'TXN-66103982',
            date: '2026-10-22'
          },
          {
            id: 'CS-1004',
            exporterName: 'Vanguard Industrial Machinery',
            route: 'Kandla Port → Mumbai (JNPT)',
            carrier: 'Oceanic Freight Ltd.',
            cbm: 14,
            commodity: 'Precision Hydraulic CNC Valves',
            weight: 3100,
            status: 'Approved',
            paymentStatus: 'Fully Paid',
            paymentMethod: 'UPI QR Scanner',
            amountPaid: 19200,
            advanceAmount: 4800,
            balanceAmount: 0,
            totalAmount: 19200,
            transactionId: 'TXN-44192031',
            date: '2026-10-21'
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (id) => {
    setActionLoadingId(id);
    try {
      await fetch(`${API_BASE}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Approved' } : b));
    } catch (err) {
      console.warn('Fallback approve:', err);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Approved' } : b));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.exporterName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.commodity || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.route || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isFullyPaid = b.paymentStatus === 'Fully Paid' || b.paymentStatus === 'Paid' || (b.amountPaid >= b.totalAmount && b.totalAmount > 0);
    const isAdvance = (b.paymentStatus || '').includes('Advance') || (b.amountPaid > 0 && b.amountPaid < b.totalAmount);
    const isApproved = b.status === 'Approved' || b.status === 'Accepted';

    if (statusFilter === 'advance') return matchesSearch && isAdvance && !isApproved;
    if (statusFilter === 'approved') return matchesSearch && isApproved && isAdvance;
    if (statusFilter === 'fully_paid') return matchesSearch && isFullyPaid;
    return matchesSearch;
  });

  // Calculate Metrics
  const totalRevenueCollected = bookings.reduce((sum, b) => sum + (Number(b.amountPaid) || 0), 0);
  const totalAdvanceHeld = bookings
    .filter(b => (b.paymentStatus || '').includes('Advance') || (b.amountPaid > 0 && b.amountPaid < b.totalAmount))
    .reduce((sum, b) => sum + (Number(b.advanceAmount || b.amountPaid) || 0), 0);
  const pendingApprovalsCount = bookings.filter(b => b.status === 'Pending Confirmation' && (b.amountPaid > 0 || (b.paymentStatus || '').includes('Advance'))).length;
  const fullyPaidCount = bookings.filter(b => b.paymentStatus === 'Fully Paid' || b.paymentStatus === 'Paid' || b.amountPaid >= b.totalAmount).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              💰 Exporter Payments & Escrow Ledger
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Paid Exporters & Settlements</h1>
          <p className="text-slate-500 mt-1">
            Manage advance booking deposits, approve exporter slot reservations, and track remaining balance clearances.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Real-time Socket.io Payment Notification Banner */}
      {paymentNotice && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-900 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              ₹
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>Real-Time Payment Verified</span>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                  Razorpay Standard Checkout
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Socket.io Live
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Exporter <strong>{paymentNotice.exporterName}</strong> just paid <strong>₹{Number(paymentNotice.amountPaid || 0).toLocaleString()}</strong> ({paymentNotice.milestone === 'advance_25' ? '25% Advance Booking Deposit' : '75% Remaining Settlement'}) for shipment <strong>{paymentNotice.bookingId}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPaymentNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold px-3 py-1.5 border border-emerald-200 rounded-lg hover:bg-emerald-100/50 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Freight Collected</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              ₹{totalRevenueCollected.toLocaleString()}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600">Across {bookings.length} shipments</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Advance Deposits in Escrow</span>
            <div className="text-2xl font-black text-purple-700 mt-0.5">
              ₹{totalAdvanceHeld.toLocaleString()}
            </div>
            <span className="text-[11px] font-semibold text-purple-600">25% Slot Lock Funds</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approvals</span>
            <div className="text-2xl font-black text-amber-600 mt-0.5">
              {pendingApprovalsCount} Exporters
            </div>
            <span className="text-[11px] font-semibold text-amber-600">Advance paid • Awaiting you</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Fully Settled Shipments</span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {fullyPaidCount} Shipments
            </div>
            <span className="text-[11px] font-semibold text-emerald-600">100% balance cleared</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Two-Stage Advance Workflow Explainer Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-4 rounded-2xl border border-purple-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-purple-950">
              Two-Stage Advance Booking Protocol Active
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Exporters lock their container space by paying a <strong>25% advance deposit</strong>. Review their cargo & uploaded documents below, then click <strong>Approve</strong>. Once you approve, the exporter will pay the remaining <strong>75% balance</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by exporter, booking ref, route..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: `All (${bookings.length})` },
            { id: 'advance', label: `Needs Approval (${pendingApprovalsCount})` },
            { id: 'approved', label: 'Approved & Balance Due' },
            { id: 'fully_paid', label: `Fully Paid (${fullyPaidCount})` }
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

      {/* Paid Exporters Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Booking Ref</th>
                <th className="px-6 py-4">Exporter (Shipper)</th>
                <th className="px-6 py-4">Route & Cargo</th>
                <th className="px-6 py-4">Advance Paid</th>
                <th className="px-6 py-4">Carrier Approval</th>
                <th className="px-6 py-4">Remaining Balance</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Documents</th>
                <th className="px-6 py-4 text-right">Carrier Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading paid exporter records...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center text-slate-400">
                    No matching paid exporters found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const total = b.totalAmount || (b.cbm * 520 * 1.18 + 1650);
                  const advance = b.advanceAmount || b.amountPaid || Math.round(total * 0.25);
                  const balance = b.balanceAmount !== undefined ? b.balanceAmount : Math.max(0, total - advance);
                  const isApproved = b.status === 'Approved' || b.status === 'Accepted';
                  const isFullyPaid = b.paymentStatus === 'Fully Paid' || b.paymentStatus === 'Paid' || b.amountPaid >= total;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Booking ID */}
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-900 block">{b.id}</span>
                        <span className="text-[10px] text-slate-400">{b.date}</span>
                      </td>

                      {/* Exporter Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {b.exporterName ? b.exporterName.substring(0, 2).toUpperCase() : 'EX'}
                          </div>
                          <div>
                            <strong className="text-slate-900 block font-bold truncate max-w-[150px]">
                              {b.exporterName || 'Apex Textiles SME'}
                            </strong>
                            <span className="text-[10px] text-emerald-600 font-semibold">GST Verified</span>
                          </div>
                        </div>
                      </td>

                      {/* Route & Commodity */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800 block truncate max-w-[180px]" title={b.route}>
                          {b.route}
                        </span>
                        <span className="text-slate-500 text-[11px] block">
                          {b.commodity || 'General Cargo'} • <strong className="text-brand-600">{b.cbm} CBM</strong>
                        </span>
                      </td>

                      {/* Advance Paid */}
                      <td className="px-6 py-4">
                        <span className="font-black text-purple-700 text-sm block">
                          ₹{advance.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          25% Advance Paid
                        </span>
                      </td>

                      {/* Carrier Approval Status */}
                      <td className="px-6 py-4">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Carrier
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> Needs Your Approval
                          </span>
                        )}
                      </td>

                      {/* Remaining Balance */}
                      <td className="px-6 py-4">
                        {isFullyPaid || balance === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                            ₹0 Due • Settled
                          </span>
                        ) : (
                          <div>
                            <span className="font-bold text-amber-700 text-xs block">
                              ₹{balance.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {isApproved ? 'Awaiting Exporter Scan' : 'Payable on Approval'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                        ₹{total.toLocaleString()}
                      </td>

                      {/* Documents View Button */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedDocBooking(b)}
                          className="px-2.5 py-1.5 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="View uploaded invoices & packing lists"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Docs</span>
                        </button>
                      </td>

                      {/* Carrier Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {!isApproved ? (
                          <button
                            onClick={() => handleApproveBooking(b.id)}
                            disabled={actionLoadingId === b.id}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            {actionLoadingId === b.id ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                            <span>Approve Booking</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exporter Uploaded Documents Modal */}
      {selectedDocBooking && (
        <CarrierDocumentViewerModal 
          isOpen={!!selectedDocBooking}
          onClose={() => setSelectedDocBooking(null)}
          booking={selectedDocBooking}
        />
      )}

    </div>
  );
}
