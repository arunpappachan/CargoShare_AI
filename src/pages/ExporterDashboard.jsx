import React, { useState } from 'react';
import { Search, List, User, Ship, LogOut, MapPin, FileText, Box, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SearchSpace from '../components/exporter/SearchSpace';
import BookingsList from '../components/exporter/BookingsList';
import ShipmentTracking from '../components/exporter/ShipmentTracking';
import DocumentManagement from '../components/exporter/DocumentManagement';
import Profile from './Profile';
import SidebarNav from '../components/common/SidebarNav';
import CountUp from '../components/common/CountUp';
import { useToast } from '../context/ToastContext';

const NAV_ITEMS = [
  { key: 'search', id: 'search', label: 'Search Space', icon: Search },
  { key: 'bookings', id: 'bookings', label: 'My Bookings', icon: List, badge: 4 },
  { key: 'tracking', id: 'tracking', label: 'Track Cargo', icon: MapPin },
  { key: 'documents', id: 'documents', label: 'Docs & Customs', icon: FileText },
  { key: 'profile', id: 'profile', label: 'Profile', icon: User },
];

export default function ExporterDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Can be extended to booking status changes and customs document notifications
    showToast('Signed out of Exporter Portal', 'info');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-64 w-[500px] h-[500px] bg-brand-400/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 z-20 border-r border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950 z-0"></div>
        
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50 relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="p-2 bg-brand-500/20 rounded-xl">
              <Ship className="w-6 h-6 text-brand-400" />
            </div>
            <span className="font-bold text-xl tracking-tight">CargoShare <span className="text-brand-400">AI</span></span>
          </Link>
        </div>

        {/* Sliding Pill Sidebar Navigation */}
        <SidebarNav
          items={NAV_ITEMS}
          activeKey={activeTab}
          onChange={setActiveTab}
          accentClass="bg-gradient-to-r from-brand-600 to-brand-500 shadow-brand-500/25"
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
        <div className="max-w-5xl mx-auto">

          {/* Quick Metrics Bar across Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Bookings</p>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  <CountUp end={4} suffix=" Slots" />
                </div>
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">2 in transit</p>
              </div>
              <div className="p-3 rounded-xl bg-brand-50 text-brand-600">
                <Box className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Space Allocated</p>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  <CountUp end={28.4} decimals={1} suffix=" CBM" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Across 3 carriers</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Ship className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Savings</p>
                <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                  <CountUp prefix="$" end={3420} duration={2000} />
                </div>
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">-34% vs FCL charter</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance</p>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  <CountUp end={100} suffix="%" />
                </div>
                <p className="text-[11px] text-brand-600 font-bold mt-0.5">Customs pre-cleared</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {activeTab === 'search' && <SearchSpace />}
          {activeTab === 'bookings' && <BookingsList />}
          {activeTab === 'tracking' && <ShipmentTracking />}
          {activeTab === 'documents' && <DocumentManagement />}
          {activeTab === 'profile' && (
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="mb-6 pb-6 border-b border-slate-100 flex items-center gap-4">
                  <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    JD
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
                    <p className="text-slate-500">Manage your exporter account settings.</p>
                  </div>
                </div>
                
                {/* Embed the existing profile form here for dashboard continuity */}
                <Profile />
             </div>
          )}
        </div>
      </main>
      
    </div>
  );
}
