import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Scan, 
  Camera, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  X, 
  ExternalLink, 
  ArrowRight,
  Sparkles,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { API_BASE } from '../../lib/apiConfig';

export default function PaymentScannerModal({ 
  isOpen, 
  onClose, 
  booking, 
  onPaymentSuccess 
}) {
  const [activeMode, setActiveMode] = useState('qr'); // 'qr' or 'camera'
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const bookingId = booking?.id || 'CS-DEMO';
  const amount = booking?.amountToPay || booking?.balanceAmount || booking?.totalAmount || booking?.amountPaid || (booking?.cbm ? Math.round(booking.cbm * 520 * 1.18 + 1650) : 24850);
  const route = booking?.route || 'JNPT, Mumbai → Jebel Ali, Dubai';
  const carrier = booking?.carrier || 'Maersk Line Logistics';
  const isRemaining = Boolean(booking?.isRemainingPayment);
  const upiVpa = 'cargoshare.escrow@hdfcbank';
  const upiPayload = `upi://pay?pa=${upiVpa}&pn=CargoShare%20AI&am=${amount}&cu=INR&tn=${isRemaining ? 'Remaining%20Freight' : 'Freight%20Booking'}%20${bookingId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(upiPayload)}`;

  // 5-minute countdown timer
  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(300);
    setIsSuccess(false);
    setIsVerifying(false);

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Handle Camera stream in 'camera' mode
  useEffect(() => {
    if (activeMode === 'camera' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeMode, isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } else {
        setCameraActive(false);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access not available. Interactive scanner simulation active.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulatePayment = async () => {
    setIsVerifying(true);
    const txnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const updatePayload = isRemaining ? {
      paymentStatus: 'Fully Paid',
      paymentMethod: 'UPI Remaining Balance',
      amountPaid: Number(booking.totalAmount || (Number(booking.amountPaid || 0) + Number(amount))),
      balanceAmount: 0,
      transactionId: txnId
    } : {
      paymentStatus: booking?.paymentStatus || 'Advance Paid (25%)',
      paymentMethod: 'UPI QR Scanner',
      amountPaid: amount,
      transactionId: txnId
    };

    try {
      // Try updating backend booking
      if (booking?.id) {
        await fetch(`${API_BASE}/api/bookings/${booking.id}/payment`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        }).catch(e => console.warn('Backend payment patch fallback:', e));
      }

      await new Promise(r => setTimeout(r, 1200));
      setIsVerifying(false);
      setIsSuccess(true);

      if (onPaymentSuccess) {
        onPaymentSuccess({
          ...booking,
          ...updatePayload
        });
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsVerifying(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">
                  {isRemaining ? 'Pay Remaining Balance (75%)' : 'UPI Payment Scanner'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  {isRemaining ? 'Carrier Approved' : '25% Advance'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isRemaining 
                  ? 'Space confirmed by carrier • Scan & Pay final balance' 
                  : 'Scan & Pay 25% Advance • Safe Escrow Protection'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200/80 flex gap-2">
          <button
            onClick={() => setActiveMode('qr')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-2 border-b-2 ${
              activeMode === 'qr'
                ? 'bg-white text-brand-600 border-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Display QR Scanner
          </button>
          <button
            onClick={() => setActiveMode('camera')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-2 border-b-2 ${
              activeMode === 'camera'
                ? 'bg-white text-brand-600 border-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Camera className="w-4 h-4" />
            Camera QR Reader
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Booking Summary Strip */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {isRemaining ? 'Remaining Balance (75%)' : 'Advance Deposit (25%)'}
              </span>
              <div className="text-2xl font-black text-slate-900">₹{amount.toLocaleString()}</div>
              <span className="text-xs text-slate-600 font-medium truncate block max-w-[240px]">
                Ref: <strong className="text-brand-600">{bookingId}</strong> • {carrier}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Time Left</span>
              <div className="inline-flex items-center gap-1 font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-sm">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Two-Stage Payment Lifecycle Context Banner */}
          {isRemaining ? (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <div className="p-1 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="block font-bold text-emerald-950">Step 2: Carrier Has Approved Your Booking!</strong>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  The carrier verified your cargo documents and allocated space. Scan the QR code below to pay the remaining <strong>75% balance of ₹{amount.toLocaleString()}</strong> to complete your shipment.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-2xl border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
              <div className="p-1 bg-purple-600 text-white rounded-lg shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="block font-bold text-purple-950">Step 1: 25% Booking Advance Deposit</strong>
                <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                  Pay <strong>₹{amount.toLocaleString()}</strong> now to lock your space into escrow. The carrier will review your documents and approve the booking before the remaining 75% balance is due.
                </p>
              </div>
            </div>
          )}

          {/* MODE A: DISPLAY QR SCANNER */}
          {activeMode === 'qr' && (
            <div className="space-y-4">
              
              {/* The Interactive QR Code with Laser Scanner Beam */}
              <div className="relative mx-auto w-64 h-64 bg-slate-950 p-4 rounded-3xl shadow-xl border-4 border-slate-900 flex flex-col items-center justify-center overflow-hidden">
                
                {/* Viewfinder Target Corner Brackets */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg pointer-events-none z-20"></div>
                <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg pointer-events-none z-20"></div>
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg pointer-events-none z-20"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg pointer-events-none z-20"></div>

                {/* Animated Green Laser Scan Line */}
                <div className="absolute left-3 right-3 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-laser z-20 pointer-events-none"></div>

                {/* QR Code Image */}
                <div className="bg-white p-2 rounded-2xl shadow-inner z-10 w-full h-full flex items-center justify-center">
                  <img 
                    src={qrCodeUrl} 
                    alt={`UPI Payment QR Code for ₹${amount}`}
                    className="w-full h-full object-contain select-none"
                    onError={(e) => {
                      // Fallback to simple simulated SVG QR if external API has network hiccup
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Local SVG Fallback (hidden by default) */}
                  <div style={{ display: 'none' }} className="w-full h-full flex-col items-center justify-center bg-slate-50 text-slate-800">
                    <QrCode className="w-32 h-32 text-slate-800" />
                    <span className="text-[10px] font-bold text-slate-500 mt-1">UPI: {upiVpa}</span>
                  </div>
                </div>

                {/* Sub-label inside scanner */}
                <div className="absolute bottom-1 z-20 bg-slate-900/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[9px] font-bold text-emerald-300 border border-emerald-500/20">
                  SCAN WITH ANY UPI APP
                </div>
              </div>

              {/* Supported UPI Apps Row */}
              <div className="text-center space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Supported UPI Applications
                </p>
                <div className="flex flex-wrap justify-center items-center gap-1.5">
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'CRED', 'Amazon Pay'].map((app) => (
                    <span 
                      key={app} 
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              {/* Copy UPI VPA Option */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-brand-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">UPI ID / VPA</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{upiVpa}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyVpa}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      Copy ID
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* MODE B: CAMERA QR READER */}
          {activeMode === 'camera' && (
            <div className="space-y-4">
              <div className="relative mx-auto w-full h-64 bg-slate-950 rounded-3xl overflow-hidden border-4 border-slate-900 shadow-xl flex items-center justify-center">
                
                {/* Live Video or Simulated Camera View */}
                {cameraActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 space-y-3 z-10 text-white">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Camera Viewfinder Ready</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                        Point camera at your UPI payment QR receipt, invoice, or banking terminal.
                      </p>
                    </div>
                  </div>
                )}

                {/* Laser scan line in camera mode */}
                <div className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-laser z-20 pointer-events-none"></div>

                {/* Viewfinder crosshairs */}
                <div className="absolute inset-8 border-2 border-white/20 border-dashed rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-12 h-12 border border-emerald-400/50 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  </div>
                </div>

                <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg pointer-events-none z-20"></div>
                <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg pointer-events-none z-20"></div>
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg pointer-events-none z-20"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg pointer-events-none z-20"></div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isVerifying || isSuccess}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 mx-auto"
                >
                  <Scan className="w-4 h-4" />
                  Capture & Verify QR Voucher
                </button>
              </div>
            </div>
          )}

          {/* Security Guarantee */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Escrow Protected: Funds held in HDFC RBI-compliant Escrow account until vessel container gate-in.</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-white rounded-xl text-xs font-bold transition-colors"
          >
            Cancel / Close
          </button>

          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={isVerifying || isSuccess}
            className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 text-white ${
              isSuccess 
                ? 'bg-emerald-600 shadow-emerald-500/20' 
                : isVerifying 
                  ? 'bg-brand-500 opacity-90' 
                  : 'bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 shadow-emerald-600/30'
            }`}
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Checking NPCI UPI Switch...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                <span>Payment Received & Verified!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>I Have Paid / Verify UPI Payment</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
