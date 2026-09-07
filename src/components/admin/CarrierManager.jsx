import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Ship, ShieldAlert, CheckCircle, Ban, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CarrierManager() {
  const { token } = useAuth();
  const [carriers, setCarriers] = useState([
    { id: 'CAR-501', name: 'Oceanic Freight Ltd.', email: 'carrier@cargoshare.ai', spacePosted: '12,500 CBM' },
    { id: 'CAR-502', name: 'Maersk Logistics', email: 'partner@maersk.com', spacePosted: '45,000 CBM' },
    { id: 'CAR-503', name: 'Pacific Blue Shipping', email: 'admin@pacificblue.co', spacePosted: '0 CBM' },
  ]);

  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', email: '', spacePosted: ''
  });

  useEffect(() => {
    fetchCarriers();
  }, [token]);

  const fetchCarriers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users?role=carrier', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const mapped = json.data.map(u => ({
            id: u._id,
            name: u.companyName || u.name,
            email: u.email,
            spacePosted: '10,000 CBM',
          }));
          setCarriers(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to fetch carriers from API:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleOpenForm = (carrier = null) => {
    if (carrier) {
      setFormData(carrier);
      setEditingId(carrier.id);
    } else {
      setFormData({ name: '', email: '', spacePosted: '' });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setCarriers(carriers.map(car => car.id === editingId ? { ...formData, id: editingId } : car));
    } else {
      const newId = `CAR-50${carriers.length + 1}`;
      setCarriers([...carriers, { ...formData, id: newId }]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    setCarriers(carriers.filter(car => car.id !== id));
  };



  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Shipping Carriers</h1>
          <p className="text-slate-500 mt-1">Manage registered shipping lines.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add Carrier
        </button>
      </div>

      {alert && (
        <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl text-sm font-medium animate-in fade-in">
          {alert}
        </div>
      )}

      {isFormOpen && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Ship className="text-blue-500" /> {editingId ? 'Edit Carrier' : 'New Carrier'}
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Carrier Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Space Posted (e.g. 10,000 CBM)</label>
              <input required type="text" value={formData.spacePosted} onChange={e => setFormData({...formData, spacePosted: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500" />
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium flex items-center gap-2"><Check className="w-4 h-4"/> Save Carrier</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-500">
              <th className="p-4 pl-6">ID / Carrier</th>
              <th className="p-4">Email</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {carriers.length === 0 && (
              <tr><td colSpan="3" className="p-8 text-center text-slate-500">No carriers found.</td></tr>
            )}
            {carriers.map(carrier => (
              <tr key={carrier.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6">
                  <div className="font-bold text-slate-900">{carrier.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{carrier.id}</div>
                </td>
                <td className="p-4 text-slate-600 text-xs">{carrier.email}</td>

                <td className="p-4 pr-6 text-right">
                  <button onClick={() => handleOpenForm(carrier)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(carrier.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
