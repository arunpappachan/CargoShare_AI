import React, { useState } from 'react';
import { Search, List, Users, Ship, LogOut, FileText, Settings, Activity, ShieldCheck, Box, BookOpen, AlertTriangle, DollarSign, BarChart2, ClipboardList, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BookingManager from '../components/admin/BookingManager';
import FraudManager from '../components/admin/FraudManager';
import CommissionManager from '../components/admin/CommissionManager';
import ReportsManager from '../components/admin/ReportsManager';
import SettingsManager from '../components/admin/SettingsManager';
import ExporterManager from '../components/admin/ExporterManager';
import CarrierManager from '../components/admin/CarrierManager';
import SidebarNav from '../components/common/SidebarNav';
import CountUp from '../components/common/CountUp';
import { useToast } from '../context/ToastContext';

const ADMIN_NAV_ITEMS = [
  { key: 'overview', id: 'overview', label: 'System Overview', icon: Activity },
  { key: 'exporters', id: 'exporters', label: 'Exporters (SMEs)', icon: Users },
  { key: 'carriers', id: 'carriers', label: 'Shipping Carriers', icon: Ship },
  { key: 'bookings', id: 'bookings', label: 'Booking Mgmt', icon: BookOpen, badge: 12 },
  { key: 'fraud', id: 'fraud', label: 'Fraud Detection', icon: AlertTriangle, badge: 'Active' },
  { key: 'commission', id: 'commission', label: 'Commission Mgmt', icon: DollarSign },
  { key: 'reports', id: 'reports', label: 'Reports & Analytics', icon: BarChart2 },
  { key: 'settings', id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Can be extended to fraud alerts, user approvals, and commission notifications
    showToast('Signed out of Administrator Console', 'info');
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

        {/* Sliding Pill Sidebar Navigation */}
        <SidebarNav
          items={ADMIN_NAV_ITEMS}
          activeKey={activeTab}
          onChange={setActiveTab}
          accentClass="bg-gradient-to-r from-purple-600 to-purple-500 shadow-purple-500/25"
          className="z-10"
        />

        <div className="p-4 border-t border-slate-800/50 relative z-10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all font-medium">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 relative z-10 min-h-screen">
        <div className="max-w-6xl mx-auto">
          
          {/* Top Admin KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Shippers</p>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  <CountUp end={142} suffix=" SMEs" />
                </div>
                <p className="text-[11px] text-purple-600 font-bold mt-0.5">+18 this month</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Partner Carriers</p>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  <CountUp end={18} suffix=" Lines" />
                </div>
                <p className="text-[11px] text-blue-600 font-medium mt-0.5">100% verified KYC</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Ship className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform GMV</p>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  <CountUp prefix="₹" end={284.5} decimals={1} suffix="K" />
                </div>
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">+22% month-over-month</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security State</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">Protected</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Zero active risk alerts</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>
          
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
