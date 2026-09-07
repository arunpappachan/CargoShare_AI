import React, { useState, useEffect } from 'react';
import { Anchor, MapPin, Calendar, Package, PlusCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PostSpace() {
  const { user } = useAuth();
  const [posted, setPosted] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');

  const [vessel, setVessel] = useState('');
  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamically clear error when user types
  useEffect(() => {
    if (error) setError('');
  }, [vessel, origin, destination, date, capacity, price]);

  const handlePost = async (e) => {
    e.preventDefault();
    
    // Comprehensive Validations
    if (vessel.trim().length < 3) {
      setError('Vessel name must be at least 3 characters long.');
      return;
    }
    if (origin === destination) {
      setError('Origin and Destination ports cannot be the same.');
      return;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError('Departure date cannot be in the past.');
      return;
    }
    if (Number(capacity) <= 0) {
      setError('Capacity must be greater than 0.');
      return;
    }
    if (Number(price) <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const carrierName = user?.companyName || 'Oceanic Freight Ltd.';

      const res = await fetch('http://localhost:5000/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vessel: vessel.trim(),
          origin,
          dest: destination,
          date,
          capacity: Number(capacity),
          price: Number(price),
          carrier: carrierName
        })
      });

      if (res.ok) {
        setPosted(true);
        // Reset form
        setVessel('');
        setOrigin('');
        setDestination('');
        setDate('');
        setCapacity('');
        setPrice('');
      } else {
        setError('Failed to post space. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Post Available Space</h1>
          <p className="text-slate-500 mt-2">List your empty container space to exporters and fill your vessel.</p>
        </div>
      </div>

      {posted ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">Space Listed Successfully!</h3>
          <p className="text-slate-500">Your available container space is now visible to thousands of verified exporters.</p>
          <div className="pt-8">
            <button onClick={() => setPosted(false)} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-all">Post Another Voyage</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200">
          <form onSubmit={handlePost} className="p-8 space-y-8">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Vessel Name / Voyage Number</label>
              <div className="relative">
                <Anchor className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input type="text" value={vessel} onChange={(e) => setVessel(e.target.value)} placeholder="e.g. Oceanic Explorer V-102" className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Origin Port</label>
                <select 
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required>
                  <option value="" disabled>Select Origin</option>
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
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Destination Port</label>
                <select 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required>
                  <option value="" disabled>Select Destination</option>
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
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Departure Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Available Space (CBM)</label>
                <div className="relative">
                  <Package className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Total capacity" className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Price per CBM (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 font-bold text-slate-400">₹</span>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 450" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
            
            <div className="pt-4 flex justify-end border-t border-slate-100 mt-6">
              <button type="submit" disabled={loading} className={`mt-4 px-8 py-4 bg-blue-600 text-white rounded-xl font-medium transition-all flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}>
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><PlusCircle className="w-5 h-5" /> Publish Listing</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
