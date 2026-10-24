import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Loader2, MessageCircle, DollarSign, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import ChatWidget from '../ChatWidget';
import CarrierDocumentViewerModal from './CarrierDocumentViewerModal';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../lib/apiConfig';

export default function BookingRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [selectedDocBooking, setSelectedDocBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings`);
      const data = await res.json();
      if (data.status === 'success') {
        setRequests(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
      if (res.ok) {
        setRequests(requests.map(req => req.id === id ? { ...req, status: action } : req));
      }
    } catch (err) {
      console.error(err);
      setRequests(requests.map(req => req.id === id ? { ...req, status: action } : req));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Booking Requests</h1>
          <p className="text-slate-500 mt-2">
            Review exporter space inquiries, verify uploaded documents, and approve bookings for final balance settlement.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-sm">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Exporter</th>
                <th className="px-6 py-4">Route & Cargo</th>
                <th className="px-6 py-4">Space</th>
                <th className="px-6 py-4">Payment & Advance</th>
                <th className="px-6 py-4">Documents</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading requests...
                  </td>
                </tr>
              ) : requests.map(req => {
                const total = req.totalAmount || (req.cbm * 520 * 1.18 + 1650);
                const advance = req.advanceAmount || req.amountPaid || Math.round(total * 0.25);
                const isFullyPaid = req.paymentStatus === 'Fully Paid' || req.paymentStatus === 'Paid' || req.amountPaid >= total;
                const isApproved = req.status === 'Approved' || req.status === 'Accepted';

                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <span>{req.id}</span>
                      <span className="block text-[11px] text-slate-400 font-normal mt-0.5">{req.date || 'Today'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <strong className="block text-slate-900 font-bold">{req.exporterName || req.company || 'Apex Textiles SME'}</strong>
                      <span className="text-xs text-slate-500">{req.commodity || 'General Cargo'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs font-medium max-w-xs truncate">{req.route}</td>
                    <td className="px-6 py-4 font-semibold text-brand-600 text-sm">{req.cbm} CBM</td>
                    
                    {/* Payment Column */}
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">
                          ₹{advance.toLocaleString()}
                        </span>
                        {isFullyPaid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Fully Paid (₹{total.toLocaleString()})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            25% Advance Paid
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Documents Column */}
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedDocBooking(req)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        title="Click to view and preview uploaded documents"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> View Docs
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {req.status === 'Pending Confirmation' ? (
                        <div className="flex justify-end gap-2 items-center">
                          <button onClick={() => setActiveChatBooking(req)} className="p-2 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors" title="Chat/Negotiate">
                            <MessageCircle className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleAction(req.id, 'Rejected')} className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Reject">
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleAction(req.id, 'Approved')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors" title="Approve booking so exporter can pay remaining balance">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2 items-center">
                          <button onClick={() => setActiveChatBooking(req)} className="p-2 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors" title="Chat/Negotiate">
                            <MessageCircle className="w-5 h-5" />
                          </button>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${isApproved ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                            {req.status}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!loading && requests.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">No active booking requests.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chat Widget Modal */}
      {activeChatBooking && (
        <ChatWidget 
          booking={activeChatBooking}
          currentUser={{ 
            name: user?.name || user?.companyName || 'Captain Maersk', 
            role: 'carrier' 
          }}
          onClose={() => setActiveChatBooking(null)}
        />
      )}

      {/* Exporter Documents Viewer Modal */}
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

