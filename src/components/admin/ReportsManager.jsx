import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, BarChart2 } from 'lucide-react';

export default function ReportsManager() {
  const [reports, setReports] = useState([
    { id: 'REP-001', title: 'Q3 Financial Overview', type: 'Financial', author: 'admin', date: '2023-10-01', metric: '₹145,000 Revenue' },
    { id: 'REP-002', title: 'September User Growth', type: 'Growth', author: 'admin', date: '2023-10-05', metric: '+12% Active Users' },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', type: 'Financial', author: 'admin', date: '', metric: ''
  });

  const handleOpenForm = (report = null) => {
    if (report) {
      setFormData(report);
      setEditingId(report.id);
    } else {
      const now = new Date();
      setFormData({ title: '', type: 'Financial', author: 'admin', date: now.toISOString().split('T')[0], metric: '' });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setReports(reports.map(r => r.id === editingId ? { ...formData, id: editingId } : r));
    } else {
      const newId = `REP-00${reports.length + 1}`;
      setReports([...reports, { ...formData, id: newId }]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    setReports(reports.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">Manually generate, edit, and track platform reports.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Report
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-indigo-200 mb-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="text-indigo-500" /> {editingId ? 'Edit Report' : 'New Report Entry'}
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Report Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500">
                <option value="Financial">Financial</option>
                <option value="Growth">Growth</option>
                <option value="Operations">Operations</option>
                <option value="Security">Security</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Key Metric / Highlight</label>
              <input required type="text" placeholder="e.g. +12% Users, ₹45k Revenue" value={formData.metric} onChange={e => setFormData({...formData, metric: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium flex items-center gap-2"><Check className="w-4 h-4"/> Save Report</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-500">
              <th className="p-4 pl-6">Report ID</th>
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Date</th>
              <th className="p-4">Key Metric</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {reports.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">No reports generated yet.</td></tr>
            )}
            {reports.map(r => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 font-medium text-slate-900">{r.id}</td>
                <td className="p-4 text-slate-700 font-medium">{r.title}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold 
                    ${r.type === 'Financial' ? 'bg-emerald-100 text-emerald-700' : 
                      r.type === 'Growth' ? 'bg-blue-100 text-blue-700' : 
                      r.type === 'Operations' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {r.type}
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-xs font-mono">{r.date}</td>
                <td className="p-4 font-medium text-slate-900">{r.metric}</td>
                <td className="p-4 pr-6 text-right">
                  <button onClick={() => handleOpenForm(r)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
