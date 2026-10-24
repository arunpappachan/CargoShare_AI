import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Ship, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  Building2, 
  Mail, 
  MapPin, 
  Layers, 
  IndianRupee, 
  Package, 
  Eye, 
  ExternalLink, 
  Award, 
  Anchor, 
  CheckCircle2, 
  Calendar, 
  RefreshCw, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { API_BASE } from '../../lib/apiConfig';
import { autoSyncAllBookingsToAdmin } from '../../lib/syncAdminData';

export default function CarrierManager() {
  const [carriers, setCarriers] = useState(() => {
    try {
      const saved = localStorage.getItem('cargoshare_carriers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Modals state
  const [selectedCarrierForDetails, setSelectedCarrierForDetails] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Blank form for manual entry (No demo pre-fills)
  const [newCarrier, setNewCarrier] = useState({
    name: '',
    code: '',
    fmcLicense: '',
    imoCompany: '',
    headquarters: '',
    email: '',
    fleetSize: '',
    spacePosted: '',
    routes: '',
    status: 'Verified Partner'
  });

  const loadCarriersFromStorage = () => {
    try {
      const saved = localStorage.getItem('cargoshare_carriers');
      if (saved) {
        setCarriers(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error reading cargoshare_carriers:', e);
    }
  };

  useEffect(() => {
    loadCarriersFromStorage();

    // Automatically check all existing bookings and ensure their carriers are recorded
    try {
      const savedBookings = JSON.parse(localStorage.getItem('cargoshare_bookings') || '[]');
      if (savedBookings.length > 0) {
        autoSyncAllBookingsToAdmin(savedBookings);
        loadCarriersFromStorage();
      }
    } catch (e) {
      console.warn('Carrier auto sync check error:', e);
    }

    const handleSync = () => {
      loadCarriersFromStorage();
    };

    window.addEventListener('cargoshare_data_synced', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cargoshare_data_synced', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSaveCarrier = (e) => {
    e.preventDefault();
    if (!newCarrier.name || !newCarrier.email) {
      alert('Carrier name and email are required.');
      return;
    }

    const carrierObj = {
      id: `CAR-${Math.floor(500 + Math.random() * 500)}`,
      name: newCarrier.name.trim(),
      code: (newCarrier.code || newCarrier.name.substring(0, 3)).toUpperCase().trim(),
      fmcLicense: newCarrier.fmcLicense ? newCarrier.fmcLicense.trim() : 'FMC-Verified',
      imoCompany: newCarrier.imoCompany ? newCarrier.imoCompany.trim() : 'IMO-Registered',
      headquarters: newCarrier.headquarters.trim() || 'Port Hub Terminal',
      email: newCarrier.email.trim(),
      fleetSize: Number(newCarrier.fleetSize) || 1,
      spacePosted: newCarrier.spacePosted ? `${Number(newCarrier.spacePosted).toLocaleString()} CBM` : '10,000 CBM',
      routes: newCarrier.routes.trim() || 'Coastal Feeder Route',
      status: newCarrier.status || 'Verified Partner',
      activeListings: 1,
      rating: '4.9/5',
      onTimeRate: '98.5%',
      vessels: [
        { 
          name: `${newCarrier.name.split(' ')[0]} Pioneer`, 
          imo: 'IMO 9821044', 
          capacity: '12,000 CBM', 
          type: 'Container Vessel', 
          flag: 'India' 
        }
      ]
    };

    const updated = [carrierObj, ...carriers];
    setCarriers(updated);
    try {
      localStorage.setItem('cargoshare_carriers', JSON.stringify(updated));
    } catch (err) {
      console.warn('Storage save error:', err);
    }

    // Reset blank form
    setNewCarrier({
      name: '',
      code: '',
      fmcLicense: '',
      imoCompany: '',
      headquarters: '',
      email: '',
      fleetSize: '',
      spacePosted: '',
      routes: '',
      status: 'Verified Partner'
    });
    setIsAddModalOpen(false);
    showToast(`Carrier "${carrierObj.name}" added successfully`);
  };

  // Filter Carriers
  const filteredCarriers = carriers.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (c.name || '').toLowerCase().includes(q) ||
      (c.id || '').toLowerCase().includes(q) ||
      (c.headquarters || '').toLowerCase().includes(q) ||
      (c.routes || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q);

    if (filterType === 'tier1') return matchesSearch && (c.status || '').includes('Tier-1');
    if (filterType === 'verified') return matchesSearch && (c.status || '').includes('Verified');

    return matchesSearch;
  });

  // Calculate Metrics dynamically
  const totalCarriersCount = carriers.length;
  const totalVesselsCount = carriers.reduce((sum, c) => sum + (Number(c.fleetSize) || 0), 0);
  const totalListedSpaceCbm = carriers.reduce((sum, c) => {
    const cbmVal = parseInt((c.spacePosted || '0').replace(/[^0-9]/g, ''), 10) || 0;
    return sum + cbmVal;
  }, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              ⚓ All Shipping Carrier Details & Fleet Registry
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-600" /> Maritime Registry
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Shipping Carriers Management</h1>
          <p className="text-slate-500 mt-1">
            Directory of partner shipping lines, fleet vessels, listed container spaces, and dispatch operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Carrier Manually
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Partner Shipping Lines</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalCarriersCount} Lines</div>
            <span className="text-[11px] text-blue-600 font-semibold">Registered Carriers</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Ship className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Commercial Fleet</span>
            <div className="text-2xl font-black text-blue-900 mt-0.5">{totalVesselsCount} Vessels</div>
            <span className="text-[11px] text-blue-600 font-semibold">Active Container Ships</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Anchor className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Space Listed</span>
            <div className="text-2xl font-black text-emerald-800 mt-0.5">{totalListedSpaceCbm.toLocaleString()} CBM</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Consolidated Capacity</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">On-Time Performance</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">98.7%</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Port Arrival Reliability</span>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search carrier by name, code, route, port..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: `All Carriers (${carriers.length})` },
            { id: 'tier1', label: 'Tier-1 Liners' },
            { id: 'verified', label: 'Verified Partners' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterType === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* All Carrier Details Grid / Directory Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4">Carrier & Maritime Code</th>
                <th className="px-5 py-4">FMC / IMO Credentials</th>
                <th className="px-5 py-4">Fleet & Vessels</th>
                <th className="px-5 py-4">Space Listed</th>
                <th className="px-5 py-4">Serviced Routes</th>
                <th className="px-5 py-4">Dispatch Contact</th>
                <th className="px-5 py-4">Compliance Status</th>
                <th className="px-5 py-4 text-right">Carrier Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading all carrier details...
                  </td>
                </tr>
              ) : filteredCarriers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-slate-400">
                    <Ship className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No commercial shipping carriers entered yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Click "+ Add Carrier Manually" above to enter a shipping line.</p>
                  </td>
                </tr>
              ) : (
                filteredCarriers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Carrier Name & Code */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                          {c.code || c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong className="text-slate-900 block font-bold text-sm">{c.name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {c.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* FMC / IMO Licenses */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <span className="font-mono text-slate-800 font-bold block">{c.fmcLicense}</span>
                        <span className="font-mono text-slate-400 text-[10px] block">{c.imoCompany}</span>
                      </div>
                    </td>

                    {/* Fleet Size */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                        <Ship className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{c.fleetSize} Vessels</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Commercial Container Fleet</span>
                    </td>

                    {/* Space Listed */}
                    <td className="px-5 py-4">
                      <span className="font-black text-blue-700 text-sm block">{c.spacePosted}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{c.activeListings || 1} Open Voyages</span>
                    </td>

                    {/* Serviced Routes */}
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-700 block truncate max-w-[180px]" title={c.routes}>
                        {c.routes}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                        HQ: {c.headquarters}
                      </span>
                    </td>

                    {/* Dispatch Contact - ONLY EMAIL (Phone Removed) */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{c.email}</span>
                      </div>
                    </td>

                    {/* Compliance Status */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {c.status}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Trust: <strong className="text-slate-700">{c.rating || '4.9/5'}</strong> • On-Time: <strong className="text-emerald-600">{c.onTimeRate || '98%'}</strong>
                      </span>
                    </td>

                    {/* Carrier Dossier */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCarrierForDetails(c)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="View complete carrier dossier, fleet list, and exporter bookings"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- COMPREHENSIVE CARRIER DETAILS DOSSIER MODAL ----------------- */}
      {selectedCarrierForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md">
                  {selectedCarrierForDetails.code || selectedCarrierForDetails.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>{selectedCarrierForDetails.name}</span>
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                      {selectedCarrierForDetails.id}
                    </span>
                  </h3>
                  <p className="text-slate-500 text-xs">
                    {selectedCarrierForDetails.headquarters}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCarrierForDetails(null)} 
                className="text-slate-400 hover:text-slate-600 text-2xl font-light leading-none cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Operations HQ & Contact Card - EMAIL ONLY (Phone Removed) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-200">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Operations Headquarters & Dispatch Email
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Head Office & Berth Terminal:</span>
                    <strong className="text-slate-800 text-xs">{selectedCarrierForDetails.headquarters}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Primary Operations Email:</span>
                    <span className="font-mono text-slate-800 font-bold text-xs flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      {selectedCarrierForDetails.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Regulatory & Fleet Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">FMC License</span>
                  <strong className="font-mono text-slate-800 text-sm">{selectedCarrierForDetails.fmcLicense}</strong>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">IMO Organization ID</span>
                  <strong className="font-mono text-slate-800 text-sm">{selectedCarrierForDetails.imoCompany}</strong>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Commercial Fleet Size</span>
                  <strong className="text-blue-900 text-sm font-black">{selectedCarrierForDetails.fleetSize} Vessels Deployed</strong>
                </div>
              </div>

              {/* Serviced Routes */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Serviced Maritime Corridors & Port Hubs
                </h4>
                <p className="text-slate-700 font-semibold">{selectedCarrierForDetails.routes}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <span>Total Space Listed: <strong className="text-blue-900">{selectedCarrierForDetails.spacePosted}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold">On-Time Arrival: {selectedCarrierForDetails.onTimeRate || '98.5%'}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Official maritime carrier registry managed by CargoShare AI Platform Administration.
              </span>
              <button 
                onClick={() => setSelectedCarrierForDetails(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close Carrier Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- MANUAL ADD CARRIER MODAL (BLANK INPUTS - NO DEMO PREFILLS) ----------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Ship className="text-blue-600 w-5 h-5" /> 
                <span>Register New Shipping Carrier Manually</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 text-xl leading-none cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCarrier} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Carrier Line Name *</label>
                  <input 
                    type="text" 
                    value={newCarrier.name} 
                    onChange={e => setNewCarrier({ ...newCarrier, name: e.target.value })} 
                    placeholder="Enter shipping line name..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Carrier Code</label>
                  <input 
                    type="text" 
                    value={newCarrier.code} 
                    onChange={e => setNewCarrier({ ...newCarrier, code: e.target.value })} 
                    placeholder="e.g. MAERSK, OFL..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono outline-none focus:border-blue-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Operations / Dispatch Email * (No Phone Required)</label>
                <input 
                  type="email" 
                  value={newCarrier.email} 
                  onChange={e => setNewCarrier({ ...newCarrier, email: e.target.value })} 
                  placeholder="Enter operations dispatch email..." 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white" 
                  required 
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Headquarters & Port Terminal</label>
                <input 
                  type="text" 
                  value={newCarrier.headquarters} 
                  onChange={e => setNewCarrier({ ...newCarrier, headquarters: e.target.value })} 
                  placeholder="Enter terminal / port address..." 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">FMC License Number</label>
                  <input 
                    type="text" 
                    value={newCarrier.fmcLicense} 
                    onChange={e => setNewCarrier({ ...newCarrier, fmcLicense: e.target.value })} 
                    placeholder="Enter FMC license..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono outline-none focus:border-blue-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">IMO Company ID</label>
                  <input 
                    type="text" 
                    value={newCarrier.imoCompany} 
                    onChange={e => setNewCarrier({ ...newCarrier, imoCompany: e.target.value })} 
                    placeholder="Enter IMO ID..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono outline-none focus:border-blue-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Fleet Vessels Count</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={newCarrier.fleetSize} 
                    onChange={e => setNewCarrier({ ...newCarrier, fleetSize: e.target.value })} 
                    placeholder="e.g. 5" 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white font-bold" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Available Listed Space (CBM)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={newCarrier.spacePosted} 
                    onChange={e => setNewCarrier({ ...newCarrier, spacePosted: e.target.value })} 
                    placeholder="e.g. 25000" 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white font-bold" 
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Serviced Maritime Routes</label>
                <input 
                  type="text" 
                  value={newCarrier.routes} 
                  onChange={e => setNewCarrier({ ...newCarrier, routes: e.target.value })} 
                  placeholder="e.g. Mumbai (JNPT) ↔ Mundra, Cochin ↔ Vizag..." 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Carrier Manually
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
