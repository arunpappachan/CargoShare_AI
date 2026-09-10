import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ship, Globe, User, LogOut, ShieldCheck, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MagneticButton from './common/MagneticButton';

const NAV_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it Works' },
  { href: '/#testimonials', label: 'Testimonials' },
  { href: '/#about', label: 'About' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    toast.info('You have been signed out successfully.', 'Signed Out');
    setMobileOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'carrier') return '/dashboard/carrier';
    return '/dashboard/exporter';
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/85 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={closeMobile}>
            <div className="p-2 bg-brand-600 rounded-xl text-white group-hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20">
              <Ship className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              CargoShare <span className="text-brand-600">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative group py-1 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full rounded-full" />
              </a>
            ))}
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-3">

            {/* Desktop auth buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-white text-slate-700 transition-colors text-xs font-semibold"
                >
                  <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
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
              <div className="hidden md:flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors px-2 py-1"
                >
                  Sign In
                </Link>
                <MagneticButton
                  as={Link}
                  to="/register"
                  className="text-sm font-medium bg-brand-600 text-white px-5 py-2.5 rounded-xl hover:bg-brand-700 shadow-sm shadow-brand-500/20"
                >
                  Get Started
                </MagneticButton>
              </div>
            )}

            {/* Mobile hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
          
        </div>
      </div>

      {/* ───── Mobile slide-down panel ───── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-5 pt-2 border-t border-slate-200 bg-white/95 backdrop-blur-lg space-y-1">
          {/* Nav links */}
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              {link.label}
            </a>
          ))}

          {/* Divider */}
          <div className="h-px bg-slate-200 my-2" />

          {/* Auth section */}
          {isAuthenticated ? (
            <div className="space-y-1">
              <Link
                to={getDashboardPath()}
                onClick={closeMobile}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={closeMobile}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                <User className="w-4 h-4" />
                {user?.name?.split(' ')[0] || 'Profile'}
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <Link
                to="/login"
                onClick={closeMobile}
                className="block text-center px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={closeMobile}
                className="block text-center px-4 py-3 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
