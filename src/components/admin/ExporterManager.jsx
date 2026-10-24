import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  Ban, 
  AlertTriangle, 
  ShieldCheck, 
  Mail, 
  Search, 
  Building2, 
  Package, 
  IndianRupee, 
  Eye, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../lib/apiConfig';
import { autoSyncAllBookingsToAdmin } from '../../lib/syncAdminData';

export default function ExporterManager({ onSelectBooking }) {
  const { token } = useAuth();

  const [exporters, setExporters] = useState(() => {
    try {
      const saved = localStorage.getItem('cargoshare_exporters');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExporterForBookings, setSelectedExporterForBookings] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Blank form for manual entry (No demo pre-fills)
  const [newExporter, setNewExporter] = useState({
    name: '',
    contactPerson: '',
    email: '',
    city: '',
    commodity: ''
  });

  const loadExportersFromStorage = () => {
    try {
      const saved = localStorage.getItem('cargoshare_exporters');
      if (saved) {
        setExporters(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error reading cargoshare_exporters:', e);
    }
  };

  useEffect(() => {
    loadExportersFromStorage();
    fetchBookings();

    const handleSync = () => {
      loadExportersFromStorage();
    };

    window.addEventListener('cargoshare_data_synced', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cargoshare_data_synced', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [token]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const savedBookings = JSON.parse(localStorage.getItem('cargoshare_bookings') || '[]');
      const res = await fetch(`${API_BASE}/api/bookings`).catch(() => null);
      let combinedBookings = savedBookings;
      if (res && res.ok) {
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
          const ids = new Set(combinedBookings.map(b => b.id));
          const newOnes = json.data.filter(b => !ids.has(b.id));
          combinedBookings = [...combinedBookings, ...newOnes];
        }
      }
      setAllBookings(combinedBookings);
      // Automatically sync any bookings into the exporter directory!
      autoSyncAllBookingsToAdmin(combinedBookings);
      loadExportersFromStorage();
    } catch (err) {
      console.warn('Fallback bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleSaveExporter = (e) => {
    e.preventDefault();
    if (!newExporter.name || !newExporter.email) {
      alert('Company name and email are required.');
      return;
    }

    const exporterObj = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      name: newExporter.name.trim(),
      contactPerson: newExporter.contactPerson.trim() || 'Authorized Shipper',
      email: newExporter.email.trim(),
      city: newExporter.city.trim() || 'India',
      commodity: newExporter.commodity.trim() || 'General Freight',
      bookingsCount: 0,
      totalCbm: 0,
      totalSpend: '₹0',
      status: 'Active'
    };

    const updated = [exporterObj, ...exporters];
    setExporters(updated);
    try {
      localStorage.setItem('cargoshare_exporters', JSON.stringify(updated));
    } catch (err) {
      console.warn('Storage save error:', err);
    }

    // Reset blank form
    setNewExporter({
      name: '',
      contactPerson: '',
      email: '',
      city: '',
      commodity: ''
    });
    setIsAddModalOpen(false);
    showToast(`Exporter "${exporterObj.name}" added successfully`);
  };

  // Filter
  const filteredExporters = exporters.filter(exp => {
    const q = searchQuery.toLowerCase();
    return (
      (exp.name || '').toLowerCase().includes(q) ||
      (exp.email || '').toLowerCase().includes(q) ||
      (exp.contactPerson || '').toLowerCase().includes(q) ||
      (exp.city || '').toLowerCase().includes(q) ||
      (exp.commodity || '').toLowerCase().includes(q)
    );
  });

  // Calculate metrics dynamically
  const totalExportersCount = exporters.length;
  const totalBookingsPlaced = exporters.reduce((sum, e) => sum + (Number(e.bookingsCount) || 0), 0);
  const totalCbmShipped = exporters.reduce((sum, e) => sum + (Number(e.totalCbm) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              👥 Registered SME Shippers Directory
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-600" /> Shippers Registry
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">SME Exporters Management</h1>
          <p className="text-slate-500 mt-1">
            Directory of registered SME shippers and their consolidated cargo reservations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add SME Exporter
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Metrics Strip (GST and Compliance Removed) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Registered SME Shippers</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalExportersCount} SMEs</div>
            <span className="text-[11px] text-purple-600 font-semibold">Active Shippers</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings Placed</span>
            <div className="text-2xl font-black text-blue-900 mt-0.5">{totalBookingsPlaced} Shipments</div>
            <span className="text-[11px] text-blue-600 font-semibold">Across container carriers</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Volume Shipped</span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">{totalCbmShipped} CBM</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Container space consolidated</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by exporter name, contact, city, commodity..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {/* Exporters Table (GST Column & Compliance Tag Removed) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4">Exporter Company</th>
                <th className="px-5 py-4">Primary Commodity</th>
                <th className="px-5 py-4">Contact Person</th>
                <th className="px-5 py-4">Email Address</th>
                <th className="px-5 py-4">Bookings Placed</th>
                <th className="px-5 py-4">Volume (CBM)</th>
                <th className="px-5 py-4">Gross Spend</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExporters.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No SME exporters entered yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Click "+ Add SME Exporter" above to manually enter an exporter.</p>
                  </td>
                </tr>
              ) : (
                filteredExporters.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0 border border-purple-100">
                          {exp.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong className="text-slate-900 block font-bold text-sm">{exp.name}</strong>
                          <span className="text-[10px] text-slate-400">{exp.city}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-700">{exp.commodity}</span>
                    </td>

                    <td className="px-5 py-4">
                      <strong className="text-slate-800 block">{exp.contactPerson}</strong>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-slate-600 font-mono text-xs flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        {exp.email}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-purple-700 text-sm">
                        {exp.bookingsCount || 0} Bookings
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-black text-slate-900 text-sm">
                        {exp.totalCbm || 0} CBM
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-black text-emerald-700 text-sm">
                        {exp.totalSpend || '₹0'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedExporterForBookings(exp)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="View all bookings placed by this exporter"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Bookings</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- EXPORTER BOOKINGS BREAKDOWN MODAL ----------------- */}
      {selectedExporterForBookings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{selectedExporterForBookings.name} — Booked Cargo Ledger</span>
                </h3>
                <p className="text-slate-500 text-xs">
                  Contact: {selectedExporterForBookings.contactPerson} • Email: {selectedExporterForBookings.email}
                </p>
              </div>
              <button 
                onClick={() => setSelectedExporterForBookings(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-light leading-none cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-2.5">
                {allBookings
                  .filter(b => (b.exporterName || '').toLowerCase().includes(selectedExporterForBookings.name.toLowerCase().split(' ')[0]))
                  .map((b, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-slate-900 text-sm">#{b.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-xs">
                        <span>Route: <strong>{b.route}</strong></span>
                        <span className="font-black text-purple-700">{b.cbm} CBM</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100 text-slate-500">
                        <span>Carrier: {b.carrier}</span>
                        <span className="font-bold text-emerald-600">{b.paymentStatus || '25% Advance Paid'}</span>
                      </div>
                    </div>
                  ))}

                {allBookings.filter(b => (b.exporterName || '').toLowerCase().includes(selectedExporterForBookings.name.toLowerCase().split(' ')[0])).length === 0 && (
                  <div className="bg-slate-50 p-8 rounded-2xl text-center text-slate-400">
                    <p className="font-medium">No cargo bookings placed by this exporter yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedExporterForBookings(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- MANUAL ADD SME EXPORTER MODAL (BLANK INPUTS - NO GST) ----------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="text-purple-600 w-5 h-5" /> 
                <span>Register SME Exporter Manually</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 text-xl leading-none cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveExporter} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Company / Exporter Name *</label>
                <input 
                  type="text" 
                  value={newExporter.name} 
                  onChange={e => setNewExporter({ ...newExporter, name: e.target.value })} 
                  placeholder="Enter exporter company name..." 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Authorized Contact Person</label>
                  <input 
                    type="text" 
                    value={newExporter.contactPerson} 
                    onChange={e => setNewExporter({ ...newExporter, contactPerson: e.target.value })} 
                    placeholder="Enter contact name..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    value={newExporter.email} 
                    onChange={e => setNewExporter({ ...newExporter, email: e.target.value })} 
                    placeholder="Enter email address..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">City / Port Region</label>
                  <input 
                    type="text" 
                    value={newExporter.city} 
                    onChange={e => setNewExporter({ ...newExporter, city: e.target.value })} 
                    placeholder="e.g. Mumbai, Chennai..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Primary Commodity</label>
                  <input 
                    type="text" 
                    value={newExporter.commodity} 
                    onChange={e => setNewExporter({ ...newExporter, commodity: e.target.value })} 
                    placeholder="e.g. Textiles, Spices, Machinery..." 
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white" 
                  />
                </div>
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Exporter Manually
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
