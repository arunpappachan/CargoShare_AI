import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, DollarSign } from 'lucide-react';

export default function CommissionManager() {
  const [commissions, setCommissions] = useState([
    { id: 'COM-501', carrier: 'Oceanic Freight Ltd.', amount: '₹1,250.00', status: 'Paid', date: '2023-10-15' },
    { id: 'COM-502', carrier: 'Maersk Logistics', amount: '₹4,500.00', status: 'Pending', date: '2023-10-18' },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    carrier: '', amount: '', status: 'Pending', date: ''
  });

  const handleOpenForm = (commission = null) => {
    if (commission) {
      setFormData(commission);
      setEditingId(commission.id);
    } else {
      setFormData({ carrier: '', amount: '', status: 'Pending', date: new Date().toISOString().split('T')[0] });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setCommissions(commissions.map(c => c.id === editingId ? { ...formData, id: editingId } : c));
    } else {
      const newId = `COM-50${commissions.length + 1}`;
      setCommissions([...commissions, { ...formData, id: newId }]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    setCommissions(commissions.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Commission Management</h1>
          <p className="text-slate-500 mt-1">Manually track platform fees and carrier payouts.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" /> Record Payout
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-emerald-200 mb-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="text-emerald-500" /> {editingId ? 'Edit Payout' : 'New Payout Record'}
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Carrier / Payee</label>
              <input required type="text" value={formData.carrier} onChange={e => setFormData({...formData, carrier: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input required type="text" placeholder="₹0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500">
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium flex items-center gap-2"><Check className="w-4 h-4"/> Save Record</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-500">
              <th className="p-4 pl-6">ID</th>
              <th className="p-4">Carrier / Payee</th>
              <th className="p-4">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {commissions.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">No commission records found.</td></tr>
            )}
            {commissions.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 font-medium text-slate-900">{c.id}</td>
                <td className="p-4 text-slate-700">{c.carrier}</td>
                <td className="p-4 text-slate-700">{c.date}</td>
                <td className="p-4 font-bold text-slate-900">{c.amount}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold 
                    ${c.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                      c.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <button onClick={() => handleOpenForm(c)} className="p-2 text-slate-400 hover:text-purple-600 transition-colors"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
