import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore.js';
import { api } from '../../lib/api.js';
import { LowStockBanner } from '../layout/LowStockBanner.js';
import { 
  IndianRupee, TrendingUp, AlertTriangle, Clock, Receipt, Package, 
  ArrowRight, Sparkles, PlusCircle, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, openAIModal } = useStore();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    todaySales: 4850,
    todayProfit: 1210,
    lowStockCount: 5,
    pendingKhata: 3200,
    activeOrders: 2
  });
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, invRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/invoices')
      ]);
      if (sumRes.data.success) setSummary(sumRes.data.summary);
      if (invRes.data.success) setRecentInvoices(invRes.data.invoices.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user ? user.name.split(' ')[0] : 'Rahul';
    if (hour < 12) return `Good Morning, ${name}! 🌿`;
    if (hour < 17) return `Good Afternoon, ${name}! ☀️`;
    return `Good Evening, ${name}! 🌅`;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Hero Greeting Bar */}
      <div className="bg-gradient-to-r from-terracotta-500 via-saffron-500 to-terracotta-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-terracotta-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 transform -skew-x-12 pointer-events-none"></div>
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-golden/30 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider mb-1">
              <span>{user?.shopName || 'Sharma General Store'}</span>
              <span>•</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-mint-400" /> AI Protected
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight drop-shadow-sm">
              {getGreeting()}
            </h1>
            <p className="text-sm text-white/90 mt-1.5 font-medium max-w-xl">
              Your autonomous digital assistant is monitoring inventory, POS bills, and supplier purchase orders in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/billing')}
              className="bg-white text-terracotta-700 hover:bg-cream font-extrabold text-sm px-5 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 flex-shrink-0"
            >
              <PlusCircle className="w-5 h-5 text-saffron-500" />
              <span>Instant Bill (POS)</span>
            </button>
            <button
              onClick={() => openAIModal('Show my monthly profit report')}
              className="bg-black/20 hover:bg-black/30 text-white font-bold text-sm px-4 py-3 rounded-2xl transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-golden" />
              <span className="hidden sm:inline">AI Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Smart Low Stock Alert Banner */}
      <LowStockBanner lowStockCount={summary.lowStockCount} />

      {/* Summary Cards Grid (2026 Trend Colors) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Card 1: Today's Sales */}
        <div className="bg-white/90 backdrop-blur-md border border-terracotta-100 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-charcoal/60 uppercase tracking-wider">
              Today's Sales
            </span>
            <div className="w-10 h-10 rounded-xl bg-terracotta-50 flex items-center justify-center text-terracotta-600 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-charcoal">
            ₹{summary.todaySales.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-forest-600 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs yesterday</span>
          </div>
        </div>

        {/* Card 2: Today's Profit */}
        <div className="bg-white/90 backdrop-blur-md border border-forest-100 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-charcoal/60 uppercase tracking-wider">
              Today's Profit
            </span>
            <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center text-forest-600 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-golden" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-forest-600">
            ₹{summary.todayProfit.toLocaleString('en-IN')}
          </div>
          <div className="text-xs font-bold text-charcoal/60 mt-2">
            24.9% Avg Net Margin ✨
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div 
          onClick={() => navigate('/inventory?lowStock=true')}
          className="bg-white/90 backdrop-blur-md border border-red-100 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-charcoal/60 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-red-600 flex items-center gap-2">
            <span>{summary.lowStockCount}</span>
            <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Urgent</span>
          </div>
          <div className="text-xs font-bold text-terracotta-600 mt-2 flex items-center gap-1">
            <span>Click to reorder via AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Pending Khata */}
        <div 
          onClick={() => navigate('/reports')}
          className="bg-white/90 backdrop-blur-md border border-saffron-500/20 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-charcoal/60 uppercase tracking-wider">
              Pending Store Credit
            </span>
            <div className="w-10 h-10 rounded-xl bg-saffron-500/10 flex items-center justify-center text-saffron-600 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-saffron-600">
            ₹{summary.pendingKhata.toLocaleString('en-IN')}
          </div>
          <div className="text-xs font-bold text-forest-600 mt-2 flex items-center gap-1">
            <span>Send WhatsApp Reminders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* Main Section Grid: Recent Activity & Quick AI Commands */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Recent Invoices & Billing Feed */}
        <div className="md:col-span-8 bg-white/90 backdrop-blur-md border border-terracotta-100 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-terracotta-50 flex items-center justify-center text-terracotta-600 font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-charcoal">
                  Recent Billing Activity
                </h3>
                <p className="text-xs text-charcoal/60 font-medium">Real-time sync across Cash, UPI & Store Credit</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              title="Refresh Data"
              className="p-2 text-charcoal/50 hover:text-charcoal hover:bg-softgray rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm font-semibold text-charcoal/50">Loading recent activity...</div>
          ) : recentInvoices.length === 0 ? (
            <div className="py-12 text-center text-sm font-semibold text-charcoal/50">No recent transactions today. Create a bill!</div>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((inv) => (
                <div
                  key={inv._id || inv.id}
                  onClick={() => navigate('/billing')}
                  className="flex items-center justify-between p-4 rounded-2xl bg-softgray/40 hover:bg-terracotta-50/50 border border-transparent hover:border-terracotta-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      inv.paymentMethod === 'UPI' ? 'bg-forest-100 text-forest-700' :
                      inv.paymentMethod === 'Cash' ? 'bg-blue-100 text-blue-700' : 'bg-saffron-500/20 text-saffron-600'
                    }`}>
                      {inv.paymentMethod}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-charcoal flex items-center gap-2">
                        <span>{inv.customerName || 'Walking Customer'}</span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-md font-bold text-charcoal/60 border border-charcoal/10">
                          {inv.invoiceNumber}
                        </span>
                      </div>
                      <div className="text-xs text-charcoal/60 font-medium mt-0.5">
                        {inv.items?.length || 1} items ({inv.items?.map((i:any) => i.name).slice(0, 2).join(', ')})
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-base text-charcoal">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] font-bold text-forest-600">
                      +{inv.totalProfit ? `₹${inv.totalProfit} profit` : 'Paid'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-softgray flex justify-end">
            <button
              onClick={() => navigate('/billing')}
              className="text-xs font-extrabold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1"
            >
              <span>View All Invoices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Smart AI Assistant Tips & Shortcuts */}
        <div className="md:col-span-4 bg-gradient-to-br from-[#1F2521] via-[#236027] to-[#2E7D32] text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-golden font-bold text-xs uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Autonomous Assistant Tip 🌿</span>
            </div>
            <h3 className="text-lg font-black leading-snug text-cream mb-2">
              "Amul Butter & Aashirvaad Atta are running low. I drafted a PO for you!"
            </h3>
            <p className="text-xs text-white/80 leading-relaxed mb-6 font-normal">
              Store AI connects with your suppliers automatically and negotiates 7-15 days credit terms based on your excellent payment history.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <button
              onClick={() => openAIModal('Reorder low stock items automatically')}
              className="w-full bg-gradient-to-r from-terracotta-500 to-saffron-500 hover:from-terracotta-600 hover:to-saffron-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Dispatch Reorder Now</span>
            </button>
            <button
              onClick={() => navigate('/suppliers')}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Compare Supplier Prices</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
