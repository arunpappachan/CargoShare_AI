import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Package, 
  ArrowRight, 
  ArrowLeft,
  UploadCloud, 
  CheckCircle, 
  Ship, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Landmark, 
  Printer, 
  Download, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  Receipt,
  AlertCircle,
  Scan,
  Copy,
  Check,
  Clock,
  Smartphone
} from 'lucide-react';
import PaymentScannerModal from '../common/PaymentScannerModal';
import { API_BASE } from '../../lib/apiConfig';
import { useAuth } from '../../context/AuthContext';
import { syncBookingToAdmin } from '../../lib/syncAdminData';

export default function SearchSpace() {
  const { user } = useAuth();
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingModal, setBookingModal] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Cargo, 2: Payment, 3: Confirmed
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [cbm, setCbm] = useState('');
  
  // Cargo Details Form State
  const [commodity, setCommodity] = useState('');
  const [weight, setWeight] = useState('');
  const [specialReq, setSpecialReq] = useState('');
  const [documentName, setDocumentName] = useState('');

  // Payment Options Form State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'escrow' | 'wire' | 'advance'
  const [upiId, setUpiId] = useState('exporter@okhdfcbank');
  const [showUpiQr, setShowUpiQr] = useState(true);
  const [cardNumber, setCardNumber] = useState('4532 8921 7843 9021');

  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('382');
  const [cardName, setCardName] = useState('Global Exports SME');
  const [wireUtr, setWireUtr] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const portsMap = {
    "innsa": "Mumbai (Nhava Sheva/JNPT) - INNSA",
    "inmun": "Mundra - INMUN",
    "inmaa": "Chennai - INMAA",
    "inccu": "Kolkata - INCCU",
    "incok": "Cochin - INCOK",
    "invtz": "Visakhapatnam - INVTZ",
    "inixy": "Kandla - INIXY",
    "intut": "Tuticorin - INTUT",
    "inenr": "Ennore - INENR",
    "inprt": "Paradip - INPRT",
    "inhal": "Haldia - INHAL",
    "inmrm": "Mormugao - INMRM",
    "innml": "Mangalore - INNML"
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentName(e.target.files[0].name);
    }
  };

  // Open booking modal
  const handleOpenBooking = (result) => {
    setBookingModal(result);
    setBookingStep(1);
    setCommodity('');
    setWeight('');
    setSpecialReq('');
    setDocumentName('');
    setConfirmedBooking(null);
    setWireUtr('');
  };

  // Step 1: Proceed to Payment
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!commodity.trim() || !weight) {
      alert('Please enter commodity type and total weight.');
      return;
    }
    setBookingStep(2);
  };

  // Step 2: Process Payment & Confirm Booking
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    const bookedCbm = Number(cbm) || 1;
    const baseRate = bookingModal ? bookingModal.price : 520;
    const freightTotal = baseRate * bookedCbm;
    const thcCharges = 1200;
    const securityInsurance = 450;
    const subtotal = freightTotal + thcCharges + securityInsurance;
    const gstAmount = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gstAmount;

    // Two-stage booking policy: 25% Advance to lock slot, 75% balance payable after Carrier Approves
    const advanceAmount = Math.round(grandTotal * 0.25);
    const balanceAmount = grandTotal - advanceAmount;
    const amountToPayNow = advanceAmount; // 25% Advance required to reserve slot

    const paymentMethodNames = {
      upi: 'UPI QR Scanner (25% Advance)',
      card: 'Credit/Debit Card (25% Advance)',
      escrow: 'CargoShare Smart Escrow (25% Advance)',
      wire: 'B2B Bank Wire (25% Advance)',
      advance: '25% Slot Advance Deposit'
    };

    const generatedTxnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

    try {
      // Simulate real-time payment gateway processing delay
      await new Promise(resolve => setTimeout(resolve, 900));

      const exporterName = user?.company || user?.name || 'Apex Exports SME';
      const exporterEmail = user?.email || `logistics@${exporterName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      const carrierVessel = bookingModal.vessel || 'MSC Oscar';

      const payload = {
        spaceId: bookingModal.id,
        route: `${portsMap[bookingModal.origin] || bookingModal.origin} → ${portsMap[bookingModal.dest] || bookingModal.dest}`,
        carrier: bookingModal.carrier,
        vessel: carrierVessel,
        cbm: bookedCbm,
        commodity: commodity || 'General Cargo',
        weight: Number(weight) || 2000,
        specialReq: specialReq || 'Standard handling',
        exporterName: exporterName,
        email: exporterEmail,
        status: 'Pending Confirmation',
        paymentStatus: 'Advance Paid (25%)',
        paymentMethod: paymentMethodNames[paymentMethod] || 'UPI Advance (25%)',
        amountPaid: advanceAmount,
        advanceAmount: advanceAmount,
        balanceAmount: balanceAmount,
        totalAmount: grandTotal,
        documentName: documentName || 'Commercial_Invoice.pdf',
        documents: [documentName || 'Commercial_Invoice.pdf', 'Packing_List.pdf', 'Shipping_Bill_EDI.pdf'],
        transactionId: wireUtr.trim() ? `UTR-${wireUtr.trim()}` : generatedTxnId
      };

      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      const savedData = (json && json.data) ? json.data : { ...payload, id: `CS-${Date.now().toString().slice(-4)}` };
      
      // Automatically store details of exporter, carrier, booking, and commission to Admin Dashboard!
      syncBookingToAdmin(savedData);

      setConfirmedBooking(savedData);
      setBookingStep(3);
    } catch (err) {
      console.warn('Booking post error, using local fallback:', err);
      const fallbackConfirmed = {
        id: `CS-${Date.now().toString().slice(-4)}`,
        spaceId: bookingModal.id,
        route: `${portsMap[bookingModal.origin] || bookingModal.origin} → ${portsMap[bookingModal.dest] || bookingModal.dest}`,
        carrier: bookingModal.carrier,
        vessel: bookingModal.vessel || 'MSC Oscar',
        cbm: bookedCbm,
        commodity: commodity || 'General Cargo',
        weight: Number(weight) || 2000,
        specialReq: specialReq || 'Standard handling',
        exporterName: user?.company || user?.name || 'Apex Exports SME',
        email: user?.email || 'logistics@apexexports.com',
        status: 'Pending Confirmation',
        paymentStatus: 'Advance Paid (25%)',
        paymentMethod: paymentMethodNames[paymentMethod] || 'UPI Advance (25%)',
        amountPaid: advanceAmount,
        advanceAmount: advanceAmount,
        balanceAmount: balanceAmount,
        totalAmount: grandTotal,
        documentName: documentName || 'Commercial_Invoice.pdf',
        documents: [documentName || 'Commercial_Invoice.pdf', 'Packing_List.pdf', 'Shipping_Bill_EDI.pdf'],
        transactionId: generatedTxnId
      };
      
      // Automatically store details of exporter, carrier, booking, and commission to Admin Dashboard!
      syncBookingToAdmin(fallbackConfirmed);

      setConfirmedBooking(fallbackConfirmed);
      setBookingStep(3);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Generate Printable Tax Invoice

  const handlePrintInvoice = () => {
    if (!confirmedBooking) return;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const bookedCbm = confirmedBooking.cbm || 1;
    const baseRate = bookingModal ? bookingModal.price : 520;
    const freightTotal = baseRate * bookedCbm;
    const grandTotal = confirmedBooking.totalAmount || (freightTotal + 1650 + Math.round((freightTotal + 1650) * 0.18));
    const amountPaid = confirmedBooking.amountPaid || grandTotal;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CargoShare AI - Freight Payment Tax Invoice #${confirmedBooking.id}</title>
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
              <span class="badge">${confirmedBooking.paymentStatus.toUpperCase()}</span>
              <h3 style="margin: 8px 0 2px 0;">INVOICE #${confirmedBooking.id}</h3>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Date: ${new Date().toLocaleDateString()}</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Transaction ID: ${confirmedBooking.transactionId}</p>
            </div>
          </div>

          <div style="margin-top: 24px; display: flex; justify-content: space-between; font-size: 13px;">
            <div>
              <strong>Billed To Exporter:</strong><br/>
              Apex Exports SME<br/>
              Commodity: ${confirmedBooking.commodity || 'General Cargo'}<br/>
              Weight: ${confirmedBooking.weight || 2000} KG
            </div>
            <div style="text-align: right;">
              <strong>Voyage Details:</strong><br/>
              Route: ${confirmedBooking.route}<br/>
              Carrier: ${confirmedBooking.carrier}<br/>
              Payment Method: ${confirmedBooking.paymentMethod}
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
                <td>${bookedCbm} CBM</td>
                <td>₹${baseRate}</td>
                <td style="text-align: right;">₹${freightTotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Terminal Handling & Port Wharfage Charges (THC)</td>
                <td>1 Shipment</td>
                <td>₹1,200</td>
                <td style="text-align: right;">₹1,200</td>
              </tr>
              <tr>
                <td>Container Inspection & EDI Documentation</td>
                <td>1 Lot</td>
                <td>₹450</td>
                <td style="text-align: right;">₹450</td>
              </tr>
              <tr>
                <td>Integrated Goods & Services Tax (IGST @ 18%)</td>
                <td>18%</td>
                <td>-</td>
                <td style="text-align: right;">₹${Math.round((freightTotal + 1650) * 0.18).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total Freight Charges: ₹${grandTotal.toLocaleString()}<br/>
            <span style="color: #059669; font-size: 15px;">Amount Paid: ₹${amountPaid.toLocaleString()}</span>
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

  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!origin || !destination || !date || !cbm) {
      setError('Please fill in all fields (Origin, Destination, Date, and CBM) to search.');
      return;
    }
    if (origin === destination) {
      setError('Origin and Destination ports cannot be the same.');
      return;
    }
    setError('');
    setIsSearching(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/spaces?origin=${origin}&dest=${destination}&date=${date}`);
      const data = await res.json();
      if (data.status === 'success') {
        setSearchResults(data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Unable to fetch spaces.');
    } finally {
      setIsSearching(false);
      setSearched(true);
    }
  };

  // Pricing calculations
  const bookedCbm = Number(cbm) || 1;
  const baseRate = bookingModal ? bookingModal.price : 520;
  const freightTotal = baseRate * bookedCbm;
  const thcCharges = 1200;
  const securityInsurance = 450;
  const subtotalBeforeTax = freightTotal + thcCharges + securityInsurance;
  const gstAmount = Math.round(subtotalBeforeTax * 0.18);
  const grandTotal = subtotalBeforeTax + gstAmount;

  const advanceAmount = Math.round(grandTotal * 0.25);
  const balanceAmount = grandTotal - advanceAmount;
  const amountToPayNow = advanceAmount; // Initial slot reservation is always the 25% Advance


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Search Available Space</h1>
        <p className="text-slate-500 mt-2">Find the perfect container space for your cargo with instant secure checkout.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <select 
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none appearance-none cursor-pointer">
              <option value="">Origin Port</option>
              <option value="innsa">Mumbai (Nhava Sheva/JNPT) - INNSA</option>
              <option value="inmun">Mundra - INMUN</option>
              <option value="inmaa">Chennai - INMAA</option>
              <option value="inccu">Kolkata - INCCU</option>
              <option value="incok">Cochin - INCOK</option>
              <option value="invtz">Visakhapatnam - INVTZ</option>
              <option value="inixy">Kandla - INIXY</option>
              <option value="intut">Tuticorin - INTUT</option>
              <option value="inenr">Ennore - INENR</option>
              <option value="inprt">Paradip - INPRT</option>
              <option value="inhal">Haldia - INHAL</option>
              <option value="inmrm">Mormugao - INMRM</option>
              <option value="innml">Mangalore - INNML</option>
            </select>
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <select 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none appearance-none cursor-pointer">
              <option value="">Destination Port</option>
              <option value="innsa">Mumbai (Nhava Sheva/JNPT) - INNSA</option>
              <option value="inmun">Mundra - INMUN</option>
              <option value="inmaa">Chennai - INMAA</option>
              <option value="inccu">Kolkata - INCCU</option>
              <option value="incok">Cochin - INCOK</option>
              <option value="invtz">Visakhapatnam - INVTZ</option>
              <option value="inixy">Kandla - INIXY</option>
              <option value="intut">Tuticorin - INTUT</option>
              <option value="inenr">Ennore - INENR</option>
              <option value="inprt">Paradip - INPRT</option>
              <option value="inhal">Haldia - INHAL</option>
              <option value="inmrm">Mormugao - INMRM</option>
              <option value="innml">Mangalore - INNML</option>
            </select>
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input type="date" min={new Date().toISOString().split("T")[0]} value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-slate-600" />
          </div>
          <div className="relative flex gap-2">
            <div className="relative flex-1 min-w-[120px]">
              <Package className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input type="number" placeholder="CBM" value={cbm} onChange={(e) => setCbm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className={`flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 min-w-[120px] ${isSearching ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-700 hover:-translate-y-0.5'}`}
            >
              {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Search className="w-5 h-5" /> Search</>}
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>

      {searched && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Available Container Spaces</h2>
            <span className="text-slate-500 text-sm">{searchResults.length} spaces matching your criteria</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div key={result.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{result.id}</span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2">{result.carrier}</h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Instant Booking
                    </span>
                  </div>

                  <div className="space-y-3 my-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-medium text-slate-700 truncate">{portsMap[result.origin] || result.origin}</span>
                    </div>
                    <div className="border-l-2 border-dashed border-slate-200 ml-1.5 h-4"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                      <span className="text-sm font-medium text-slate-700 truncate">{portsMap[result.dest] || result.dest}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500">Departure</span>
                      <span className="font-semibold text-slate-700">{result.date}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-500">Available</span>
                      <span className="font-semibold text-slate-700">{result.space} CBM</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Price per CBM</p>
                      <p className="text-xl font-bold text-slate-900">₹{result.price}</p>
                    </div>
                    <button onClick={() => handleOpenBooking(result)} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2">
                      Book Space <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500">
                <Ship className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-700">No available containers found for this route on this date.</p>
                <p className="mt-1">Try modifying your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking & Payment Modal */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col">
            
            {/* Modal Stepper Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                
                {/* Step 1 Pill */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  bookingStep === 1 
                    ? 'bg-brand-600 text-white shadow-sm' 
                    : bookingStep > 1 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  <span>{bookingStep > 1 ? '✓' : '1'}</span>
                  <span className="hidden sm:inline">Cargo Details</span>
                </div>

                <span className="text-slate-300">➔</span>

                {/* Step 2 Pill */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  bookingStep === 2 
                    ? 'bg-brand-600 text-white shadow-sm' 
                    : bookingStep > 2 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  <span>{bookingStep > 2 ? '✓' : '2'}</span>
                  <span>Payment Options</span>
                </div>

                <span className="text-slate-300">➔</span>

                {/* Step 3 Pill */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  bookingStep === 3 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  <span>3</span>
                  <span className="hidden sm:inline">Receipt</span>
                </div>

              </div>

              <button 
                onClick={() => setBookingModal(null)} 
                className="text-slate-400 hover:text-slate-900 text-2xl leading-none transition-colors p-1"
              >
                &times;
              </button>
            </div>

            {/* Modal Body Container with Scroll */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1">

              {/* ----------------- STEP 1: CARGO DETAILS ----------------- */}
              {bookingStep === 1 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Cargo & Packaging Details</h2>
                    <p className="text-slate-500 text-sm mt-1">
                      Booking reference for container {bookingModal.id} • {bookingModal.carrier}
                    </p>
                  </div>

                  <form onSubmit={handleProceedToPayment} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Commodity Type *
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. Textiles, Auto Parts, Spices" 
                          value={commodity}
                          onChange={(e) => setCommodity(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm" 
                          required 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Total Weight (KG) *
                        </label>
                        <input 
                          type="number" 
                          placeholder="2500" 
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Special Stowage / Handling Requirements
                      </label>
                      <textarea 
                        placeholder="Temperature controlled (20°C), bottom-tier stowage, fragile electronics handling..." 
                        value={specialReq}
                        onChange={(e) => setSpecialReq(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm h-20 resize-none"
                      ></textarea>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Customs Documents (Commercial Invoice, Packing List)
                      </label>
                      <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 hover:border-brand-300 transition-colors cursor-pointer group block relative">
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                        <UploadCloud className={`w-8 h-8 mx-auto mb-2 transition-colors ${documentName ? 'text-emerald-500' : 'text-slate-400 group-hover:text-brand-500'}`} />
                        <p className={`text-sm font-medium ${documentName ? 'text-emerald-600' : 'text-slate-600 group-hover:text-slate-900'}`}>
                          {documentName ? `Uploaded: ${documentName}` : 'Upload Commercial Invoice / Packing List (Optional)'}
                        </p>
                        {!documentName && <p className="text-xs text-slate-400 mt-0.5">PDF, DOCX, or PNG (up to 15MB)</p>}
                      </label>
                    </div>

                    {/* Fare Summary Strip */}
                    <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-slate-100">
                      <div>
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Estimated Base Freight</span>
                        <span className="text-sm text-slate-700 font-medium">
                          {bookedCbm} CBM @ ₹{bookingModal.price}/CBM
                        </span>
                      </div>
                      <span className="text-xl font-black text-slate-900">
                        ₹{freightTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => setBookingModal(null)} 
                        className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center gap-2 text-sm shadow-sm"
                      >
                        Proceed to Payment Options <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ----------------- STEP 2: PAYMENT & CHECKOUT OPTIONS ----------------- */}
              {bookingStep === 2 && (
                <div>
                  <div className="mb-6 flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Payment & Settlement Options</h2>
                      <p className="text-slate-500 text-sm mt-0.5">Select your preferred payment method to secure space.</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Protected
                    </span>
                  </div>

                  <form onSubmit={handleProcessPayment} className="space-y-6">

                    {/* Detailed Fare Breakdown Card */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Ocean Freight ({bookedCbm} CBM × ₹{baseRate})</span>
                        <span className="font-semibold text-slate-800">₹{freightTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Terminal Handling Charges (THC)</span>
                        <span className="font-semibold text-slate-800">₹{thcCharges.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Container Security Seal & EDI Customs Filings</span>
                        <span className="font-semibold text-slate-800">₹{securityInsurance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Integrated GST (18%)</span>
                        <span className="font-semibold text-slate-800">₹{gstAmount.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
                        <span>Total Cargo Freight Amount:</span>
                        <span className="text-base text-brand-600 font-black">₹{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Payment Options Grid / Selector */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                        Choose Payment Method
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* Option 1: UPI */}
                        <div 
                          onClick={() => setPaymentMethod('upi')}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            paymentMethod === 'upi'
                              ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                UPI
                              </div>
                              <span className="font-bold text-slate-900 text-sm">UPI / QR Code</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              0% Fee
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                        </div>

                        {/* Option 2: Cards */}
                        <div 
                          onClick={() => setPaymentMethod('card')}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            paymentMethod === 'card'
                              ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                <CreditCard className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-900 text-sm">Credit / Debit Card</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              Visa / MC / RuPay
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">Razorpay / Stripe Gateway Integration</p>
                        </div>

                        {/* Option 3: Smart Escrow */}
                        <div 
                          onClick={() => setPaymentMethod('escrow')}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            paymentMethod === 'escrow'
                              ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-900 text-sm">CargoShare Escrow</span>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                              Protected
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">Released only upon port loading confirmation</p>
                        </div>

                        {/* Option 4: Bank Wire */}
                        <div 
                          onClick={() => setPaymentMethod('wire')}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            paymentMethod === 'wire'
                              ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                                <Landmark className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-900 text-sm">B2B Bank Wire</span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              RTGS / NEFT
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">Direct corporate bank account transfer</p>
                        </div>

                        {/* Option 5: 25% Advance */}
                        <div 
                          onClick={() => setPaymentMethod('advance')}
                          className={`col-span-1 sm:col-span-2 p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            paymentMethod === 'advance'
                              ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                                25%
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 text-sm">Milestone Payment (25% Slot Lock)</span>
                                <p className="text-[11px] text-slate-500">Pay ₹{advanceAmount.toLocaleString()} now • Balance ₹{balanceAmount.toLocaleString()} upon vessel gate-in</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                              Pay ₹{advanceAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Method Details Panel */}
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                      
                      {/* UPI Details & Dynamic QR Scanner */}
                      {paymentMethod === 'upi' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                              <Scan className="w-4 h-4 text-emerald-600 animate-pulse" />
                              UPI Payment QR Scanner
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setIsScannerModalOpen(true)}
                                className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Scan className="w-3.5 h-3.5" /> Fullscreen Scanner
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowUpiQr(!showUpiQr)}
                                className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                {showUpiQr ? 'Enter VPA ID' : 'Show QR Scanner'}
                              </button>
                            </div>
                          </div>

                          {showUpiQr ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
                              
                              {/* QR Card with Laser Scanning Beam */}
                              <div className="relative mx-auto w-52 h-52 bg-slate-950 p-3 rounded-2xl shadow-lg border-2 border-slate-900 flex flex-col items-center justify-center overflow-hidden">
                                
                                {/* Viewfinder Corner Brackets */}
                                <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-md pointer-events-none z-20"></div>
                                <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-md pointer-events-none z-20"></div>
                                <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-md pointer-events-none z-20"></div>
                                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-emerald-400 rounded-br-md pointer-events-none z-20"></div>

                                {/* Animated Laser Scan Line */}
                                <div className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-scan-laser z-20 pointer-events-none"></div>

                                {/* High-Res Scannable QR Code */}
                                <div className="bg-white p-1.5 rounded-xl w-full h-full flex items-center justify-center z-10 shadow-inner">
                                  <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(
                                      `upi://pay?pa=cargoshare.escrow@hdfcbank&pn=CargoShare%20AI&am=${amountToPayNow}&cu=INR&tn=Slot%20Booking%20${bookingModal.id}`
                                    )}`}
                                    alt="UPI QR Code"
                                    className="w-full h-full object-contain select-none"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div style={{ display: 'none' }} className="w-full h-full flex-col items-center justify-center bg-slate-50 text-slate-800">
                                    <QrCode className="w-24 h-24 text-slate-800" />
                                    <span className="text-[9px] font-bold text-slate-500 mt-1">cargoshare.escrow@hdfcbank</span>
                                  </div>
                                </div>

                                <div className="absolute bottom-1 z-20 bg-slate-900/90 px-2 py-0.5 rounded-full text-[8px] font-bold text-emerald-300 border border-emerald-500/20">
                                  SCAN WITH ANY UPI APP
                                </div>
                              </div>

                              {/* Helper Text and Apps */}
                              <div className="text-center space-y-1">
                                <p className="text-xs text-slate-700 font-bold">
                                  Scan to pay <span className="text-emerald-600 font-black">₹{amountToPayNow.toLocaleString()}</span> directly from your phone
                                </p>
                                <div className="flex flex-wrap justify-center items-center gap-1.5 pt-1">
                                  {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'CRED'].map(app => (
                                    <span key={app} className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-600 border border-slate-200">
                                      {app}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Copy VPA & Quick Verification Buttons */}
                              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Smartphone className="w-3.5 h-3.5 text-brand-600" />
                                  <span className="font-mono text-slate-700 font-semibold text-[11px]">cargoshare.escrow@hdfcbank</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText('cargoshare.escrow@hdfcbank');
                                    setCopiedVpa(true);
                                    setTimeout(() => setCopiedVpa(false), 2000);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  {copiedVpa ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                  {copiedVpa ? 'Copied' : 'Copy'}
                                </button>
                              </div>

                            </div>
                          ) : (
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-700 uppercase block">Enter UPI ID / VPA</label>
                              <input 
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="e.g. 9876543210@paytm or exporter@okhdfcbank"
                                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                required
                              />
                            </div>
                          )}
                        </div>
                      )}


                      {/* Card Details */}
                      {paymentMethod === 'card' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Cardholder Name</label>
                            <input 
                              type="text"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              placeholder="Apex Exports SME"
                              className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Card Number</label>
                              <input 
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="4532 8921 7843 9021"
                                className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Expiry & CVV</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                  placeholder="MM/YY"
                                  className="w-1/2 px-2 py-2 bg-white rounded-xl border border-slate-200 text-sm text-center focus:ring-2 focus:ring-brand-500 outline-none"
                                  required
                                />
                                <input 
                                  type="password"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value)}
                                  placeholder="CVV"
                                  maxLength={4}
                                  className="w-1/2 px-2 py-2 bg-white rounded-xl border border-slate-200 text-sm text-center focus:ring-2 focus:ring-brand-500 outline-none"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Escrow Details */}
                      {paymentMethod === 'escrow' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> CargoShare Smart Escrow Protection Guarantee
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Your payment of <strong>₹{grandTotal.toLocaleString()}</strong> is safely placed in an RBI-compliant Escrow Trustee Account. The carrier is only paid once your container gates into the origin port and customs EDI verification is validated.
                          </p>
                        </div>
                      )}

                      {/* Bank Wire Details */}
                      {paymentMethod === 'wire' && (
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                            <p className="font-bold text-slate-900">CargoShare Freight Escrow Beneficiary:</p>
                            <p className="text-slate-600">Bank: <strong>HDFC Bank Ltd (Fort Branch, Mumbai)</strong></p>
                            <p className="text-slate-600">Account No: <strong>50200084920194</strong> • IFSC: <strong>HDFC0000060</strong></p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                              Bank Transaction / UTR Reference Number *
                            </label>
                            <input 
                              type="text"
                              value={wireUtr}
                              onChange={(e) => setWireUtr(e.target.value)}
                              placeholder="e.g. HDFC2026102488392"
                              className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Advance Payment Details */}
                      {paymentMethod === 'advance' && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600">Immediate Slot Reservation (25%):</span>
                            <span className="font-bold text-slate-900">₹{advanceAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600">Remaining Balance (Payable at Port Gate-in):</span>
                            <span className="font-bold text-slate-500">₹{balanceAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => setBookingStep(1)} 
                        className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Cargo
                      </button>

                      <button 
                        type="submit" 
                        disabled={isProcessingPayment}
                        className={`px-8 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 text-sm ${
                          isProcessingPayment ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-700 hover:-translate-y-0.5'
                        }`}
                      >
                        {isProcessingPayment ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Pay ₹{amountToPayNow.toLocaleString()} & Lock Slot
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* ----------------- STEP 3: CONFIRMATION & RECEIPT ----------------- */}
              {bookingStep === 3 && confirmedBooking && (
                <div className="py-4 text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                      Payment Received • Slot Confirmed
                    </span>
                    <h3 className="text-3xl font-black text-slate-900">Booking Confirmed!</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                      Container space has been secured on <strong>{confirmedBooking.carrier}</strong>. Your transaction has been cleared and logged.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-3 max-w-lg mx-auto text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-500 text-xs font-semibold uppercase">Booking Ref:</span>
                      <span className="font-black text-brand-600">{confirmedBooking.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-semibold uppercase">Transaction ID:</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">{confirmedBooking.transactionId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-semibold uppercase">Payment Method:</span>
                      <span className="font-semibold text-slate-800">{confirmedBooking.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-semibold uppercase">Payment Status:</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        {confirmedBooking.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-slate-900 font-bold">Amount Paid:</span>
                      <span className="font-black text-lg text-emerald-600">
                        ₹{(confirmedBooking.amountPaid || grandTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={handlePrintInvoice}
                      className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-all text-sm flex items-center gap-2 shadow-sm"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      Print Tax Invoice
                    </button>

                    <button 
                      type="button"
                      onClick={() => setBookingModal(null)}
                      className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all text-sm shadow-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Fullscreen UPI Payment Scanner Modal */}
      {isScannerModalOpen && (
        <PaymentScannerModal
          isOpen={isScannerModalOpen}
          onClose={() => setIsScannerModalOpen(false)}
          booking={{
            id: bookingModal ? `CS-${bookingModal.id}` : 'CS-NEW',
            totalAmount: amountToPayNow,
            amountPaid: amountToPayNow,
            carrier: bookingModal?.carrier || 'AI Assigned Carrier',
            route: bookingModal ? `${portsMap[bookingModal.origin] || bookingModal.origin} → ${portsMap[bookingModal.dest] || bookingModal.dest}` : 'Ocean Route'
          }}
          onPaymentSuccess={(confirmedData) => {
            setIsScannerModalOpen(false);
            setConfirmedBooking(confirmedData);
            setBookingStep(3);
          }}
        />
      )}
    </div>
  );
}

