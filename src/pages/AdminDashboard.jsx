import React, { useState, useEffect } from 'react';
import { Search, List, Users, Ship, LogOut, FileText, Settings, Activity, ShieldCheck, Box, BookOpen, AlertTriangle, IndianRupee, BarChart2, ClipboardList, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
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
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV_ITEMS = [
  { key: 'overview', id: 'overview', label: 'System Overview', icon: Activity },
  { key: 'bookings', id: 'bookings', label: 'All Exporter Bookings', icon: BookOpen, badge: 'Live Ledger' },
  { key: 'carriers', id: 'carriers', label: 'All Carrier Details', icon: Ship, badge: 'Liner Fleets' },
  { key: 'exporters', id: 'exporters', label: 'Exporters (SMEs)', icon: Users, badge: 'SME Shippers' },
  { key: 'fraud', id: 'fraud', label: 'Fraud Detection', icon: AlertTriangle, badge: 'Active' },
  { key: 'commission', id: 'commission', label: 'Commission Mgmt', icon: IndianRupee, badge: '5% Take Rate' },
  { key: 'reports', id: 'reports', label: 'Reports & Analytics', icon: BarChart2, badge: 'Intelligence' },
  { key: 'settings', id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  const [stats, setStats] = useState({
    exportersCount: 0,
    carriersCount: 0,
    bookingsCount: 0,
    gmvTotal: 0
  });

  const updateStats = () => {
    try {
      const exp = JSON.parse(localStorage.getItem('cargoshare_exporters') || '[]');
      const car = JSON.parse(localStorage.getItem('cargoshare_carriers') || '[]');
      const bkg = JSON.parse(localStorage.getItem('cargoshare_bookings') || '[]');
      const comm = JSON.parse(localStorage.getItem('cargoshare_commissions') || '[]');
      
      const gmv = bkg.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0) || 
                  comm.reduce((sum, c) => sum + (Number(c.grossAmount) || 0), 0);
      
      setStats({
        exportersCount: exp.length,
        carriersCount: car.length,
        bookingsCount: bkg.length,
        gmvTotal: gmv
      });
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    updateStats();

    window.addEventListener('cargoshare_data_synced', updateStats);
    window.addEventListener('storage', updateStats);
    return () => {
      window.removeEventListener('cargoshare_data_synced', updateStats);
      window.removeEventListener('storage', updateStats);
    };
  }, [activeTab]);

  React.useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      showToast('Access denied. Admin privileges required.', 'error');
      navigate('/login');
    }
  }, [loading, isAuthenticated, user, navigate, showToast]);

  const handleLogout = () => {
    showToast('Signed out of Administrator Console', 'info');
    navigate('/login');
  };

  if (loading || !isAuthenticated || user?.role !== 'admin') {
    return null;
  }

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
                  <CountUp end={stats.exportersCount} suffix=" SMEs" />
                </div>
                <p className="text-[11px] text-purple-600 font-bold mt-0.5">Active SME Directory</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Partner Carriers</p>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  <CountUp end={stats.carriersCount} suffix=" Lines" />
                </div>
                <p className="text-[11px] text-blue-600 font-medium mt-0.5">Commercial Carriers</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Ship className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform GMV</p>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  <CountUp 
                    prefix="₹" 
                    end={stats.gmvTotal >= 1000 ? Math.round(stats.gmvTotal / 100) / 10 : stats.gmvTotal} 
                    decimals={stats.gmvTotal >= 1000 ? 1 : 0} 
                    suffix={stats.gmvTotal >= 1000 ? "K" : ""} 
                  />
                </div>
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Total Freight Settled</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <IndianRupee className="w-5 h-5" />
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

              {/* Quick Launch Control Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                
                {/* Exporter Bookings Quick Card */}
                <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-purple-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3 z-10">
                    <div className="inline-flex p-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-300">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">All Exporter Booked Details</h3>
                      <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                        Inspect every exporter cargo reservation, 25% advance escrow deposits, carrier verification approvals, and remaining 75% balance payments.
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 z-10 flex justify-between items-center">
                    <span className="text-xs font-semibold text-purple-300">Complete Freight Ledger Active</span>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>View All Bookings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Carrier Details Quick Card */}
                <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3 z-10">
                    <div className="inline-flex p-3 bg-blue-500/20 border border-blue-500/30 rounded-2xl text-blue-300">
                      <Ship className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">All Shipping Carrier Details</h3>
                      <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                        Access detailed directories of partner shipping lines, vessel fleets, listed container space (CBM), FMC/IMO compliance, and active exporter allocations.
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 z-10 flex justify-between items-center">
                    <span className="text-xs font-semibold text-blue-300">5 Commercial Liner Fleets</span>
                    <button
                      onClick={() => setActiveTab('carriers')}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>View All Carrier Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
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
