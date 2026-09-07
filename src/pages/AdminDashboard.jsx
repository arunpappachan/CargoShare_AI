import React, { useState } from 'react';
import { Search, List, Users, Ship, LogOut, FileText, Settings, Activity, ShieldCheck, Box, BookOpen, AlertTriangle, DollarSign, BarChart2, ClipboardList } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BookingManager from '../components/admin/BookingManager';
import FraudManager from '../components/admin/FraudManager';
import CommissionManager from '../components/admin/CommissionManager';

import ReportsManager from '../components/admin/ReportsManager';
import SettingsManager from '../components/admin/SettingsManager';
import ExporterManager from '../components/admin/ExporterManager';
import CarrierManager from '../components/admin/CarrierManager';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-64 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 z-20 border-r border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950 z-0"></div>
        
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50 relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <span className="font-bold text-xl tracking-tight">CargoShare <span className="text-purple-400">Admin</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-3 relative z-10">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'overview' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Activity className="w-5 h-5" /> System Overview
          </button>
          
          <button 
            onClick={() => setActiveTab('exporters')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'exporters' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Users className="w-5 h-5" /> Exporters (SMEs)
          </button>

          <button 
            onClick={() => setActiveTab('carriers')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'carriers' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Ship className="w-5 h-5" /> Shipping Carriers
          </button>

          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'bookings' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <BookOpen className="w-5 h-5" /> Booking Management
          </button>

          <button 
            onClick={() => setActiveTab('fraud')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'fraud' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <AlertTriangle className="w-5 h-5" /> Fraud Detection
          </button>

          <button 
            onClick={() => setActiveTab('commission')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'commission' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <DollarSign className="w-5 h-5" /> Commission Mgmt
          </button>

          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'reports' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <BarChart2 className="w-5 h-5" /> Reports & Analytics
          </button>



          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'settings' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" /> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800/50 relative z-10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all font-medium">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 relative z-10 min-h-screen">
        <div className="max-w-6xl mx-auto">
          
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
                  <p className="text-slate-500 mt-1">Platform performance and aggregate metrics.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Users</p>
                      <h3 className="text-2xl font-bold text-slate-900">12,450</h3>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Box className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Active Shipments</p>
                      <h3 className="text-2xl font-bold text-slate-900">3,892</h3>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">System Health</p>
                      <h3 className="text-2xl font-bold text-slate-900">99.9%</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exporters' && <ExporterManager />}

          {activeTab === 'carriers' && <CarrierManager />}

          {activeTab === 'bookings' && <BookingManager />}

          {activeTab === 'fraud' && <FraudManager />}

          {activeTab === 'commission' && <CommissionManager />}

          {activeTab === 'reports' && <ReportsManager />}



          {activeTab === 'settings' && <SettingsManager />}

        </div>
      </main>
      
    </div>
  );
}
