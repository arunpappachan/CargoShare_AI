import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ship, Mail, ArrowRight, Check, Shield, Globe, Anchor, Twitter, Linkedin, Github } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid business email address.');
      return;
    }
    setSubscribed(true);
    toast.success('Thank you for subscribing to CargoShare AI Trade Dispatch!');
    setEmail('');
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-slate-800/80">
          
          {/* Brand & Mission (Col 1-4) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="p-2.5 bg-brand-600 rounded-xl text-white group-hover:bg-brand-500 transition-colors shadow-md shadow-brand-500/20">
                <Ship className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                CargoShare <span className="text-brand-400">AI</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed">
              The next-generation AI-powered container-sharing marketplace. Unlocking unutilized ocean capacity for SMEs while maximizing slot profitability for global carriers.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-brand-400" />
                <span>ISO 27001 Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-brand-400" />
                <span>Global Ocean Routing</span>
              </div>
            </div>

            {/* Social Channels */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="CargoShare on Twitter"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-brand-400 hover:border-brand-500/40 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="CargoShare on LinkedIn"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-brand-400 hover:border-brand-500/40 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/arunpappachan/CargoShare_AI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="CargoShare on GitHub"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-brand-400 hover:border-brand-500/40 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="/"
                aria-label="CargoShare Platform"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-brand-400 hover:border-brand-500/40 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links (Col 5-6) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/#features" className="hover:text-brand-400 transition-colors">
                  Container Sharing
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-brand-400 transition-colors">
                  AI Match Engine
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Live GPS Tracking
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-400 transition-colors">
                  Customs Clearance
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Smart Escrow Pay
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions / Portals (Col 7-8) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">
              Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/dashboard/exporter" className="hover:text-brand-400 transition-colors">
                  Exporter SME Portal
                </Link>
              </li>
              <li>
                <Link to="/dashboard/carrier" className="hover:text-brand-400 transition-colors">
                  Ocean Carrier Fleet Hub
                </Link>
              </li>
              <li>
                <Link to="/dashboard/admin" className="hover:text-brand-400 transition-colors">
                  Admin Operations
                </Link>
              </li>
              <li>
                <a href="/#about" className="hover:text-brand-400 transition-colors">
                  About CargoShare
                </a>
              </li>
              <li>
                <a href="/#testimonials" className="hover:text-brand-400 transition-colors">
                  Customer Case Studies
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter (Col 9-12) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">
              Maritime Trade Dispatch
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get weekly insights on global container rates, blank sailings, and trade lane capacity updates.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter work email..."
                  className="w-full pl-10 pr-24 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {subscribed ? <Check className="w-3.5 h-3.5" /> : <span>Join</span>}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CargoShare AI Inc. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a href="#about" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#about" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#about" className="hover:text-slate-300 transition-colors">Security & Compliance</a>
            <a href="#about" className="hover:text-slate-300 transition-colors">Cookie Settings</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
