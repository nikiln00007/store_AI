import React, { useState } from 'react';
import { useStore } from '../../store/useStore.js';
import { api } from '../../lib/api.js';
import { Store, Sparkles, Phone, Lock, Mail, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const { setAuth, setLanguage } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp'>('login');

  const [form, setForm] = useState({
    email: 'rahul@store.ai',
    password: 'store2026',
    phone: '9820123456',
    name: 'Rahul Sharma',
    shopName: 'Sharma General Store',
    shopType: 'Retail & Medical Superstore',
    city: 'Mumbai'
  });

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/demo-login');
      if (res.data.success) {
        setAuth(res.data.token, res.data.user);
        setLanguage('en');
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const res = await api.post(endpoint, form);
      if (res.data.success) {
        setAuth(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-[#FAF6F0] to-[#E8F5E9] flex items-center justify-center p-4 selection:bg-terracotta-200">
      <div className="max-w-4xl w-full grid md:grid-cols-12 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-terracotta-100">
        
        {/* Left Side: Brand Story & Demo Highlights */}
        <div className="md:col-span-6 bg-gradient-to-br from-[#1F2521] via-[#236027] to-[#2E7D32] text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-saffron-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-terracotta-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-tr from-terracotta-500 to-saffron-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Store className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                  Store <span className="bg-gradient-to-r from-terracotta-400 to-saffron-400 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow"><Sparkles className="w-3 h-3"/> AI</span>
                </h1>
                <p className="text-xs text-mint-400 font-semibold">Smart Autonomous Store Assistant</p>
              </div>
            </div>

            <h2 className="text-xl lg:text-2xl font-extrabold leading-snug mb-4 text-cream">
              "The most reliable autonomous business assistant for your store."
            </h2>
            <p className="text-sm text-white/80 leading-relaxed mb-6 font-normal">
              Manage inventory, generate instant POS bills, automate low-stock purchase orders via WhatsApp, and manage store credit — with zero learning curve.
            </p>

            <div className="space-y-3 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-white/90">
                <CheckCircle2 className="w-4 h-4 text-mint-400 flex-shrink-0" />
                <span>2026 Trend-Forward aesthetics with large touch targets</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-white/90">
                <CheckCircle2 className="w-4 h-4 text-mint-400 flex-shrink-0" />
                <span>Autonomous 3-Agent AI Command Center</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-white/90">
                <CheckCircle2 className="w-4 h-4 text-mint-400 flex-shrink-0" />
                <span>Instant PDF Invoices & WhatsApp PO dispatch</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
            <span>Built for modern retail store owners</span>
            <span className="flex items-center gap-1 text-mint-400 font-bold"><ShieldCheck className="w-3.5 h-3.5"/> 100% Offline Capable Demo</span>
          </div>
        </div>

        {/* Right Side: Auth Form & Prominent Try Demo */}
        <div className="md:col-span-6 p-8 lg:p-10 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-charcoal tracking-tight mb-1">
              Welcome Back! 👋
            </h3>
            <p className="text-xs font-medium text-charcoal/60">
              Access your digital store assistant in less than 3 seconds.
            </p>
          </div>

          {/* Prominent Try Demo Button (Pre-filled Rahul Sharma) */}
          <div className="bg-gradient-to-br from-terracotta-50 to-saffron-50 border-2 border-terracotta-300 rounded-2xl p-4 mb-6 shadow-md relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-terracotta-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
                ⭐ Recommended Demo
              </span>
              <span className="text-xs font-bold text-terracotta-800">No Signup Required</span>
            </div>
            <div className="flex items-center gap-3 my-2">
              <div className="w-10 h-10 rounded-full bg-terracotta-500 text-white font-bold flex items-center justify-center text-base shadow">
                R
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-charcoal">Rahul Sharma (Retail & Medical Store)</h4>
                <p className="text-xs text-charcoal/70">Shop No. 4, MG Road, Andheri West, Mumbai</p>
              </div>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-terracotta-500 via-saffron-500 to-terracotta-600 hover:from-terracotta-600 hover:to-saffron-600 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-terracotta-500/30 flex items-center justify-center gap-2 transition-all transform group-hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{loading ? 'Entering Store AI...' : '🚀 Try 1-Click Demo Now (Pre-filled)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex py-3 items-center mb-6">
            <div className="flex-grow border-t border-softgray"></div>
            <span className="flex-shrink mx-3 text-xs font-bold text-charcoal/40 uppercase">Or login manually</span>
            <div className="flex-grow border-t border-softgray"></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">Email or Phone Number</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="rahul@store.ai or 9820123456"
                  className="w-full bg-softgray/50 border border-charcoal/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-terracotta-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {authMode !== 'otp' && (
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-softgray/50 border border-charcoal/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-terracotta-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-charcoal hover:bg-black text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Processing...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-medium text-charcoal/60">
            Forgot password or need help? <span className="text-terracotta-600 font-bold cursor-pointer hover:underline" onClick={handleDemoLogin}>Use Demo Login above</span>
          </div>
        </div>

      </div>
    </div>
  );
};
