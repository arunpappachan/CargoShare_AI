import React, { useState } from 'react';
import { Ship, LayoutDashboard, PlusCircle, Inbox, User, LogOut, Package, Anchor, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CarrierOverview from '../components/carrier/CarrierOverview';
import PostSpace from '../components/carrier/PostSpace';
import BookingRequests from '../components/carrier/BookingRequests';
import SidebarNav from '../components/common/SidebarNav';
import { useToast } from '../context/ToastContext';

const CARRIER_NAV_ITEMS = [
  { id: 'overview', label: 'Fleet Overview', icon: LayoutDashboard },
  { id: 'post', label: 'Post Space', icon: PlusCircle },
  { id: 'requests', label: 'Booking Requests', icon: Inbox, badge: 3 },
  { id: 'profile', label: 'Carrier Profile', icon: User },
];

export default function ShippingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: 'Oceanic Freight Ltd.',
    license: 'OF-2023-9981',
    email: 'operations@oceanicfreight.com',
    phone: '+1 (555) 123-4567'
  });

  const handleLogout = () => {
    toast.info('Signed out of Carrier Fleet Hub.', 'Signed Out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-64 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 z-20 border-r border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 z-0"></div>
        
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50 relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Ship className="w-6 h-6 text-blue-400" />
            </div>
            <span className="font-bold text-xl tracking-tight">CargoShare</span>
          </Link>
        </div>

        {/* Sliding Pill Sidebar Navigation */}
        <SidebarNav
          items={CARRIER_NAV_ITEMS}
          activeId={activeTab}
          onChange={setActiveTab}
          accent="carrier"
          className="z-10"
        />

        <div className="p-4 border-t border-slate-800/50 relative z-10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all font-medium mt-auto">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 relative z-10 min-h-screen">
        <div className="max-w-6xl mx-auto">
          
          {/* Top Carrier Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fleet in Service</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">6 Vessels</p>
                <p className="text-[11px] text-blue-600 font-bold mt-0.5">All routes on schedule</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Ship className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacity Listed</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">180 CBM</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Available for matching</p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600">
                <Package className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Bookings</p>
                <p className="text-2xl font-extrabold text-amber-600 mt-0.5">3 Requests</p>
                <p className="text-[11px] text-amber-600 font-bold mt-0.5">Requires approval</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Inbox className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slot Utilization</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">91.4%</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">+14% vs industry avg</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {activeTab === 'overview' && <CarrierOverview />}
          {activeTab === 'post' && <PostSpace />}
          {activeTab === 'requests' && <BookingRequests />}
          
          {activeTab === 'profile' && (
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="mb-6 pb-6 border-b border-slate-100 flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    OF
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Carrier Profile</h2>
                    <p className="text-slate-500">{profileData.companyName}</p>
                  </div>
                  <div className="ml-auto">
                    {isEditingProfile ? (
                      <button 
                        onClick={() => setIsEditingProfile(false)}
                        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
                      >
                        Save Changes
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="px-6 py-2 border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 font-bold rounded-xl transition-colors text-slate-600"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Company Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Company Name</label>
                      <input 
                        type="text" 
                        value={profileData.companyName} 
                        onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                        disabled={!isEditingProfile} 
                        className={`w-full px-4 py-2 rounded-xl text-slate-700 transition-colors ${!isEditingProfile ? 'bg-slate-50 border border-slate-200' : 'bg-white border-2 border-blue-500 outline-none'}`} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">License Number</label>
                      <input 
                        type="text" 
                        value={profileData.license} 
                        onChange={(e) => setProfileData({...profileData, license: e.target.value})}
                        disabled={!isEditingProfile} 
                        className={`w-full px-4 py-2 rounded-xl text-slate-700 transition-colors ${!isEditingProfile ? 'bg-slate-50 border border-slate-200' : 'bg-white border-2 border-blue-500 outline-none'}`} 
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Contact Info</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={profileData.email} 
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditingProfile} 
                        className={`w-full px-4 py-2 rounded-xl text-slate-700 transition-colors ${!isEditingProfile ? 'bg-slate-50 border border-slate-200' : 'bg-white border-2 border-blue-500 outline-none'}`} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profileData.phone} 
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditingProfile} 
                        className={`w-full px-4 py-2 rounded-xl text-slate-700 transition-colors ${!isEditingProfile ? 'bg-slate-50 border border-slate-200' : 'bg-white border-2 border-blue-500 outline-none'}`} 
                      />
                    </div>
                  </div>
                </div>
             </div>
          )}
        </div>
      </main>

    </div>
  );
}
