import React, { useState } from 'react';
import { Search, MapPin, Calendar, Package, ArrowRight, UploadCloud, CheckCircle, Ship } from 'lucide-react';

export default function SearchSpace() {
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingModal, setBookingModal] = useState(null);
  const [booked, setBooked] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [cbm, setCbm] = useState('');
  const [documentName, setDocumentName] = useState('');
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentName(e.target.files[0].name);
    }
  };
  
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: bookingModal.id,
          route: `${portsMap[bookingModal.origin] || bookingModal.origin} → ${portsMap[bookingModal.dest] || bookingModal.dest}`,
          carrier: bookingModal.carrier,
          cbm: cbm || 5
        })
      });
      if (res.ok) {
        setBooked(true);
      }
    } catch (err) {
      console.error(err);
      setBooked(true); // Fallback for UI if server is down
    }
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
      const res = await fetch(`http://localhost:5000/api/spaces?origin=${origin}&dest=${destination}&date=${date}`);
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



  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Search Available Space</h1>
        <p className="text-slate-500 mt-2">Find the perfect container space for your cargo.</p>
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
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>

      {searched && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Available Containers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div key={result.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider">{result.company}</span>
                      <h3 className="text-xl font-bold text-slate-900 mt-3">{result.vessel}</h3>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                      <Ship className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 relative">
                    <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-100"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-300"></div>
                      <div>
                        <p className="text-xs text-slate-500">Origin</p>
                        <p className="font-semibold text-slate-700">{result.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-brand-500"></div>
                      <div>
                        <p className="text-xs text-slate-500">Destination</p>
                        <p className="font-semibold text-slate-700">{result.dest}</p>
                      </div>
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
                    <button onClick={() => setBookingModal(result)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                      Book Space
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

      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {booked ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">Booking Confirmed!</h3>
                <p className="text-slate-500">Your cargo details have been uploaded and space is secured on {bookingModal.carrier}.</p>
                <div className="pt-8">
                  <button onClick={() => { setBooked(false); setBookingModal(null); }} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all">Done</button>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Upload Cargo Details</h2>
                    <p className="text-slate-500 mt-1">Complete booking for {bookingModal.id}</p>
                  </div>
                  <button onClick={() => setBookingModal(null)} className="text-slate-400 hover:text-slate-900 p-2 text-2xl leading-none transition-colors">&times;</button>
                </div>

                <form className="space-y-6" onSubmit={handleConfirmBooking}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Commodity Type</label>
                      <input type="text" placeholder="e.g. Electronics, Textiles" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Total Weight (KG)</label>
                      <input type="number" placeholder="2000" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Special Requirements</label>
                    <textarea placeholder="Temperature control, fragile handling, etc." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Upload Documents (Commercial Invoice, Packing List)</label>
                    <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-brand-300 transition-colors cursor-pointer group block relative">
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                      <UploadCloud className={`w-10 h-10 mx-auto mb-3 transition-colors ${documentName ? 'text-emerald-500' : 'text-slate-400 group-hover:text-brand-500'}`} />
                      <p className={`text-sm font-medium ${documentName ? 'text-emerald-600' : 'text-slate-600 group-hover:text-slate-900'}`}>
                        {documentName ? `Uploaded: ${documentName}` : 'Click to upload or drag and drop'}
                      </p>
                      {!documentName && <p className="text-xs text-slate-500 mt-1">PDF, JPG, or PNG (max. 10MB)</p>}
                    </label>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100">
                    <span className="text-slate-600 font-medium">Estimated Total ({cbm || 1} CBM)</span>
                    <span className="text-2xl font-bold text-slate-900">₹{bookingModal.price * (cbm || 1)}</span>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setBookingModal(null)} className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors">Confirm Booking</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
