import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ship, Mail, Lock, Briefcase, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [role, setRole] = useState('exporter');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setErrorCode('');

    try {
      const data = await login(email, password, role);
      const userRole = data.user?.role || role;

      if (userRole === 'admin') {
        navigate('/dashboard/admin');
      } else if (userRole === 'exporter') {
        navigate('/dashboard/exporter');
      } else {
        navigate('/dashboard/carrier');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-slate-50">
      
      {/* Left Image/Branding Side */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay z-0"></div>
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-brand-600 rounded-full opacity-20 blur-[150px] mix-blend-screen animate-pulseGlow z-0"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-500 rounded-full opacity-20 blur-[150px] mix-blend-screen animate-pulseGlow z-0" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/80 via-slate-900/90 to-slate-950 z-10"></div>
        
        <div className="relative z-20 text-white max-w-lg animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="relative mb-12 animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-blue-500/0 rounded-3xl blur-md"></div>
            <div className="relative bg-white/5 border border-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl">
              <div className="inline-flex p-4 bg-gradient-to-br from-brand-500 to-blue-600 rounded-2xl mb-6 shadow-lg shadow-brand-500/30">
                <Ship className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight">
                Welcome back to <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-300">CargoShare AI</span>
              </h2>
              <p className="text-lg text-slate-300/90 leading-relaxed font-light">
                Your intelligent logistics command center. Track shipments, manage shared space, and access AI-driven insights in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 relative overflow-hidden">
                <img src="https://i.pravatar.cc/100?img=33" alt="user" className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-600 relative overflow-hidden">
                <img src="https://i.pravatar.cc/100?img=47" alt="user" className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs">+</div>
            </div>
            <p>Join <strong className="text-white">10,000+</strong> global logistics professionals</p>
          </div>
        </div>
      </div>

      {/* Right Login Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Sign in to your account</h3>
            <p className="text-slate-500 text-sm">Welcome back! Please enter your details.</p>
          </div>

          {/* Login Error Alert */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-800 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <div>
                <strong className="block font-semibold">Sign In Notice</strong>
                <p className="mt-0.5 text-xs text-red-700">{errorMsg}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Role Selection (Visual selector) */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <button 
                type="button"
                onClick={() => setRole('exporter')}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  role === 'exporter' 
                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Briefcase className="w-6 h-6" />
                <span className="text-sm font-semibold">Exporter</span>
              </button>
              <button 
                type="button"
                onClick={() => setRole('carrier')}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  role === 'carrier' 
                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Ship className="w-6 h-6" />
                <span className="text-sm font-semibold">Carrier</span>
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                  placeholder="Email address (e.g. exporter@cargoshare.ai)"
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                  placeholder="Password"
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input id="remember-me" type="checkbox" defaultChecked className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                Remember Me
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign up now
            </Link>
          </div>
        </div>
      </div>
      
    </div>
  );
}
