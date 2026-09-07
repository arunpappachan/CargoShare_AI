import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Users, ShieldAlert, CheckCircle, Ban, AlertTriangle, ShieldCheck, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ExporterManager() {
  const { token } = useAuth();
  const [exporters, setExporters] = useState([
    { id: 'EXP-101', name: 'Global Exports Inc.', email: 'exporter@cargoshare.ai', bookings: 12 },
    { id: 'EXP-102', name: 'Sunrise Traders', email: 'hello@sunrisetraders.co', bookings: 5 },
    { id: 'EXP-103', name: 'TechFreight SME', email: 'logistics@techfreight.com', bookings: 0 },
    { id: 'EXP-104', name: 'Organic Foods Co.', email: 'ship@organicfoods.com', bookings: 34 },
  ]);

  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', email: '', bookings: 0
  });

  useEffect(() => {
    fetchExporters();
  }, [token]);

  const fetchExporters = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users?role=exporter', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const mapped = json.data.map(u => ({
            id: u._id,
            name: u.companyName || u.name,
            email: u.email,
            bookings: Math.floor(Math.random() * 15),
            phone: u.phone,
          }));
          setExporters(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to fetch exporters from API, using cached view:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleOpenForm = (exporter = null) => {
    if (exporter) {
      setFormData(exporter);
      setEditingId(exporter.id);
    } else {
      setFormData({ name: '', email: '', bookings: 0 });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setExporters(exporters.map(exp => exp.id === editingId ? { ...formData, id: editingId } : exp));
    } else {
      const newId = `EXP-10${exporters.length + 1}`;
      setExporters([...exporters, { ...formData, id: newId }]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    setExporters(exporters.filter(exp => exp.id !== id));
  };



  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exporters Management</h1>
          <p className="text-slate-500 mt-1">Manage SME exporter accounts.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add Exporter
        </button>
      </div>

      {alert && (
        <div className="p-4 bg-purple-50 border border-purple-100 text-purple-800 rounded-2xl text-sm font-medium animate-in fade-in">
          {alert}
        </div>
      )}

      {isFormOpen && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-purple-500" /> {editingId ? 'Edit Exporter' : 'New Exporter'}
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company / Exporter Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Bookings</label>
              <input required type="number" min="0" value={formData.bookings} onChange={e => setFormData({...formData, bookings: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500" />
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium flex items-center gap-2"><Check className="w-4 h-4"/> Save Exporter</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-500">
              <th className="p-4 pl-6">ID / User</th>
              <th className="p-4">Email</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {exporters.length === 0 && (
              <tr><td colSpan="3" className="p-8 text-center text-slate-500">No exporters found.</td></tr>
            )}
            {exporters.map(exporter => (
              <tr key={exporter.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6">
                  <div className="font-bold text-slate-900">{exporter.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{exporter.id}</div>
                </td>
                <td className="p-4 text-slate-600 text-xs">{exporter.email}</td>

                <td className="p-4 pr-6 text-right">
                  <button onClick={() => handleOpenForm(exporter)} className="p-2 text-slate-400 hover:text-purple-600 transition-colors"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(exporter.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
