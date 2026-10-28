import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  X,
  ShieldCheck,
  Printer,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  Clock,
  Lock
} from 'lucide-react';
import { API_BASE } from '../../lib/apiConfig';
import { openRazorpayCheckout } from '../../lib/razorpay';
import { syncBookingToAdmin } from '../../lib/syncAdminData';

export default function PaymentScannerModal({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess
}) {
  const [selectedMilestone, setSelectedMilestone] = useState('advance_25');
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize milestone and state when booking opens
  useEffect(() => {
    if (!isOpen || !booking) return;
    setIsSuccess(false);
    setReceiptData(null);
    setIsLoading(false);

    const total = Number(booking.totalAmount || (booking.cbm ? Math.round(booking.cbm * 520 * 1.18 + 1650) : 28450));
    const advance = Number(booking.advanceAmount || Math.round(total * 0.25));
    const paid = Number(booking.amountPaid || 0);

    if (booking.isRemainingPayment || (paid >= advance && booking.paymentStatus !== 'Fully Paid')) {
      setSelectedMilestone('remaining_75');
    } else {
      setSelectedMilestone('advance_25');
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const totalAmount = Number(booking.totalAmount || (booking.cbm ? Math.round(booking.cbm * 520 * 1.18 + 1650) : 28450));
  const advanceAmount = Number(booking.advanceAmount || Math.round(totalAmount * 0.25));
  const amountPaid = Number(booking.amountPaid || 0);
  const balanceAmount = Number(booking.balanceAmount !== undefined ? booking.balanceAmount : Math.max(0, totalAmount - amountPaid));
  const bookingId = booking.id || 'CS-1001';

  const isAdvancePaid = (booking.paymentStatus || '').includes('Advance') || amountPaid >= advanceAmount;
  const isFullyPaid = booking.paymentStatus === 'Fully Paid' || booking.paymentStatus === 'Paid' || balanceAmount === 0;

  const amountToPay = selectedMilestone === 'advance_25' 
    ? advanceAmount 
    : (balanceAmount > 0 ? balanceAmount : Math.round(totalAmount * 0.75));

  const handlePay = async () => {
    setIsLoading(true);

    try {
      await openRazorpayCheckout({
        booking,
        milestone: selectedMilestone,
        onSuccess: (result) => {
          setIsLoading(false);
          setReceiptData(result.receipt);
          setIsSuccess(true);

          const updatedBooking = result.booking || {
            ...booking,
            paymentStatus: selectedMilestone === 'advance_25' ? 'Advance Paid (25%)' : 'Fully Paid',
            amountPaid: selectedMilestone === 'advance_25' ? advanceAmount : totalAmount,
            balanceAmount: selectedMilestone === 'advance_25' ? (totalAmount - advanceAmount) : 0,
            paymentMethod: 'Razorpay Standard Checkout',
            transactionId: result.paymentId,
            receipt: result.receipt
          };

          syncBookingToAdmin(updatedBooking);
          if (onPaymentSuccess) {
            onPaymentSuccess({ ...updatedBooking, receipt: result.receipt });
          }
        },
        onDismiss: () => {
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.error('Checkout error:', err);
      setIsLoading(false);
      alert(`Payment error: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#0c2340] via-[#13335c] to-[#0284c7] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-xl">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Razorpay Standard Checkout
                </span>
                <span className="text-[9px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded uppercase font-bold">
                  Test Mode
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1 text-white">Freight Settlement Terminal</h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {isSuccess && receiptData ? (
            /* =================== TEST PAYMENT RECEIPT VIEW =================== */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center py-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Payment Captured & Verified!</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Razorpay Sandbox Settlement Successful
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                  Amount Transacted
                </span>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  ₹{Number(receiptData.amountPaid || 0).toLocaleString()}
                </div>
                <div className="inline-block mt-1 text-xs font-bold text-[#0284c7] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {receiptData.milestone}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Receipt No.</span>
                  <span className="font-mono font-bold text-slate-800">{receiptData.receiptNumber}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Payment ID</span>
                  <span className="font-mono font-bold text-slate-800 truncate block">{receiptData.paymentId}</span>
                </div>
              </div>

              {/* Status Separation Notice */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-bold text-emerald-600">{receiptData.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Approval Status:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {receiptData.bookingApprovalStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remaining Due:</span>
                  <span className="font-bold text-slate-800">₹{Number(receiptData.remainingBalance || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Real-Time Carrier Notification Indicator */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                <span>
                  <strong>Carrier Notified:</strong> WebSocket event sent via Socket.io to <em>{receiptData.carrier}</em>.
                </span>
              </div>

              {/* Receipt Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          ) : (
            /* =================== CHECKOUT SELECTION VIEW =================== */
            <>
              {/* Shipment Meta Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">{bookingId}</span>
                  <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                    {booking.carrier || 'Oceanic Freight Ltd.'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1 truncate">
                  {booking.route || 'Maritime Freight Route'}
                </p>
                <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 font-medium">Total Freight Value:</span>
                  <span className="font-black text-slate-900 text-sm">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Milestone Selection (25% Advance vs 75% Remaining) */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Select Payment Milestone
                </span>

                <div className="grid grid-cols-2 gap-3">
                  
                  {/* 25% Advance */}
                  <div
                    onClick={() => !isFullyPaid && setSelectedMilestone('advance_25')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedMilestone === 'advance_25'
                        ? 'border-[#0284c7] bg-blue-50/50 ring-2 ring-[#0284c7]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">25% Advance</span>
                      {isAdvancePaid && (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          Paid
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-slate-900 mt-1">
                      ₹{advanceAmount.toLocaleString()}
                    </div>
                  </div>

                  {/* 75% Remaining */}
                  <div
                    onClick={() => setSelectedMilestone('remaining_75')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedMilestone === 'remaining_75'
                        ? 'border-[#0284c7] bg-blue-50/50 ring-2 ring-[#0284c7]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">75% Remaining</span>
                      {isFullyPaid && (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          Paid
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-slate-900 mt-1">
                      ₹{balanceAmount.toLocaleString()}
                    </div>
                  </div>

                </div>
              </div>

              {/* Razorpay Trust Banner */}
              <div className="bg-gradient-to-r from-[#0c2340] to-[#13335c] text-white p-3.5 rounded-2xl border border-blue-900/60 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Razorpay 256-Bit SSL Protected</span>
                </div>
                <span className="text-[10px] text-emerald-300 font-extrabold bg-emerald-500/20 px-2 py-0.5 rounded uppercase">
                  Zero Surcharge
                </span>
              </div>

              {/* Status Separation Note */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Booking approval status (<em>{booking.status || 'Pending Confirmation'}</em>) remains separate and is confirmed by the carrier upon schedule alignment.
                </span>
              </div>

              {/* Checkout Action Button */}
              <div className="pt-2">
                {isFullyPaid && selectedMilestone === 'remaining_75' ? (
                  <div className="w-full py-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-center text-emerald-800 font-bold text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Booking is Fully Paid</span>
                  </div>
                ) : (
                  <button
                    onClick={handlePay}
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0c2340] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Connecting to Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-blue-200" />
                        <span>Pay ₹{amountToPay.toLocaleString()} with Razorpay</span>
                        <ArrowRight className="w-4 h-4 ml-1 text-blue-200" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
