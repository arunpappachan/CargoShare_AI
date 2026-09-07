import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, AlertTriangle } from 'lucide-react';

export default function FraudManager() {
  const [alerts, setAlerts] = useState([
    { id: 'FRD-109', user: 'TechFreight SME', type: 'Suspicious IP Login', severity: 'High', status: 'Unresolved' },
    { id: 'FRD-110', user: 'Pacific Blue Shipping', type: 'Payment Discrepancy', severity: 'Medium', status: 'Resolved' },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    user: '', type: '', severity: 'Low', status: 'Unresolved'
  });

  const handleOpenForm = (alert = null) => {
    if (alert) {
      setFormData(alert);
      setEditingId(alert.id);
    } else {
      setFormData({ user: '', type: '', severity: 'Low', status: 'Unresolved' });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setAlerts(alerts.map(a => a.id === editingId ? { ...formData, id: editingId } : a));
    } else {
      const newId = `FRD-11${alerts.length + 1}`;
      setAlerts([...alerts, { ...formData, id: newId }]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleResolve = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fraud Detection & Monitoring</h1>
          <p className="text-slate-500 mt-1">Manually track and resolve security alerts and suspicious activities.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" /> Log Alert
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-red-200 mb-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-red-500" /> {editingId ? 'Edit Security Alert' : 'New Security Alert'}
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">User/Company</label>
              <input required type="text" value={formData.user} onChange={e => setFormData({...formData, user: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alert Type (Description)</label>
              <input required type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
              <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-red-500">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-red-500">
                <option value="Unresolved">Unresolved</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium flex items-center gap-2"><Check className="w-4 h-4"/> Save Alert</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-500">
              <th className="p-4 pl-6">Alert ID</th>
              <th className="p-4">Target User</th>
              <th className="p-4">Type</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {alerts.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">No active alerts found.</td></tr>
            )}
            {alerts.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 font-medium text-slate-900">{a.id}</td>
                <td className="p-4 text-slate-700">{a.user}</td>
                <td className="p-4 text-slate-700">{a.type}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold 
                    ${a.severity === 'High' || a.severity === 'Critical' ? 'bg-red-100 text-red-700' : 
                      a.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    {a.severity}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold 
                    ${a.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {a.status}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right flex justify-end gap-1">
                  {a.status !== 'Resolved' && (
                    <button onClick={() => handleResolve(a.id)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Mark as Resolved"><Check className="w-4 h-4"/></button>
                  )}
                  <button onClick={() => handleOpenForm(a)} className="p-2 text-slate-400 hover:text-purple-600 transition-colors"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(a.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
