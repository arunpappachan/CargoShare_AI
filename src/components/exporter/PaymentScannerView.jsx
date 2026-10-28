import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  FileCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { API_BASE } from '../../lib/apiConfig';
import { openRazorpayCheckout } from '../../lib/razorpay';
import { syncBookingToAdmin } from '../../lib/syncAdminData';
import PaymentReceiptModal from '../common/PaymentReceiptModal';
import PaymentScannerModal from '../common/PaymentScannerModal';

export default function PaymentScannerView({ onNavigateTab }) {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState('advance_25'); // 'advance_25' or 'remaining_75'
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bookings`);
        const json = await res.json();
        if (json.status === 'success' && json.data.length > 0) {
          setBookings(json.data);
          setSelectedBooking(json.data[0]);
        } else {
          const fallback = [
            {
              id: 'CS-1001',
              route: 'Mumbai (Nhava Sheva/JNPT) → Mundra Port',
              carrier: 'Oceanic Freight Ltd.',
              exporterName: 'Apex Textiles SME',
              cbm: 25,
              totalAmount: 28450,
              advanceAmount: 7113,
              balanceAmount: 21337,
              amountPaid: 7113,
              status: 'Pending Confirmation',
              paymentStatus: 'Advance Paid (25%)',
              paymentMethod: 'Razorpay Standard Checkout'
            },
            {
              id: 'CS-1002',
              route: 'Chennai Port → Kolkata Port',
              carrier: 'Oceanic Freight Ltd.',
              exporterName: 'Bharat Agro Exporters Ltd.',
              cbm: 18,
              totalAmount: 24800,
              advanceAmount: 6200,
              balanceAmount: 18600,
              amountPaid: 6200,
              status: 'Approved',
              paymentStatus: 'Advance Paid (25%)',
              paymentMethod: 'Razorpay Standard Checkout'
            },
            {
              id: 'CS-1003',
              route: 'Cochin Port → Visakhapatnam Port',
              carrier: 'Oceanic Freight Ltd.',
              exporterName: 'Zenith Spices & Commodities',
              cbm: 32,
              totalAmount: 39500,
              advanceAmount: 9875,
              balanceAmount: 29625,
              amountPaid: 0,
              status: 'In Transit',
              paymentStatus: 'Unpaid',
              paymentMethod: 'Razorpay Standard Checkout'
            }
          ];
          setBookings(fallback);
          setSelectedBooking(fallback[0]);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };
    fetchBookings();
  }, []);

  // Update selected milestone when selected booking changes
  useEffect(() => {
    if (!selectedBooking) return;
    const total = Number(selectedBooking.totalAmount || (selectedBooking.cbm * 520 * 1.18 + 1650));
    const advance = Number(selectedBooking.advanceAmount || Math.round(total * 0.25));
    const paid = Number(selectedBooking.amountPaid || 0);

    // If already paid advance, default to remaining 75%
    if (paid >= advance && selectedBooking.paymentStatus !== 'Fully Paid' && selectedBooking.paymentStatus !== 'Paid') {
      setSelectedMilestone('remaining_75');
    } else if (selectedBooking.paymentStatus === 'Fully Paid' || selectedBooking.paymentStatus === 'Paid') {
      setSelectedMilestone('remaining_75');
    } else {
      setSelectedMilestone('advance_25');
    }
  }, [selectedBooking]);

  const totalAmount = selectedBooking ? Number(selectedBooking.totalAmount || (selectedBooking.cbm * 520 * 1.18 + 1650)) : 28450;
  const advanceAmount = selectedBooking ? Number(selectedBooking.advanceAmount || Math.round(totalAmount * 0.25)) : 7113;
  const balanceAmount = selectedBooking ? Number(selectedBooking.balanceAmount !== undefined ? selectedBooking.balanceAmount : Math.max(0, totalAmount - advanceAmount)) : 21337;
  const amountPaid = selectedBooking ? Number(selectedBooking.amountPaid || 0) : 0;

  const isAdvancePaid = (selectedBooking?.paymentStatus || '').includes('Advance') || amountPaid >= advanceAmount;
  const isFullyPaid = selectedBooking?.paymentStatus === 'Fully Paid' || selectedBooking?.paymentStatus === 'Paid' || balanceAmount === 0;

  const currentPaymentAmount = selectedMilestone === 'advance_25' 
    ? advanceAmount 
    : (balanceAmount > 0 ? balanceAmount : Math.round(totalAmount * 0.75));

  const handleLaunchCheckout = async () => {
    if (!selectedBooking) return;
    setIsLoading(true);

    try {
      await openRazorpayCheckout({
        booking: selectedBooking,
        milestone: selectedMilestone,
        onSuccess: (result) => {
          setIsLoading(false);
          if (result.receipt) {
            setReceiptData(result.receipt);
            setIsReceiptOpen(true);
          }

          // Update local state
          const updated = result.booking || {
            ...selectedBooking,
            paymentStatus: selectedMilestone === 'advance_25' ? 'Advance Paid (25%)' : 'Fully Paid',
            amountPaid: selectedMilestone === 'advance_25' ? advanceAmount : totalAmount,
            balanceAmount: selectedMilestone === 'advance_25' ? (totalAmount - advanceAmount) : 0,
            paymentMethod: 'Razorpay Standard Checkout',
            transactionId: result.paymentId
          };

          setSelectedBooking(updated);
          setBookings(prev => prev.map(b => b.id === updated.id ? { ...b, ...updated } : b));
          syncBookingToAdmin(updated);
        },
        onDismiss: () => {
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.error('Checkout launch error:', err);
      setIsLoading(false);
      alert(`Checkout Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              ⚡ Razorpay Standard Checkout
            </span>
            <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Test Mode Active
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Razorpay Freight Checkout</h1>
          <p className="text-slate-500 mt-1">
            Official Razorpay Standard Checkout gateway for 25% Advance Booking deposits and 75% Remaining Freight settlement.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#0369a1] hover:to-[#075985] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-4 h-4 text-blue-200" />
          <span>Quick Checkout Modal</span>
        </button>
      </div>

      {/* Main Grid: Left Standard Checkout + Right Booking Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Razorpay Standard Checkout Terminal (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">

          {/* Shipment Overview Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0c2340] to-[#0284c7] flex items-center justify-center text-white font-black text-lg shadow-sm">
                R
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Razorpay Freight Gateway</h3>
                <p className="text-xs text-slate-500">Booking {selectedBooking?.id || 'CS-1001'} • {selectedBooking?.carrier || 'Carrier'}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Freight Value</span>
              <span className="font-black text-slate-900 text-lg">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Workflow Milestone Selector (25% Advance vs 75% Remaining) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Select Payment Milestone
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option 1: 25% Advance Payment */}
              <div
                onClick={() => !isFullyPaid && setSelectedMilestone('advance_25')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  selectedMilestone === 'advance_25'
                    ? 'border-[#0284c7] bg-blue-50/50 ring-2 ring-[#0284c7]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                } ${isAdvancePaid ? 'opacity-85' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">25% Advance Deposit</span>
                  {isAdvancePaid && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      Paid
                    </span>
                  )}
                </div>
                <div className="text-xl font-black text-slate-900 mt-2">
                  ₹{advanceAmount.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Locks vessel container slot and triggers carrier confirmation workflow.
                </p>
              </div>

              {/* Option 2: 75% Remaining Payment */}
              <div
                onClick={() => setSelectedMilestone('remaining_75')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  selectedMilestone === 'remaining_75'
                    ? 'border-[#0284c7] bg-blue-50/50 ring-2 ring-[#0284c7]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">75% Remaining Settlement</span>
                  {isFullyPaid && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      Paid
                    </span>
                  )}
                </div>
                <div className="text-xl font-black text-slate-900 mt-2">
                  ₹{balanceAmount.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Final freight balance due upon carrier approval or terminal gate-in.
                </p>
              </div>

            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Total Shipment Value:</span>
              <span className="font-bold text-slate-800">₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Amount Already Paid:</span>
              <span className="font-bold text-emerald-600">₹{amountPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Current Outstanding Balance:</span>
              <span className="font-bold text-slate-800">₹{balanceAmount.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 font-extrabold text-sm">
              <span>Amount Due for Checkout:</span>
              <span className="text-[#0284c7]">₹{currentPaymentAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Razorpay Trust & Security Card */}
          <div className="bg-gradient-to-r from-[#0c2340] to-[#13335c] text-white p-4 rounded-2xl border border-blue-900/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-white">Razorpay Standard Checkout</span>
                    <span className="text-[9px] bg-blue-500/30 text-blue-200 font-bold px-1.5 py-0.5 rounded uppercase">
                      Test Mode
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 mt-0.5 block">
                    Cards (Visa, Mastercard, RuPay) • UPI • 50+ NetBanking Options
                  </span>
                </div>
              </div>
              <Lock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10 font-medium">
              <span>PCI-DSS Level 1 & 256-Bit SSL Encrypted</span>
              <span className="text-emerald-400 font-bold">Zero Surcharge</span>
            </div>
          </div>

          {/* Notice: Approval Status is Separated */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Workflow Isolation:</strong> Booking approval status (<em>{selectedBooking?.status || 'Pending Confirmation'}</em>) remains independent of payment status. Carrier confirmation is governed by terminal space allocation.
            </div>
          </div>

          {/* Primary Action Button: Standard Checkout */}
          <div className="pt-1">
            {isFullyPaid && selectedMilestone === 'remaining_75' ? (
              <div className="w-full py-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-center text-emerald-800 font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>This Shipment is Fully Settled</span>
              </div>
            ) : (
              <button
                onClick={handleLaunchCheckout}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0c2340] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Initializing Razorpay Standard Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-blue-200" />
                    <span>Proceed to Razorpay Checkout (Pay ₹{currentPaymentAmount.toLocaleString()})</span>
                    <ArrowRight className="w-4 h-4 ml-1 text-blue-200" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>

        {/* Right Column: Select Booking & Escrow Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Select Booking Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Select Shipment</h3>
              <span className="text-xs text-slate-400 font-bold">{bookings.length} Bookings</span>
            </div>
            <p className="text-xs text-slate-500">Choose an active cargo booking to pay advance or remaining balance.</p>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {bookings.map(b => {
                const bTotal = Number(b.totalAmount || (b.cbm * 520 * 1.18 + 1650));
                const isSelected = selectedBooking?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0284c7] bg-blue-50/50 ring-2 ring-[#0284c7]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-sm">{b.id}</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ₹{bTotal.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1 truncate">{b.route}</p>
                    
                    <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
                      <span className="text-slate-400">{b.carrier}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {b.status || 'Pending'}
                        </span>
                        <span className="font-bold text-[#0284c7]">
                          {b.paymentStatus || 'Unpaid'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-Time Carrier Dispatch Socket Card */}
          <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Carrier WebSocket Sync</h4>
                <p className="text-xs text-slate-400">Real-Time Socket.io Settlement</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Upon successful payment verification, an instant WebSocket event is emitted to the carrier's terminal dashboard. The booking payment record is synchronized with zero delay.
            </p>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Carrier Socket Status:</span>
              <strong className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Connected
              </strong>
            </div>
          </div>

          {/* Quick Nav to Bookings List */}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('bookings')}
              className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-[#0284c7]" />
              <span>View All Booking Invoices & Receipts</span>
            </button>
          )}

        </div>

      </div>

      {/* Quick Checkout Modal */}
      {isModalOpen && (
        <PaymentScannerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          booking={selectedBooking}
          onPaymentSuccess={(updated) => {
            setSelectedBooking(updated);
            setBookings(prev => prev.map(b => b.id === updated.id ? { ...b, ...updated } : b));
            if (updated.receipt) {
              setReceiptData(updated.receipt);
              setIsReceiptOpen(true);
            }
          }}
        />
      )}

      {/* Test Payment Receipt Modal */}
      {isReceiptOpen && receiptData && (
        <PaymentReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          receipt={receiptData}
        />
      )}

    </div>
  );
}
