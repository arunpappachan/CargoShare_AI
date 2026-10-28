import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Scan, 
  Copy, 
  Check, 
  Ship, 
  Building, 
  X,
  CreditCard,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RazorpayDemoModal({ isOpen, onClose }) {
  const [selectedRole, setSelectedRole] = useState('exporter');
  const [step, setStep] = useState('qr'); // 'qr' | 'processing' | 'success'
  const [copied, setCopied] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [createdUser, setCreatedUser] = useState(null);
  const [timer, setTimer] = useState(120);

  const { registerWithRazorpay } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTxnId(`rzp_demo_${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
      setStep('qr');
      setTimer(120);
    }
  }, [isOpen]);

  // Countdown timer for realistic payment expiration
  useEffect(() => {
    if (!isOpen || step !== 'qr') return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('cargoshare.demo@razorpay');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScanAndPay = async () => {
    setStep('processing');

    try {
      // Step 1: Simulate mobile UPI authorization delay (1.2s)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const paymentId = `pay_${txnId.toLowerCase()}`;
      const res = await registerWithRazorpay({
        role: selectedRole,
        paymentId,
        amount: 1
      });

      setCreatedUser(res.user);
      setStep('success');
      toast.success(
        `Welcome to CargoShare AI! Demo ${selectedRole === 'carrier' ? 'Carrier' : 'Exporter'} account activated via Razorpay QR.`,
        'Razorpay Payment Verified'
      );

      // Automatically redirect after showing success screen for 1.8 seconds
      setTimeout(() => {
        onClose();
        if (selectedRole === 'carrier') {
          navigate('/dashboard/carrier');
        } else {
          navigate('/dashboard/exporter');
        }
      }, 1800);
    } catch (err) {
      console.error('Razorpay demo error:', err);
      toast.error(err.message || 'Failed to initialize demo account', 'Error');
      setStep('qr');
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-slate-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Razorpay Header Bar */}
        <div className="bg-[#0c2340] px-6 py-4 flex items-center justify-between text-white relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0284c7] flex items-center justify-center shadow-inner">
              <span className="font-black text-sm tracking-tighter text-white">R</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight">Razorpay</span>
                <span className="text-[10px] uppercase font-bold bg-[#1e3a8a] text-blue-200 px-1.5 py-0.5 rounded tracking-wider border border-blue-400/30">
                  Sandbox
                </span>
              </div>
              <p className="text-[11px] text-slate-300">CargoShare AI • Instant Demo Account</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 'qr' && (
            <div className="space-y-5">
              
              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Demo Role to Activate
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('exporter')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      selectedRole === 'exporter'
                        ? 'border-[#0284c7] bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-slate-900 font-bold text-xs">
                      <Building className="w-3.5 h-3.5 text-[#0284c7]" />
                      Exporter SME
                    </div>
                    <span className="text-[10px] text-slate-500">Book Container Space</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('carrier')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      selectedRole === 'carrier'
                        ? 'border-[#0284c7] bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-slate-900 font-bold text-xs">
                      <Ship className="w-3.5 h-3.5 text-blue-700" />
                      Ocean Carrier
                    </div>
                    <span className="text-[10px] text-slate-500">Post Vessel & Approve</span>
                  </button>
                </div>
              </div>

              {/* Dynamic QR Code Card with Laser Animation */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                  <span className="font-semibold flex items-center gap-1">
                    <Scan className="w-3.5 h-3.5 text-emerald-600" /> Dynamic UPI QR
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Expires in <strong className="text-slate-800">{formatTimer(timer)}</strong>
                  </span>
                </div>

                {/* SVG Mock QR Container */}
                <div className="relative mx-auto w-48 h-48 bg-white p-3 rounded-2xl shadow-sm border-2 border-slate-900 flex flex-col items-center justify-center overflow-hidden">
                  
                  {/* Viewfinder Corner Brackets */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500 rounded-tl-sm pointer-events-none z-20"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-500 rounded-tr-sm pointer-events-none z-20"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-500 rounded-bl-sm pointer-events-none z-20"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500 rounded-br-sm pointer-events-none z-20"></div>

                  {/* Animated Laser Scan Line */}
                  <div className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] animate-pulse z-20 pointer-events-none"></div>

                  {/* Realistic QR Pattern SVG */}
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* Corner 1 */}
                    <rect x="5" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6"/>
                    <rect x="13" y="13" width="12" height="12" rx="2" fill="currentColor"/>
                    
                    {/* Corner 2 */}
                    <rect x="67" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6"/>
                    <rect x="75" y="13" width="12" height="12" rx="2" fill="currentColor"/>
                    
                    {/* Corner 3 */}
                    <rect x="5" y="67" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6"/>
                    <rect x="13" y="75" width="12" height="12" rx="2" fill="currentColor"/>
                    
                    {/* Data Pixels Pattern */}
                    <rect x="38" y="10" width="6" height="6" />
                    <rect x="48" y="10" width="6" height="6" />
                    <rect x="58" y="10" width="5" height="6" />
                    <rect x="38" y="20" width="10" height="6" />
                    <rect x="54" y="20" width="6" height="6" />
                    <rect x="42" y="30" width="16" height="6" />
                    
                    <rect x="10" y="38" width="6" height="10" />
                    <rect x="22" y="38" width="6" height="16" />
                    <rect x="34" y="44" width="8" height="8" />
                    <rect x="46" y="40" width="8" height="8" />
                    <rect x="58" y="44" width="8" height="8" />
                    <rect x="70" y="38" width="6" height="10" />
                    <rect x="82" y="38" width="8" height="16" />

                    <rect x="38" y="60" width="8" height="8" />
                    <rect x="50" y="58" width="12" height="6" />
                    <rect x="66" y="60" width="8" height="8" />
                    <rect x="38" y="72" width="6" height="12" />
                    <rect x="48" y="78" width="14" height="6" />
                    <rect x="66" y="72" width="6" height="12" />
                    <rect x="78" y="78" width="12" height="6" />
                    <rect x="82" y="66" width="6" height="8" />
                  </svg>

                  {/* Center Razorpay Badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-9 h-9 bg-white rounded-xl shadow-md border-2 border-[#0c2340] flex items-center justify-center p-0.5">
                      <span className="font-black text-[#0284c7] text-xs tracking-tighter">RZP</span>
                    </div>
                  </div>
                </div>

                {/* VPA and Amount Strip */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                    <span>cargoshare.demo@razorpay</span>
                    <button 
                      type="button" 
                      onClick={handleCopyUpi} 
                      className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                      title="Copy UPI ID"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="font-bold text-[#0284c7]">₹1.00 (Sandbox)</span>
                </div>
              </div>

              {/* Action Button: Simulate Scan */}
              <button
                type="button"
                onClick={handleSimulateScanAndPay}
                className="w-full py-3.5 px-4 bg-[#0c2340] hover:bg-[#13335c] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm group"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span>Simulate Scan & Activate Demo Account</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Razorpay 256-Bit SSL Secured • Instant Session Token Created</span>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center space-y-5 animate-in fade-in">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#0284c7] animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-[#0284c7] animate-pulse" />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-slate-900">Authorizing via Razorpay...</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Processing UPI QR payment and generating demo credentials for {selectedRole === 'carrier' ? 'Carrier' : 'Exporter'}...
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 max-w-xs mx-auto text-left space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Mobile UPI Intent Received
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5" /> ₹1.00 Sandbox Payment Captured
                </div>
                <div className="flex items-center gap-2 text-blue-700 font-semibold animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Provisioning PostgreSQL Account...
                </div>
              </div>
            </div>
          )}

          {step === 'success' && createdUser && (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full uppercase tracking-wider mb-1">
                  Razorpay Payment Verified
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">Demo Account Created!</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Logged in as <strong>{createdUser.name}</strong> ({createdUser.role})
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left space-y-2 text-xs max-w-xs mx-auto font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[170px]">{createdUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="font-bold text-[#0284c7]">pay_{txnId.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-600 font-bold">Active & Verified</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 animate-pulse">
                Redirecting to your {selectedRole === 'carrier' ? 'Carrier' : 'Exporter'} dashboard...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
