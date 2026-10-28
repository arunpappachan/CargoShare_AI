import React from 'react';
import {
  CheckCircle2,
  Receipt,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  Radio,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function PaymentReceiptModal({
  isOpen,
  onClose,
  receipt
}) {
  if (!isOpen || !receipt) return null;

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
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  Test Payment Verified
                </span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-bold">
                  Razorpay Sandbox
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1 text-white">Payment Receipt</h2>
            </div>
          </div>
        </div>

        {/* Receipt Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Main Amount Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
              Amount Paid
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              ₹{Number(receipt.amountPaid || 0).toLocaleString()}
            </div>
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full text-xs font-bold">
              <span>{receipt.milestone}</span>
            </div>
          </div>

          {/* Key Receipt Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Receipt Number</span>
              <span className="font-mono font-bold text-slate-800">{receipt.receiptNumber}</span>
            </div>
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Payment ID</span>
              <span className="font-mono font-bold text-slate-800 truncate block" title={receipt.paymentId}>
                {receipt.paymentId}
              </span>
            </div>
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Booking ID</span>
              <span className="font-bold text-slate-800">{receipt.bookingId}</span>
            </div>
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Razorpay Order ID</span>
              <span className="font-mono font-bold text-slate-800 truncate block" title={receipt.orderId}>
                {receipt.orderId}
              </span>
            </div>
          </div>

          {/* Status Breakdown (Payment Status vs Booking Approval Status) */}
          <div className="space-y-2 border-t border-b border-slate-100 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Payment Status:</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {receipt.paymentStatus}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Booking Approval Status:</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {receipt.bookingApprovalStatus}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Remaining Balance:</span>
              <span className="font-bold text-slate-800">
                ₹{Number(receipt.remainingBalance || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Route & Carrier Details */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Carrier:</span>
              <span className="font-bold text-slate-800">{receipt.carrier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Route:</span>
              <span className="font-medium text-slate-700 max-w-[240px] truncate text-right">
                {receipt.route}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Date & Time:</span>
              <span className="font-medium text-slate-700">{new Date(receipt.paidAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Real-Time Carrier Notification Indicator */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            <span>
              <strong>Carrier Notified:</strong> Real-time payment event transmitted via Socket.io to <em>{receipt.carrier}</em>.
            </span>
          </div>

          <p className="text-[11px] text-slate-400 italic text-center">
            Note: Booking approval status remains separate and is subject to carrier terminal slot verification.
          </p>

        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
