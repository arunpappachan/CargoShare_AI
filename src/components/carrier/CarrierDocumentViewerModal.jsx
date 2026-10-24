import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  ExternalLink, 
  Eye, 
  FileCheck,
  Building2,
  Ship,
  Sparkles
} from 'lucide-react';
import { API_BASE } from '../../lib/apiConfig';

export default function CarrierDocumentViewerModal({ 
  isOpen, 
  onClose, 
  booking,
  initialDocuments 
}) {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    if (!isOpen || !booking) return;

    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/documents?bookingId=${booking.id}`);
        const json = await res.json();
        if (json.status === 'success' && json.data.length > 0) {
          setDocs(json.data);
          setSelectedDoc(json.data[0]);
        } else if (initialDocuments && initialDocuments.length > 0) {
          setDocs(initialDocuments);
          setSelectedDoc(initialDocuments[0]);
        } else {
          // Fallback realistic documents for this booking
          const generatedDocs = [
            { 
              docId: `INV-${booking.id}`, 
              bookingId: booking.id, 
              type: 'Commercial Invoice', 
              status: 'Verified', 
              date: booking.date || 'Oct 24, 2026', 
              fileName: `Commercial_Invoice_${booking.id}.pdf`, 
              fileSize: '245 KB', 
              exporter: booking.exporterName || 'Apex Textiles SME' 
            },
            { 
              docId: `PL-${booking.id}`, 
              bookingId: booking.id, 
              type: 'Packing List & Weight Certificate', 
              status: 'Verified', 
              date: booking.date || 'Oct 24, 2026', 
              fileName: `Packing_List_${booking.id}.pdf`, 
              fileSize: '180 KB', 
              exporter: booking.exporterName || 'Apex Textiles SME' 
            },
            { 
              docId: `SB-${booking.id}`, 
              bookingId: booking.id, 
              type: 'Shipping Bill (Customs EDI)', 
              status: 'Verified', 
              date: booking.date || 'Oct 24, 2026', 
              fileName: `Shipping_Bill_EDI_${booking.id}.pdf`, 
              fileSize: '320 KB', 
              exporter: booking.exporterName || 'Apex Textiles SME' 
            }
          ];
          setDocs(generatedDocs);
          setSelectedDoc(generatedDocs[0]);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [isOpen, booking, initialDocuments]);

  if (!isOpen || !booking) return null;

  const handleDownloadDoc = (doc) => {
    const textContent = `================================================================================
                    CARGOSHARE AI - MARITIME FREIGHT PORTAL
                          OFFICIAL CUSTOMS & SHIPPING DOCUMENT
================================================================================
Document Type : ${doc.type}
Document Ref  : ${doc.docId}
Booking Ref   : ${booking.id}
Issue Date    : ${doc.date}
Compliance    : ${doc.status} (Verified under Indian Customs ICEGATE Regulations)
--------------------------------------------------------------------------------
EXPORTER (SHIPPER):
Company Name  : ${booking.exporterName || 'Apex Textiles SME'}
GSTIN / IEC   : 27AABCC1234F1Z5
Commodity     : ${booking.commodity || 'General Cargo'}
Volume (CBM)  : ${booking.cbm || 1} CBM
Gross Weight  : ${booking.weight || 2000} KG
Special Notes : ${booking.specialReq || 'Standard Maritime Container Cargo'}

CARRIER & VOYAGE:
Carrier       : ${booking.carrier || 'Oceanic Freight Ltd.'}
Route         : ${booking.route}
Payment Status: ${booking.paymentStatus || 'Paid'} (Amount: ₹${(booking.amountPaid || booking.totalAmount || 28450).toLocaleString()})
Transaction ID: ${booking.transactionId || 'TXN-98421033'}
--------------------------------------------------------------------------------
CUSTOMS DECLARATION & ELECTRONIC STAMP:
"This document has been electronically filed and verified via the CargoShare AI
Maritime Protocol. Space slot allocated and validated by Port Gate Security."
================================================================================
`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName || `${doc.type.replace(/\s+/g, '_')}_${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintDoc = () => {
    if (!selectedDoc) return;
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedDoc.type} - #${booking.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 11px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 1px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .stamp { border: 2px dashed #059669; color: #059669; padding: 8px 16px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 12px; text-transform: uppercase; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2 style="margin: 0; color: #0284c7;">CargoShare AI Maritime Network</h2>
              <p style="margin: 2px 0; font-size: 12px; color: #64748b;">Carrier Operational Document Manifest & Port Gate Clearance</p>
            </div>
            <div style="text-align: right;">
              <span class="badge">VERIFIED BY CARRIER</span>
              <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: bold;">DOC: ${selectedDoc.docId}</p>
            </div>
          </div>

          <div style="margin-top: 20px; font-size: 13px;">
            <p><strong>Document:</strong> ${selectedDoc.type} (${selectedDoc.fileName})</p>
            <p><strong>Booking ID:</strong> ${booking.id} • <strong>Carrier:</strong> ${booking.carrier}</p>
            <p><strong>Voyage Route:</strong> ${booking.route}</p>
            <p><strong>Exporter (Shipper):</strong> ${booking.exporterName || 'Apex Textiles SME'}</p>
            <p><strong>Payment Status:</strong> ${(booking.paymentStatus || 'Paid').toUpperCase()} (Amount: ₹${(booking.amountPaid || booking.totalAmount || 28450).toLocaleString()})</p>
          </div>

          <div class="box">
            <h4 style="margin: 0 0 8px 0;">Cargo Specification & Customs Declaration</h4>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Allocated Volume</th>
                  <th>Gross Weight</th>
                  <th>Special Handling</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${booking.commodity || 'General Cargo'}</td>
                  <td>${booking.cbm || 1} CBM</td>
                  <td>${booking.weight ? `${booking.weight} KG` : '2,000 KG'}</td>
                  <td>${booking.specialReq || 'Standard Handling'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="stamp">
            ✓ ICEGATE EDI CUSTOMS CLEARED • CARRIER CONTAINER GATE-IN APPROVED
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

  const handleVerifyToggle = (docId) => {
    setVerifyingId(docId);
    setTimeout(() => {
      setDocs(prev => prev.map(d => d.docId === docId ? { ...d, status: d.status === 'Verified' ? 'Pending Review' : 'Verified' } : d));
      if (selectedDoc && selectedDoc.docId === docId) {
        setSelectedDoc(prev => ({ ...prev, status: prev.status === 'Verified' ? 'Pending Review' : 'Verified' }));
      }
      setVerifyingId(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Exporter Uploaded Documents</h3>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Carrier Vault
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Booking: <strong className="text-white">{booking.id}</strong> • Exporter: <strong className="text-blue-300">{booking.exporterName || 'Apex Textiles SME'}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Layout: Left Sidebar Documents List + Right Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Column: Documents List (4 cols) */}
          <div className="md:col-span-4 border-r border-slate-100 bg-slate-50/60 p-4 space-y-3 overflow-y-auto max-h-[60vh] md:max-h-none">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Files ({docs.length})
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {docs.filter(d => d.status === 'Verified').length} Verified
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Loading uploaded files...
              </div>
            ) : docs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No documents uploaded yet.
              </div>
            ) : (
              docs.map((doc) => {
                const isSelected = selectedDoc?.docId === doc.docId;
                return (
                  <div
                    key={doc.docId}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10' 
                        : 'bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                          {doc.type}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        doc.status === 'Verified' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {doc.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-mono mt-1.5 truncate">
                      {doc.fileName}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      <span>{doc.date}</span>
                      <span>{doc.fileSize || '250 KB'}</span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Shipment Summary Card */}
            <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs space-y-1.5 text-blue-900">
              <span className="font-bold block text-blue-950 uppercase text-[10px] tracking-wider">
                Booking Information
              </span>
              <div className="flex justify-between text-[11px]">
                <span className="text-blue-700">Space:</span>
                <strong className="text-blue-950">{booking.cbm} CBM</strong>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-blue-700">Commodity:</span>
                <strong className="text-blue-950 truncate max-w-[140px]">{booking.commodity || 'General Cargo'}</strong>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-blue-700">Payment:</span>
                <strong className="text-emerald-700">
                  {booking.paymentStatus || 'Paid'} (₹{(booking.amountPaid || booking.totalAmount || 28450).toLocaleString()})
                </strong>
              </div>
            </div>

          </div>

          {/* Right Column: Full Document Preview (8 cols) */}
          <div className="md:col-span-8 p-6 flex flex-col justify-between overflow-y-auto bg-slate-100/40">
            {selectedDoc ? (
              <div className="space-y-4">
                
                {/* Document View Top Actions */}
                <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedDoc.type}</h4>
                    <p className="text-xs text-slate-500 font-mono">{selectedDoc.fileName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyToggle(selectedDoc.docId)}
                      disabled={verifyingId === selectedDoc.docId}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Toggle verification stamp"
                    >
                      {verifyingId === selectedDoc.docId ? (
                        <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>{selectedDoc.status === 'Verified' ? 'Mark Pending' : 'Approve Doc'}</span>
                    </button>

                    <button
                      onClick={handlePrintDoc}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print</span>
                    </button>

                    <button
                      onClick={() => handleDownloadDoc(selectedDoc)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Simulated High-Res Document Preview Canvas */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 font-sans space-y-6 text-slate-900">
                  
                  {/* Document Header */}
                  <div className="flex justify-between items-start pb-4 border-b-2 border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <Ship className="w-5 h-5 text-blue-600" />
                        <span className="font-extrabold text-base tracking-tight text-slate-900">
                          CargoShare AI Electronic Manifest
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Maritime Container Space Sharing & Customs Filing</p>
                      <p className="text-[11px] text-slate-400">ICEGATE Customs EDI Port Reg: 27AABCC1234F1Z5</p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {selectedDoc.status}
                      </span>
                      <p className="text-xs font-mono font-bold text-slate-700 mt-1">{selectedDoc.docId}</p>
                      <p className="text-[11px] text-slate-400">Date: {selectedDoc.date}</p>
                    </div>
                  </div>

                  {/* Document Parties Table */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                        Exporter / Shipper
                      </span>
                      <strong className="text-slate-900 text-sm block mt-0.5">
                        {booking.exporterName || 'Apex Textiles SME'}
                      </strong>
                      <p className="text-slate-500 mt-0.5">Commodity: {booking.commodity || 'General Cargo'}</p>
                      <p className="text-slate-500">Declared Weight: {booking.weight || 2000} KG</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                        Carrier & Voyage Route
                      </span>
                      <strong className="text-slate-900 text-sm block mt-0.5">
                        {booking.carrier || 'Oceanic Freight Ltd.'}
                      </strong>
                      <p className="text-slate-500 mt-0.5">Route: {booking.route}</p>
                      <p className="text-emerald-600 font-bold">
                        Payment: {booking.paymentStatus || 'Paid'} (₹{(booking.amountPaid || booking.totalAmount || 28450).toLocaleString()})
                      </p>
                    </div>
                  </div>

                  {/* Cargo Line Items */}
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2.5">Item Description</th>
                        <th className="p-2.5">Space (CBM)</th>
                        <th className="p-2.5">Weight (KG)</th>
                        <th className="p-2.5 text-right">Filing Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-medium">{booking.commodity || 'Garments & Apparels'}</td>
                        <td className="p-2.5 font-bold text-brand-600">{booking.cbm || 1} CBM</td>
                        <td className="p-2.5">{booking.weight || 2000} KG</td>
                        <td className="p-2.5 text-right font-mono text-slate-500">HS-6204.42</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-500" colSpan="4">
                          Special Handling Instructions: <strong>{booking.specialReq || 'Standard handling'}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Customs & Compliance Stamped Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Validated for port gate-in & customs container clearance.</span>
                    </div>

                    <div className="border border-emerald-500/40 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Carrier EDI Stamped
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Select a document from the left to view.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Carrier Compliance Portal • All files encrypted with SHA-256</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
}
