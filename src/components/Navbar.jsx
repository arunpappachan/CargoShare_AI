import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ship, Globe, User, LogOut, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MagneticButton from './common/MagneticButton';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    toast.info('You have been signed out successfully.', 'Signed Out');
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'carrier') return '/dashboard/carrier';
    return '/dashboard/exporter';
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/85 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-brand-600 rounded-xl text-white group-hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20">
              <Ship className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              CargoShare <span className="text-brand-600">AI</span>
            </span>
          </Link>

          {/* Navigation Links with animated sliding underline */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/#features"
              className="relative group py-1 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              <span>Features</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
            <a
              href="/#how-it-works"
              className="relative group py-1 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              <span>How it Works</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
            <a
              href="/#testimonials"
              className="relative group py-1 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              <span>Testimonials</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
            <a
              href="/#about"
              className="relative group py-1 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              <span>About</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
          </div>

          {/* Right Action Section: Auth State */}
          <div className="flex items-center gap-3">

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-white text-slate-700 transition-colors text-xs font-semibold"
                >
                  <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'Profile'}</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors px-2 py-1"
                >
                  Sign In
                </Link>
                <MagneticButton
                  to="/register"
                  className="text-sm font-medium bg-brand-600 text-white px-5 py-2.5 rounded-xl hover:bg-brand-700 shadow-sm shadow-brand-500/20"
                >
                  Get Started
                </MagneticButton>
              </div>
            )}

          </div>
          
        </div>
      </div>
    </nav>
  );
}
