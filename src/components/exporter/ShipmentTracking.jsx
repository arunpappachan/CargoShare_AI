import React, { useState } from 'react';
import { Map, Search, MapPin, Truck, Anchor, CheckCircle, Navigation, XCircle } from 'lucide-react';

export default function ShipmentTracking() {
  const [trackingId, setTrackingId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId) return;
    
    setIsSearching(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/bookings');
      const data = await res.json();
      
      if (data.status === 'success') {
        const booking = data.data.find(b => b.id.toUpperCase() === trackingId.toUpperCase());
        
        if (booking) {
          // Calculate a mock ETA based on the booking date (add 7 days for demo purposes)
          const departureDate = new Date(booking.date || booking.createdAt);
          const etaDate = new Date(departureDate);
          etaDate.setDate(etaDate.getDate() + 7);
          
          let s1 = 'completed';
          let s2 = 'pending';
          let s3 = 'pending';
          let s4 = 'pending';

          switch(booking.status) {
            case 'Pending Confirmation':
              s2 = 'current';
              break;
            case 'Accepted':
              s2 = 'completed';
              s3 = 'current';
              break;
            case 'In Transit':
              s2 = 'completed';
              s3 = 'completed';
              s4 = 'current';
              break;
            case 'Delivered':
              s2 = 'completed';
              s3 = 'completed';
              s4 = 'completed';
              break;
            case 'Rejected':
              s2 = 'rejected';
              break;
          }

          setTrackingData({
            id: booking.id,
            route: booking.route,
            status: booking.status,
            carrier: booking.carrier,
            lastUpdated: 'Just now',
            currentLocation: 'Arabian Sea (15.2, 65.4)', // Static for demo
            eta: etaDate.toISOString().split('T')[0],
            coordinates: { lat: 15.2, lng: 65.4 }, // Static for demo
            vessel: 'Oceanic Explorer', // Static for demo
            departure: booking.date || departureDate.toISOString().split('T')[0],
            updates: [
              { status: s1, event: 'Booking Placed', location: 'System', time: new Date(booking.createdAt).toLocaleString() },
              { status: s2, event: 'Carrier Confirmation', location: 'System', time: s2 === 'pending' ? 'TBD' : (s2 === 'current' ? 'Pending' : 'Confirmed'), details: `Current Status: ${booking.status}` },
              { status: s3, event: 'Vessel Departed', location: 'Oceanic Explorer', time: s3 === 'pending' ? 'TBD' : (s3 === 'current' ? 'In Transit' : 'Departed'), details: s3 === 'pending' ? 'Awaiting departure' : 'Vessel is on the way' },
              { status: s4, event: 'Arrival at Destination', location: 'Destination Port', time: s4 === 'completed' ? 'Delivered' : `Estimated: ${etaDate.toISOString().split('T')[0]}` }
            ]
          });
        } else {
          setError('Tracking number not found.');
          setTrackingData(null);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Unable to track shipment.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Track Your Cargo</h1>
        <p className="text-slate-500 mt-2">Enter your booking ID to see real-time location and status.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <form onSubmit={handleTrack} className="flex gap-4 max-w-2xl mx-auto relative">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="e.g. CS-9921"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-lg text-slate-700 placeholder-slate-400 transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className={`px-8 py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center min-w-[140px] ${isSearching ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-700 hover:-translate-y-0.5'}`}
          >
            {isSearching ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : 'Track'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>

      {trackingData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-100 h-[400px] rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative group">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0" 
                src={`https://maps.google.com/maps?q=${trackingData.coordinates.lat},${trackingData.coordinates.lng}&t=&z=4&ie=UTF8&iwloc=&output=embed`}
                className="absolute inset-0 w-full h-full"
                title="Shipment Location"
              ></iframe>
              
              <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center animate-pulse">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Live Position</p>
                  <p className="text-slate-900 font-bold">{trackingData.coordinates.lat}, {trackingData.coordinates.lng}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Carrier</p>
                <p className="font-bold text-slate-900 text-lg">{trackingData.carrier}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Vessel</p>
                <p className="font-bold text-slate-900 text-lg">{trackingData.vessel}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Departure</p>
                <p className="font-bold text-slate-900 text-lg">{trackingData.departure}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">ETA</p>
                <p className="font-bold text-brand-600 text-lg">{trackingData.eta}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Journey Timeline</h3>
              
              <div className="relative border-l-2 border-brand-200 ml-4 space-y-10">
                {trackingData.updates.map((update, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 
                      ${update.status === 'completed' ? 'bg-emerald-100 border-emerald-500 text-emerald-600' : 
                        update.status === 'current' ? 'bg-brand-100 border-brand-500 text-brand-600 animate-pulse' : 
                        update.status === 'rejected' ? 'bg-red-100 border-red-500 text-red-600' :
                        'bg-white border-slate-200 text-slate-300'}`}
                    >
                      {update.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                      {update.status === 'current' && <Anchor className="w-4 h-4" />}
                      {update.status === 'pending' && <Truck className="w-4 h-4" />}
                      {update.status === 'rejected' && <XCircle className="w-4 h-4" />}
                    </div>
                    
                    <h4 className={`font-bold text-lg ${update.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                      {update.event}
                    </h4>
                    <p className={`text-sm mt-1 ${update.status === 'pending' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {update.location} • {update.time}
                    </p>
                    {update.details && (
                      <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-600 leading-relaxed">{update.details}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
