import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Building, Shield, LogOut, Phone, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    phone: '',
    region: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        companyName: user.companyName || '',
        phone: user.phone || '',
        region: user.region || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert({ type: '', message: '' });
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
            <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
          </div>
          <button
            onClick={handleSignOut}
            className="self-start sm:self-auto px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Global Alert */}
        {alert.message && (
          <div className={`p-4 rounded-2xl border text-sm flex items-start gap-3 animate-in fade-in ${
            alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />}
            <span>{alert.message}</span>
          </div>
        )}

        {/* Main Card with Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* User Hero Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-brand-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg shadow-brand-500/30">
                {(user?.name || formData.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {user?.name || formData.name || 'User Profile'}
                </h2>
                <p className="text-slate-300 text-sm flex items-center gap-2 mt-1">
                  <Building className="w-4 h-4 text-brand-400" /> {user?.companyName || formData.companyName || 'No Company Set'}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {user?.email || formData.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-200 border border-white/10 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-brand-400" /> {user?.role || 'User'}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 animate-in fade-in duration-300">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                        !isEditing ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-brand-500 bg-white focus:ring-2 focus:ring-brand-500'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Company Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                        !isEditing ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-brand-500 bg-white focus:ring-2 focus:ring-brand-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                        !isEditing ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-brand-500 bg-white focus:ring-2 focus:ring-brand-500'
                      }`}
                    />
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl text-sm shadow-md shadow-brand-500/20"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 border-2 border-slate-200 hover:border-brand-500 hover:text-brand-600 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
