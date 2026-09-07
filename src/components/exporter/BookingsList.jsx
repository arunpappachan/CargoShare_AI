import React, { useState, useEffect } from 'react';
import { PackageSearch, Map, Clock, FileText, CheckCircle, Navigation, Anchor, Truck } from 'lucide-react';

export default function BookingsList() {
  const [activeTab, setActiveTab] = useState('active');
  const [trackingModal, setTrackingModal] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/bookings');
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
    
    return (
      <div className="grid gap-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-sm">
              <tr>
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Carrier</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map(booking => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{booking.id}</td>
                  <td className="px-6 py-4 text-slate-600">{booking.carrier}</td>
                  <td className="px-6 py-4 text-slate-500">{booking.route}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Docs
                        </button>
                        {activeTab === 'active' && !['Pending Confirmation', 'Rejected'].includes(booking.status) && (
                          <button onClick={() => setTrackingModal(booking)} className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors font-medium text-sm flex items-center gap-2">
                            <Map className="w-4 h-4" /> Track
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 mt-2">Manage and track your active cargo shipments.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'active' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Active Shipments
          {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('past')} 
          className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'past' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Booking History
          {activeTab === 'past' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full"></div>}
        </button>
      </div>

      {/* List */}
      <div>
        {loading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div></div>
        ) : (
          activeTab === 'active' ? renderBookings(activeBookings) : renderBookings(pastBookings)
        )}
      </div>

      {/* Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Shipment Tracking</h3>
                <p className="text-sm text-slate-500">{trackingModal.id} • {trackingModal.route}</p>
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
                  src="https://maps.google.com/maps?q=15.2,65.4&t=&z=5&ie=UTF8&iwloc=&output=embed"
                  className="absolute inset-0 w-full h-full"
                  title="Shipment Location"
                ></iframe>
              </div>

              <div className="relative border-l-2 border-brand-200 ml-4 space-y-8">
                
                {/* Step 1 */}
                <div className="relative pl-8">
                  <div className="absolute -left-[17px] top-1 w-8 h-8 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-600 z-10">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900">Cargo Received</h4>
                  <p className="text-sm text-slate-500">Mumbai Port (BOM) • Oct 22, 10:45 AM</p>
                </div>

                {/* Step 2 */}
                <div className="relative pl-8">
                  <div className="absolute -left-[17px] top-1 w-8 h-8 bg-brand-100 border-2 border-brand-500 rounded-full flex items-center justify-center text-brand-600 z-10 animate-pulse">
                    <Anchor className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900">Vessel Departed</h4>
                  <p className="text-sm text-slate-500">Oceanic Explorer • Oct 24, 02:30 PM</p>
                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-brand-500" />
                    <div className="text-sm">
                      <span className="font-semibold text-slate-700">Current Location:</span><br/>
                      <span className="text-slate-500">Arabian Sea (Coordinates: 15.2, 65.4)</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative pl-8">
                  <div className="absolute -left-[17px] top-1 w-8 h-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-300 z-10">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-400">Arrival at Destination</h4>
                  <p className="text-sm text-slate-400">Dubai (DXB) • Estimated: Oct 28</p>
                </div>

              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center flex gap-3 justify-end">
              <button onClick={() => setTrackingModal(null)} className="px-6 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
