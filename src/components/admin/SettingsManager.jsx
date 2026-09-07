import React, { useState } from 'react';
import { Save, CheckCircle, Settings2, Bell, Shield, Globe } from 'lucide-react';

export default function SettingsManager() {
  const [isSaved, setIsSaved] = useState(false);
  const [settings, setSettings] = useState({
    platformFee: '5.0',
    maintenanceMode: false,
    allowSignups: true,
    emailAlerts: true,
    supportEmail: 'support@cargoshare.ai'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Platform Settings</h1>
          <p className="text-slate-500 mt-1">Configure global platform rules, fees, and system behaviors.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-slate-900/20"
        >
          {isSaved ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Save className="w-5 h-5" />}
          {isSaved ? 'Settings Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Financial Settings */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Settings2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Financial Configuration</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Global Platform Fee (%)</label>
              <p className="text-xs text-slate-500 mb-2">The default commission taken from all successful bookings.</p>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1"
                  value={settings.platformFee} 
                  onChange={e => setSettings({...settings, platformFee: e.target.value})}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-500 bg-slate-50 focus:bg-white transition-colors" 
                />
                <span className="absolute right-4 top-3.5 font-bold text-slate-400">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Security & Access</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-900">Maintenance Mode</p>
                <p className="text-xs text-slate-500 mt-1">Disables all non-admin logins when active.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-900">Allow New Signups</p>
                <p className="text-xs text-slate-500 mt-1">Enable or disable registration for new exporters and carriers.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.allowSignups} onChange={() => setSettings({...settings, allowSignups: !settings.allowSignups})} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Global Configuration */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Global Communication</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Global Support Email</label>
              <p className="text-xs text-slate-500 mb-2">Where users send support tickets.</p>
              <input 
                type="email" 
                value={settings.supportEmail} 
                onChange={e => setSettings({...settings, supportEmail: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-500 bg-slate-50 focus:bg-white transition-colors" 
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-6 md:mt-0 self-end h-[50px]">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">System Email Alerts</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.emailAlerts} onChange={() => setSettings({...settings, emailAlerts: !settings.emailAlerts})} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
