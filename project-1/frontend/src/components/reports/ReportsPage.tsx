import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore.js';
import { api } from '../../lib/api.js';
import { 
  BarChart3, TrendingUp, Sparkles, Download, ArrowUpRight, 
  AlertCircle, CheckCircle2, DollarSign, PieChart as PieChartIcon 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Cell, PieChart, Pie, Legend, LineChart, Line 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const ReportsPage: React.FC = () => {
  const { openAIModal } = useStore();
  const navigate = useNavigate();
  const [charts, setCharts] = useState<any>({
    revenueTrend: [],
    categoryBreakdown: [],
    topItems: []
  });
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [chartRes, insRes] = await Promise.all([
        api.get('/analytics/charts'),
        api.get('/analytics/ai-insights')
      ]);
      if (chartRes.data.success) setCharts(chartRes.data.charts);
      if (insRes.data.success) setInsights(insRes.data.insights);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    window.open('http://localhost:5000/api/analytics/export', '_blank');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-terracotta-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-terracotta-600" />
            <span>AI Reports & Profit Analytics</span>
          </h1>
          <p className="text-xs text-charcoal/60 font-medium mt-1">
            Real-time revenue trends, category net margins, and narrative AI business growth recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="bg-softgray hover:bg-terracotta-50 text-charcoal font-bold text-xs px-4 py-2.5 rounded-xl border border-charcoal/10 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-terracotta-600" />
            <span>Export Excel / CSV</span>
          </button>
          <button
            onClick={() => openAIModal('Show my monthly profit report')}
            className="bg-gradient-to-r from-terracotta-500 to-saffron-500 hover:from-terracotta-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI Analyst</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm font-bold text-charcoal/40">Loading analytics & charts...</div>
      ) : (
        <>
          {/* CHARTS SECTION */}
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* Left 7 Cols: 7-Day Revenue & Profit Trend */}
            <div className="lg:col-span-7 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-terracotta-100 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-extrabold text-base text-charcoal flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-forest-600" />
                    <span>7-Day Revenue & Net Profit Trend</span>
                  </h3>
                  <p className="text-xs text-charcoal/60 font-medium">Daily comparison in Indian Rupees (₹)</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-terracotta-600">
                    <span className="w-3 h-3 bg-terracotta-500 rounded-full inline-block"></span> Sales
                  </span>
                  <span className="flex items-center gap-1.5 text-forest-600">
                    <span className="w-3 h-3 bg-forest-500 rounded-full inline-block"></span> Profit
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} />
                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2521', color: '#fff', borderRadius: '12px', border: 'none' }}
                      formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, '']}
                    />
                    <Bar dataKey="sales" fill="#E07A5F" radius={[6, 6, 0, 0]} name="Sales" />
                    <Bar dataKey="profit" fill="#2E7D32" radius={[6, 6, 0, 0]} name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right 5 Cols: Category Sales Distribution */}
            <div className="lg:col-span-5 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-terracotta-100 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-charcoal flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-saffron-600" />
                  <span>Category Sales Share</span>
                </h3>
                <p className="text-xs text-charcoal/60 font-medium">Which items generate the most cashflow</p>
              </div>

              <div className="h-64 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.categoryBreakdown?.map((entry: any, idx: number) => (
                        <Cell key={`cell-${idx}`} fill={entry.color || '#E07A5F'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2521', color: '#fff', borderRadius: '12px', border: 'none' }}
                      formatter={(val: any) => [`${val}% Share`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-softgray text-xs font-semibold">
                {charts.categoryBreakdown?.map((cat: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }}></span>
                    <span className="text-charcoal/80 truncate">{cat.name}:</span>
                    <span className="font-extrabold text-charcoal">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* AI NARRATIVE BUSINESS INSIGHTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-charcoal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-golden animate-spin" style={{ animationDuration: '8s' }} />
                <span>AI Narrative Growth Recommendations</span>
              </h3>
              <span className="text-xs font-bold text-forest-600 bg-forest-50 px-3 py-1 rounded-full">
                Updated Real-Time 🌿
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {insights.map((ins) => (
                <div
                  key={ins.id}
                  className={`bg-white/90 backdrop-blur-md rounded-3xl p-6 border transition-all hover:shadow-xl flex flex-col justify-between ${
                    ins.type === 'growth' ? 'border-forest-200 bg-gradient-to-b from-forest-50/30 to-white' :
                    ins.type === 'warning' ? 'border-red-200 bg-gradient-to-b from-red-50/30 to-white' : 'border-saffron-500/20 bg-gradient-to-b from-saffron-50/20 to-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        ins.type === 'growth' ? 'bg-forest-100 text-forest-800' :
                        ins.type === 'warning' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ins.type.toUpperCase()} INSIGHT
                      </span>
                      {ins.type === 'growth' && <TrendingUp className="w-4 h-4 text-forest-600" />}
                      {ins.type === 'warning' && <AlertCircle className="w-4 h-4 text-red-600 animate-bounce" />}
                      {ins.type === 'tip' && <Sparkles className="w-4 h-4 text-saffron-600" />}
                    </div>

                    <h4 className="font-extrabold text-base text-charcoal leading-snug">
                      {ins.titleEn || ins.title}
                    </h4>
                    <p className="text-xs text-charcoal/70 font-medium mt-2 leading-relaxed">
                      {ins.descriptionEn || ins.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (ins.actionLink === '/ai') openAIModal('Reorder low stock items automatically');
                      else navigate(ins.actionLink || '/');
                    }}
                    className={`mt-6 w-full py-2.5 rounded-xl font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all transform hover:scale-105 ${
                      ins.type === 'growth' ? 'bg-forest-600 text-white hover:bg-forest-700' :
                      ins.type === 'warning' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gradient-to-r from-terracotta-500 to-saffron-500 text-white'
                    }`}
                  >
                    <span>{ins.actionText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* TOP SELLING ITEMS TABLE */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-terracotta-100 shadow-md">
            <h3 className="font-extrabold text-base text-charcoal mb-4">Top Revenue Generating Items Today</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-softgray text-charcoal font-extrabold">
                    <th className="p-3 rounded-l-xl">Rank</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Units Sold Today</th>
                    <th className="p-3 rounded-r-xl text-right">Total Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-softgray font-semibold text-charcoal/80">
                  {charts.topItems?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-terracotta-50/30">
                      <td className="p-3 font-extrabold text-terracotta-600">#{idx + 1}</td>
                      <td className="p-3 font-bold text-charcoal">{item.name}</td>
                      <td className="p-3">{item.sold} Units</td>
                      <td className="p-3 text-right font-black text-forest-600">₹{item.revenue?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
