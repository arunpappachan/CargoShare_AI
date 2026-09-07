import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function BookingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings');
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
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
      if (res.ok) {
        setRequests(requests.map(req => req.id === id ? { ...req, status: action } : req));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Booking Requests</h1>
          <p className="text-slate-500 mt-2">Manage space inquiries from exporters and confirm bookings.</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-sm">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Exporter</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Space</th>
                <th className="px-6 py-4">Documents</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading requests...
                  </td>
                </tr>
              ) : requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{req.id}</td>
                  <td className="px-6 py-4 text-slate-700">{req.company || 'Exporter Corp'}</td>
                  <td className="px-6 py-4 text-slate-600">{req.route}</td>
                  <td className="px-6 py-4 font-semibold text-brand-600">{req.cbm} CBM</td>
                  <td className="px-6 py-4">
                    <button className="text-slate-500 hover:text-brand-600 flex items-center gap-1 text-sm font-medium transition-colors">
                      <FileText className="w-4 h-4" /> View Docs
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'Pending Confirmation' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleAction(req.id, 'Rejected')} className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Reject">
                          <XCircle className="w-6 h-6" />
                        </button>
                        <button onClick={() => handleAction(req.id, 'Approved')} className="p-2 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors" title="Approve">
                          <CheckCircle className="w-6 h-6" />
                        </button>
                      </div>
                    ) : (
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${req.status === 'Approved' || req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {req.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && requests.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No active booking requests.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
