import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ship, Mail, Lock, Building, Briefcase, ChevronRight, User, Globe, Eye, EyeOff, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [role, setRole] = useState('exporter'); // 'exporter' or 'carrier'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    phone: '',
    region: 'apac',
  });

  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      toast.warning('Password must be at least 8 characters long.');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setErrorMsg('Phone number must be exactly 10 digits and only contain numbers.');
      toast.warning('Phone number must be exactly 10 digits.');
      return;
    }
    if (formData.phone === '0000000000') {
      setErrorMsg('Phone number cannot be all zeros.');
      toast.warning('Phone number cannot be all zeros.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await register({
        ...formData,
        role,
      });

      toast.success('Your CargoShare account was created successfully!', 'Welcome Aboard');

      // Redirect directly to the user's workspace dashboard
      if (role === 'carrier') {
        navigate('/dashboard/carrier');
      } else {
        navigate('/dashboard/exporter');
      }
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setErrorMsg(msg);
      toast.error(msg, 'Registration Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-slate-50">
      
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 my-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Create an Account</h3>
            <p className="text-slate-500 text-sm">Join CargoShare AI today.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-800 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Role Selection */}
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
            
            <div className="h-px bg-slate-100 my-3"></div>

            {/* Dynamic Fields Based on Role */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Apex Exports Ltd."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200 bg-slate-50 focus:bg-white text-sm shadow-sm" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200 bg-slate-50 focus:bg-white text-sm shadow-sm" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200 bg-slate-50 focus:bg-white text-sm shadow-sm" 
                    required 
                  />
                </div>
              </div>

              {role === 'carrier' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Operating Region</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-slate-400" />
                    </div>
                    <select 
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200 bg-slate-50 focus:bg-white text-sm shadow-sm"
                    >
                      <option value="apac">Asia-Pacific (APAC)</option>
                      <option value="emea">Europe, Middle East, Africa (EMEA)</option>
                      <option value="na">North America</option>
                      <option value="latam">Latin America</option>
                      <option value="global">Global</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Common Fields */}
            <div className="space-y-1 pt-1">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200 bg-slate-50 focus:bg-white text-sm shadow-sm"
                  required 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  minLength="8"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200 bg-slate-50 focus:bg-white text-sm shadow-sm"
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 mt-4"
            >
              {loading ? 'Creating Account...' : <>Create Account <ChevronRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Right Image Side */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-12 sticky top-0 h-screen">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay z-0"></div>
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-blue-600 rounded-full opacity-20 blur-[150px] mix-blend-screen animate-pulseGlow z-0"></div>
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-brand-500 rounded-full opacity-20 blur-[150px] mix-blend-screen animate-pulseGlow z-0" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-950/90 via-slate-900/90 to-blue-950/80 z-10"></div>
        
        <div className="relative z-20 text-white max-w-lg animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="relative animate-float" style={{ animationDelay: '0.5s' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-400/20 to-blue-500/0 rounded-3xl blur-md"></div>
            <div className="relative bg-white/5 border border-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl">
              <h2 className="text-4xl font-extrabold mb-8 leading-tight tracking-tight">
                The Future of <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-brand-300">Global Freight</span> is Shared.
              </h2>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
