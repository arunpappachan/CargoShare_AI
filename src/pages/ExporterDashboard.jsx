import React, { useState } from 'react';
import { Search, List, User, Ship, LogOut, MapPin, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SearchSpace from '../components/exporter/SearchSpace';
import BookingsList from '../components/exporter/BookingsList';
import ShipmentTracking from '../components/exporter/ShipmentTracking';
import DocumentManagement from '../components/exporter/DocumentManagement';
import Profile from './Profile';

export default function ExporterDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const navigate = useNavigate();

  const handleLogout = () => {
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

        <nav className="flex-1 px-4 py-8 space-y-3 relative z-10">
          <button 
            onClick={() => setActiveTab('search')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'search' ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25 border border-brand-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Search className="w-5 h-5" /> Search Space
          </button>
          
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'bookings' ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25 border border-brand-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <List className="w-5 h-5" /> My Bookings
          </button>

          <button 
            onClick={() => setActiveTab('tracking')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'tracking' ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25 border border-brand-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <MapPin className="w-5 h-5" /> Track Cargo
          </button>

          <button 
            onClick={() => setActiveTab('documents')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'documents' ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25 border border-brand-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <FileText className="w-5 h-5" /> Docs & Customs
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${activeTab === 'profile' ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25 border border-brand-400/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <User className="w-5 h-5" /> Profile
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
        <div className="max-w-5xl mx-auto">
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
