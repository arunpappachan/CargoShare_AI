import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export default function BookingManager() {
  const [bookings, setBookings] = useState([
    { id: 'BKG-001', exporter: 'Global Exports Inc.', carrier: 'Oceanic Freight Ltd.', origin: 'Shanghai', destination: 'Los Angeles', status: 'Active' },
    { id: 'BKG-002', exporter: 'Sunrise Traders', carrier: 'Maersk Logistics', origin: 'Rotterdam', destination: 'New York', status: 'Pending' },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    exporter: '', carrier: '', origin: '', destination: '', status: 'Pending'
  });

  const handleOpenForm = (booking = null) => {
    if (booking) {
      setFormData(booking);
      setEditingId(booking.id);
    } else {
      setFormData({ exporter: '', carrier: '', origin: '', destination: '', status: 'Pending' });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setBookings(bookings.map(b => b.id === editingId ? { ...formData, id: editingId } : b));
    } else {
      const newId = `BKG-00${bookings.length + 1}`;
      setBookings([...bookings, { ...formData, id: newId }]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Booking Management</h1>
          <p className="text-slate-500 mt-1">Manually manage all active, pending, and completed bookings.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Booking
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Booking' : 'New Booking'}</h3>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exporter</label>
              <input required type="text" value={formData.exporter} onChange={e => setFormData({...formData, exporter: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Carrier</label>
              <input required type="text" value={formData.carrier} onChange={e => setFormData({...formData, carrier: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Origin</label>
              <input required type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
              <input required type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500">
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium flex items-center gap-2"><Check className="w-4 h-4"/> Save Booking</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-500">
              <th className="p-4 pl-6">ID</th>
              <th className="p-4">Exporter</th>
              <th className="p-4">Carrier</th>
              <th className="p-4">Route</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {bookings.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">No bookings found.</td></tr>
            )}
            {bookings.map(b => (
              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 font-medium text-slate-900">{b.id}</td>
                <td className="p-4 text-slate-700">{b.exporter}</td>
                <td className="p-4 text-slate-500">{b.carrier}</td>
                <td className="p-4 text-slate-700">{b.origin} → {b.destination}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold 
                    ${b.status === 'Active' ? 'bg-blue-100 text-blue-700' : 
                      b.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                      b.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {b.status}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <button onClick={() => handleOpenForm(b)} className="p-2 text-slate-400 hover:text-purple-600 transition-colors"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
