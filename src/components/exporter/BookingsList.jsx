import React, { useState, useEffect } from 'react';
import { 
  PackageSearch, 
  Map, 
  FileText, 
  CheckCircle, 
  Navigation, 
  Anchor, 
  Truck, 
  MessageCircle,
  Receipt,
  Printer,
  CreditCard,
  ShieldCheck,
  Scan,
  QrCode,
  Sparkles
} from 'lucide-react';
import ChatWidget from '../ChatWidget';
import PaymentScannerModal from '../common/PaymentScannerModal';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../lib/apiConfig';

export default function BookingsList({ onNavigateTab }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [trackingModal, setTrackingModal] = useState(null);
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
  const [scannerBooking, setScannerBooking] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const handlePaymentSuccess = (updatedData) => {
    if (!updatedData) return;
    setActiveBookings(prev => prev.map(b => b.id === updatedData.id ? { ...b, ...updatedData } : b));
    setPastBookings(prev => prev.map(b => b.id === updatedData.id ? { ...b, ...updatedData } : b));
  };


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bookings`);
        const json = await res.json();
        if (json.status === 'success') {
          const bookings = json.data;
          const active = bookings.filter(b => !['Delivered', 'Rejected'].includes(b.status));
          const past = bookings.filter(b => ['Delivered', 'Rejected'].includes(b.status));
          setActiveBookings(active);
          setPastBookings(past);
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Customs Clearance': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending Confirmation': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Approved': 
      case 'Accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPaymentBadge = (booking) => {
    const status = booking.paymentStatus || 'Paid';
    const method = booking.paymentMethod || 'UPI';
    const total = booking.totalAmount || (booking.cbm * 520 * 1.18 + 1650);
    const advance = booking.advanceAmount || booking.amountPaid || Math.round(total * 0.25);
    const balance = booking.balanceAmount !== undefined ? booking.balanceAmount : Math.max(0, total - advance);
    const isApproved = booking.status === 'Approved' || booking.status === 'Accepted';
    const isAdvance = (status.includes('Advance') || (booking.amountPaid > 0 && booking.amountPaid < total)) && balance > 0;

    if (isAdvance) {
      if (isApproved) {
        return (
          <button 
            onClick={() => setScannerBooking({
              ...booking,
              amountToPay: balance,
              isRemainingPayment: true
            })}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer group shadow-xs animate-pulse"
            title="Carrier approved! Click to pay remaining balance via QR"
          >
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Carrier Approved • Balance Due ₹{balance.toLocaleString()}</span>
            <Scan className="w-3 h-3 text-emerald-600" />
          </button>
        );
      }
      return (
        <button 
          onClick={() => setScannerBooking(booking)}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer group shadow-xs"
          title="25% Advance paid into escrow. Awaiting carrier review & approval."
        >
          <ShieldCheck className="w-3 h-3 text-purple-600" />
          <span>25% Advance Paid • Awaiting Approval</span>
        </button>
      );
    }

    if (status === 'In Escrow') {
      return (
        <button 
          onClick={() => setScannerBooking(booking)}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-colors cursor-pointer group shadow-xs"
          title="Click to view Escrow details & QR"
        >
          <ShieldCheck className="w-3 h-3 text-indigo-600" />
          <span>In Escrow</span>
          <QrCode className="w-3 h-3 text-indigo-500 opacity-60 group-hover:opacity-100" />
        </button>
      );
    }
    if (status === 'Pending Verification' || status === 'Unpaid') {
      return (
        <button 
          onClick={() => setScannerBooking(booking)}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 transition-colors animate-pulse cursor-pointer shadow-xs"
          title="Click to pay advance via Razorpay"
        >
          <CreditCard className="w-3 h-3 text-[#0284c7]" />
          <span>Pay Advance via Razorpay</span>
        </button>
      );
    }
    return (
      <button 
        onClick={() => setScannerBooking(booking)}
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer group shadow-xs"
        title="Payment Verified • Click to view Razorpay receipt"
      >
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        <span>Fully Paid • Razorpay</span>
      </button>
    );
  };


  const handlePrintBookingReceipt = (booking) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const cbmVal = booking.cbm || 1;
    const baseAmount = (booking.cbm || 1) * 520;
    const thcAmount = 1200;
    const sealAmount = 450;
    const subtotal = baseAmount + thcAmount + sealAmount;
    const gstVal = Math.round(subtotal * 0.18);
    const totalVal = booking.totalAmount || (subtotal + gstVal);
    const paidVal = booking.amountPaid || totalVal;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CargoShare AI - Freight Payment Tax Invoice #${booking.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; }
            th { background: #f8fafc; text-align: left; padding: 12px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
            td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
            .total { text-align: right; margin-top: 25px; font-size: 16px; font-weight: bold; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; color: #0284c7;">CargoShare AI</h1>
              <p style="margin: 4px 0; color: #64748b; font-size: 13px;">Maritime Container Space Sharing & Freight Settlement</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">GSTIN: 27AABCC1234F1Z5 • Mumbai, India</p>
            </div>
            <div style="text-align: right;">
              <span class="badge">${(booking.paymentStatus || 'PAID').toUpperCase()}</span>
              <h3 style="margin: 8px 0 2px 0;">INVOICE #${booking.id}</h3>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Date: ${booking.date || new Date().toLocaleDateString()}</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Txn ID: ${booking.transactionId || 'TXN-89421033'}</p>
            </div>
          </div>

          <div style="margin-top: 24px; display: flex; justify-content: space-between; font-size: 13px;">
            <div>
              <strong>Billed To Exporter:</strong><br/>
              ${booking.exporterName || 'Apex Exports SME'}<br/>
              Commodity: ${booking.commodity || 'General Cargo'}<br/>
              Volume: ${cbmVal} CBM ${booking.weight ? `• ${booking.weight} KG` : ''}
            </div>
            <div style="text-align: right;">
              <strong>Voyage Details:</strong><br/>
              Route: ${booking.route}<br/>
              Carrier: ${booking.carrier}<br/>
              Payment Method: ${booking.paymentMethod || 'UPI / Instant Pay'}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Volume</th>
                <th>Rate / CBM</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ocean Freight Space Allocation</td>
                <td>${cbmVal} CBM</td>
                <td>₹520</td>
                <td style="text-align: right;">₹${baseAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Terminal Handling & Port Wharfage Charges (THC)</td>
                <td>1 Shipment</td>
                <td>₹1,200</td>
                <td style="text-align: right;">₹1,200</td>
              </tr>
              <tr>
                <td>Container Security Seal & EDI Customs Filings</td>
                <td>1 Lot</td>
                <td>₹450</td>
                <td style="text-align: right;">₹450</td>
              </tr>
              <tr>
                <td>Integrated Goods & Services Tax (IGST @ 18%)</td>
                <td>18%</td>
                <td>-</td>
                <td style="text-align: right;">₹${gstVal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total Freight Charges: ₹${totalVal.toLocaleString()}<br/>
            <span style="color: #059669; font-size: 15px;">Amount Paid: ₹${paidVal.toLocaleString()}</span>
          </div>

          <div class="footer">
            Official electronically generated payment invoice powered by CargoShare AI Secure Gateway.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const renderBookings = (bookings) => {
    if (bookings.length === 0) {
      return (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-6">
            <PackageSearch className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No active bookings</h3>
          <p className="text-slate-500 max-w-md">You don't have any cargo shipments in this category yet. Search for available space to get started.</p>
        </div>
      );
    }
    
    const approvedNeedingBalance = bookings.find(b => {
      const total = b.totalAmount || (b.cbm * 520 * 1.18 + 1650);
      const advance = b.advanceAmount || b.amountPaid || Math.round(total * 0.25);
      const balance = b.balanceAmount !== undefined ? b.balanceAmount : Math.max(0, total - advance);
      const isApproved = b.status === 'Approved' || b.status === 'Accepted';
      const isAdvance = ((b.paymentStatus || '').includes('Advance') || (b.amountPaid > 0 && b.amountPaid < total)) && balance > 0;
      return isApproved && isAdvance && balance > 0;
    });

    return (
      <div className="grid gap-4">
        {approvedNeedingBalance && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 rounded-2xl border border-emerald-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                <Scan className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-950">
                  Carrier Approval Received for Booking #{approvedNeedingBalance.id}!
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  <strong>{approvedNeedingBalance.carrier}</strong> verified your cargo and approved your space. Scan the QR code to complete the <strong>75% balance of ₹{(approvedNeedingBalance.balanceAmount || Math.round(approvedNeedingBalance.totalAmount * 0.75)).toLocaleString()}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const total = approvedNeedingBalance.totalAmount || (approvedNeedingBalance.cbm * 520 * 1.18 + 1650);
                const advance = approvedNeedingBalance.advanceAmount || approvedNeedingBalance.amountPaid || Math.round(total * 0.25);
                const balance = approvedNeedingBalance.balanceAmount !== undefined ? approvedNeedingBalance.balanceAmount : Math.max(0, total - advance);
                setScannerBooking({
                  ...approvedNeedingBalance,
                  amountToPay: balance,
                  isRemainingPayment: true
                });
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Pay Remaining Balance Now</span>
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-sm">
                <tr>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Carrier</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map(booking => {
                  const total = booking.totalAmount || (booking.cbm * 520 * 1.18 + 1650);
                  const advance = booking.advanceAmount || booking.amountPaid || Math.round(total * 0.25);
                  const balance = booking.balanceAmount !== undefined ? booking.balanceAmount : Math.max(0, total - advance);
                  const isApproved = booking.status === 'Approved' || booking.status === 'Accepted';
                  const isAdvance = ((booking.paymentStatus || '').includes('Advance') || (booking.amountPaid > 0 && booking.amountPaid < total)) && balance > 0;
                  const isNeedsRemainingPayment = isApproved && isAdvance && balance > 0;

                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <span>{booking.id}</span>
                        <span className="block text-[11px] text-slate-400 font-normal mt-0.5">{booking.date}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{booking.carrier}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{booking.route}</td>
                      
                      {/* Payment Column */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-slate-900 text-sm">
                              ₹{(booking.amountPaid || advance).toLocaleString()}
                            </span>
                            {balance > 0 && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                / ₹{total.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {getPaymentBadge(booking)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                          
                          {/* QR Scanner / Pay Remaining Button */}
                          {isNeedsRemainingPayment ? (
                            <button 
                              onClick={() => setScannerBooking({
                                ...booking,
                                amountToPay: balance,
                                isRemainingPayment: true
                              })}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg animate-pulse border border-emerald-400/60 cursor-pointer"
                              title="Carrier Approved! Click to scan UPI QR and pay remaining balance"
                            >
                              <Scan className="w-4 h-4 text-white" /> 
                              <span>Pay Remaining ₹{balance.toLocaleString()}</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => setScannerBooking(booking)}
                              className="px-3 py-1.5 border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 rounded-lg transition-all font-bold text-sm flex items-center gap-1.5 shadow-xs cursor-pointer"
                              title="Open UPI Payment QR Scanner"
                            >
                              <Scan className="w-4 h-4 text-emerald-600 animate-pulse" /> 
                              <span>QR Scanner</span>
                            </button>
                          )}

                        {/* Receipt Button */}
                        <button 
                          onClick={() => setSelectedReceiptBooking(booking)}
                          className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium text-sm flex items-center gap-1.5 shadow-sm"
                          title="View Payment Invoice"
                        >
                          <Receipt className="w-4 h-4 text-emerald-600" /> Receipt
                        </button>

                        <button 
                          onClick={() => onNavigateTab && onNavigateTab('documents')} 
                          className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium text-sm flex items-center gap-1.5 shadow-sm"
                          title="View Docs & Customs"
                        >
                          <FileText className="w-4 h-4 text-slate-500" /> Docs
                        </button>

                        {activeTab === 'active' && booking.status !== 'Rejected' && (
                          <button 
                            onClick={() => onNavigateTab ? onNavigateTab('tracking', booking.id) : setTrackingModal(booking)} 
                            className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200/60 rounded-lg hover:bg-brand-100 hover:border-brand-300 transition-colors font-medium text-sm flex items-center gap-1.5 shadow-sm"
                            title="Live GPS Tracking"
                          >
                            <Map className="w-4 h-4 text-brand-600" /> Track
                          </button>
                        )}

                        <button 
                          onClick={() => setActiveChatBooking(booking)} 
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-colors font-medium text-sm flex items-center gap-1.5 shadow-sm"
                          title="Chat / Negotiate"
                        >
                          <MessageCircle className="w-4 h-4 text-indigo-600" /> Chat
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 mt-2">Manage and track your active cargo shipments, payments & freight invoices.</p>
        </div>
        <button
          onClick={() => setScannerBooking(activeBookings[0] || pastBookings[0] || { id: 'CS-1001', totalAmount: 24850, carrier: 'Maersk Line Logistics', route: 'JNPT Mumbai → Jebel Ali' })}
          className="px-5 py-2.5 bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0c2340] hover:from-[#0369a1] hover:to-[#0284c7] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs text-white">
            R
          </div>
          <span>Razorpay Freight Checkout</span>
        </button>
      </div>


      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'active' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Active Shipments ({activeBookings.length})
          {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />}
        </button>
        <button 
          onClick={() => setActiveTab('past')} 
          className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'past' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Delivered / Archive ({pastBookings.length})
          {activeTab === 'past' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading bookings and payment records...</p>
        </div>
      ) : (
        renderBookings(activeTab === 'active' ? activeBookings : pastBookings)
      )}

      {/* Payment Receipt / Invoice Modal */}
      {selectedReceiptBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Freight Tax Receipt</h3>
                  <p className="text-xs text-slate-500">Ref: #{selectedReceiptBooking.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReceiptBooking(null)}
                className="text-slate-400 hover:text-slate-900 text-2xl leading-none transition-colors p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase font-semibold">Payment Status:</span>
                  {getPaymentBadge(selectedReceiptBooking)}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase font-semibold">Payment Method:</span>
                  <span className="font-bold text-slate-800">{selectedReceiptBooking.paymentMethod || 'UPI / Instant Pay'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase font-semibold">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReceiptBooking.transactionId || 'TXN-98421033'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase font-semibold">Booking Date:</span>
                  <span className="text-slate-700">{selectedReceiptBooking.date || 'Today'}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Ocean Freight ({selectedReceiptBooking.cbm || 1} CBM)</span>
                  <span className="font-semibold text-slate-900">₹{((selectedReceiptBooking.cbm || 1) * 520).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Terminal Handling Charges (THC)</span>
                  <span className="font-semibold text-slate-900">₹1,200</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Port Inspection & EDI Seal</span>
                  <span className="font-semibold text-slate-900">₹450</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Integrated GST (18%)</span>
                  <span className="font-semibold text-slate-900">
                    ₹{Math.round(((selectedReceiptBooking.cbm || 1) * 520 + 1650) * 0.18).toLocaleString()}
                  </span>
                </div>
                {selectedReceiptBooking.advanceAmount > 0 && (
                  <div className="flex justify-between text-purple-700 font-semibold">
                    <span>25% Booking Advance Paid</span>
                    <span>₹{selectedReceiptBooking.advanceAmount.toLocaleString()}</span>
                  </div>
                )}
                {selectedReceiptBooking.balanceAmount > 0 ? (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>Remaining Balance (Due after Carrier Approval)</span>
                    <span>₹{selectedReceiptBooking.balanceAmount.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Remaining Balance</span>
                    <span>₹0 (Cleared in Full)</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Amount Paid to Date:</span>
                  <span className="text-emerald-600 font-black text-base">
                    ₹{(selectedReceiptBooking.amountPaid || ((selectedReceiptBooking.cbm || 1) * 520 * 1.18) + 1650).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => handlePrintBookingReceipt(selectedReceiptBooking)} 
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print / Save Invoice
              </button>
              <button 
                onClick={() => setSelectedReceiptBooking(null)} 
                className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900">Shipment Status: {trackingModal.id}</h3>
                <p className="text-xs text-slate-500">Carrier: {trackingModal.carrier || 'Oceanic Freight Ltd.'}</p>
              </div>
              <button onClick={() => setTrackingModal(null)} className="text-slate-400 hover:text-slate-900 text-2xl leading-none transition-colors">&times;</button>
            </div>
            
            <div className="p-8">
              {/* Visual Map Model */}
              <div className="bg-slate-100 h-[160px] relative overflow-hidden mb-8 rounded-2xl border border-slate-200">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight="0" 
                  marginWidth="0" 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent((trackingModal.route || 'Nhava Sheva Port').replace('to', 'Port'))}&t=&z=6&ie=UTF8&iwloc=&output=embed`}
                  className="absolute inset-0 w-full h-full"
                  title="Shipment Port Location"
                ></iframe>
                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-medium">
                  🚢 Maritime Port-to-Port Route
                </div>
              </div>

              <div className="relative border-l-2 border-brand-200 ml-4 space-y-8">
                
                {/* Step 1 */}
                <div className="relative pl-8">
                  <div className="absolute -left-[17px] top-1 w-8 h-8 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-600 z-10">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900">Booking Placed & Verified</h4>
                  <p className="text-sm text-slate-500">{trackingModal.id} • {trackingModal.carrier || 'Oceanic Freight Ltd.'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Commodity: {trackingModal.commodity || 'General Cargo'} ({trackingModal.cbm} CBM)</p>
                </div>

                {/* Step 2 */}
                <div className="relative pl-8">
                  <div className="absolute -left-[17px] top-1 w-8 h-8 bg-brand-100 border-2 border-brand-500 rounded-full flex items-center justify-center text-brand-600 z-10 animate-pulse">
                    <Anchor className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900">Current Status: {trackingModal.status}</h4>
                  <p className="text-sm text-slate-500">Route: {trackingModal.route}</p>
                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-brand-500 shrink-0" />
                    <div className="text-sm">
                      <span className="font-semibold text-slate-700">Voyage Departure:</span><br/>
                      <span className="text-slate-500">{trackingModal.date || 'Scheduled'} • Vessel Assigned</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative pl-8">
                  <div className="absolute -left-[17px] top-1 w-8 h-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-300 z-10">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-400">Destination Arrival</h4>
                  <p className="text-sm text-slate-400">Final Handover to Consignee</p>
                </div>

              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center flex gap-3 justify-end">
              {onNavigateTab && (
                <button 
                  onClick={() => {
                    const id = trackingModal.id;
                    setTrackingModal(null);
                    onNavigateTab('tracking', id);
                  }} 
                  className="px-5 py-2 bg-brand-600 text-white hover:bg-brand-700 rounded-xl font-medium transition-colors text-sm shadow-sm"
                >
                  Open Full Live Map
                </button>
              )}
              <button onClick={() => setTrackingModal(null)} className="px-5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget Modal */}
      {activeChatBooking && (
        <ChatWidget 
          booking={activeChatBooking}
          currentUser={{ 
            name: user?.name || user?.companyName || 'John Exporter', 
            role: 'exporter' 
          }}
          onClose={() => setActiveChatBooking(null)}
        />
      )}
      {/* Razorpay Standard Checkout Modal */}
      {scannerBooking && (
        <PaymentScannerModal
          isOpen={!!scannerBooking}
          onClose={() => setScannerBooking(null)}
          booking={scannerBooking}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

