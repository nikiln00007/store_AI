import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore.js';
import { api } from '../../lib/api.js';
import { downloadPurchaseOrderPDF, downloadInvoicePDF } from '../../lib/pdfGenerator.js';
import { 
  Sparkles, X, Send, Bot, CheckCircle2, Loader2, Volume2, 
  ArrowRight, Package, Receipt, BarChart3, HelpCircle, Phone, Download 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AICommandModal: React.FC = () => {
  const { isAIModalOpen, closeAIModal, aiPrompt, setAIPrompt } = useStore();
  const navigate = useNavigate();
  const [input, setInput] = useState(aiPrompt);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    if (aiPrompt && isAIModalOpen) {
      setInput(aiPrompt);
      executeCommand(aiPrompt);
    }
  }, [aiPrompt, isAIModalOpen]);

  if (!isAIModalOpen) return null;

  const executeCommand = async (cmdText?: string) => {
    const cmd = cmdText || input;
    if (!cmd.trim()) return;
    
    setLoading(true);
    setAiResponse(null);
    setActiveStepIndex(0);
    setActionSuccess('');

    // Simulate step animation while API call runs
    const timer1 = setTimeout(() => setActiveStepIndex(1), 700);
    const timer2 = setTimeout(() => setActiveStepIndex(2), 1500);

    try {
      const res = await api.post('/ai/command', { prompt: cmd });
      if (res.data.success) {
        setAiResponse(res.data.aiResponse);
        setActiveStepIndex(3); // all steps completed
      }
    } catch (err: any) {
      alert('AI processing error: ' + (err.response?.data?.error || err.message));
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setLoading(false);
    }
  };

  const handleSendPO = async (po: any) => {
    try {
      const id = po._id || po.id;
      const res = await api.post(`/suppliers/po/${id}/send`);
      if (res.data.success) {
        setActionSuccess(res.data.message || '✅ Purchase Order dispatched via WhatsApp!');
      }
    } catch (err) {
      alert('Failed to send PO');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 selection:bg-terracotta-200 animate-fadeIn">
      <div className="bg-[#1F2521] text-white rounded-3xl max-w-2xl w-full border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#1F2521] via-[#236027] to-[#2E7D32] border-b border-white/10 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-terracotta-500 to-saffron-500 flex items-center justify-center text-white font-bold shadow-lg">
              <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <span>Store AI Command Center</span>
                <span className="text-[10px] font-extrabold bg-mint-500 text-charcoal px-2 py-0.5 rounded-full uppercase">
                  3-Agent Engine ⚡
                </span>
              </h2>
              <p className="text-xs text-mint-400 font-medium">
                Natural language business execution in English.
              </p>
            </div>
          </div>
          <button onClick={closeAIModal} className="p-2 text-white/50 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content / Chat & Visualizer */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Quick Prompts */}
          {!aiResponse && !loading && (
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-white/50 uppercase tracking-wider block">
                Try asking your assistant:
              </span>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {[
                  { title: '📦 Low Stock Reorder', desc: 'Reorder all low stock items automatically', prompt: 'Reorder all low stock items automatically' },
                  { title: '🧾 Instant Bill Maker', desc: 'Create bill for 2 Tata Salt and 1 Sugar', prompt: 'Create bill for 2 Tata Salt and 1 Sugar' },
                  { title: '📊 Monthly Profit Report', desc: 'Show me the monthly profit report', prompt: 'Show me the monthly profit report' },
                  { title: '🔍 Check Parle-G Stock', desc: 'Check stock level for Parle-G', prompt: 'Check stock level for Parle-G' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setInput(item.prompt); executeCommand(item.prompt); }}
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-terracotta-400 cursor-pointer transition-all group"
                  >
                    <div className="font-bold text-sm text-terracotta-400 group-hover:text-terracotta-300">{item.title}</div>
                    <div className="text-xs text-white/70 mt-1 font-mono">"{item.desc}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Prompt Bubble */}
          {input && (loading || aiResponse) && (
            <div className="flex justify-end">
              <div className="bg-gradient-to-r from-terracotta-500 to-saffron-500 text-white font-semibold text-sm px-4 py-3 rounded-2xl rounded-tr-none shadow-md max-w-[85%] flex items-center gap-2">
                <span>"{input}"</span>
              </div>
            </div>
          )}

          {/* Step-by-Step Multi-Agent Visualizer (2026 Standards) */}
          {(loading || aiResponse) && (
            <div className="bg-black/30 rounded-3xl p-5 border border-white/10 space-y-4">
              <div className="text-xs font-extrabold text-golden uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-4 h-4" />
                <span>Autonomous Multi-Agent Collaborative Reasoning</span>
              </div>

              <div className="space-y-3">
                {[
                  { name: '🧠 Intent Recognition Agent', role: 'Language & NLP Parsing', desc: 'Translating natural language request into actionable database queries...' },
                  { name: '📦 Inventory & Database Agent', role: 'Stock & Pricing Scan', desc: 'Scanning Mongoose database for low-stock thresholds and live GST rates...' },
                  { name: '⚡ Execution & Verification Agent', role: 'Order / Invoice Creation', desc: 'Formulating Purchase Order and preparing one-tap WhatsApp dispatch...' }
                ].map((step, idx) => {
                  const isDone = aiResponse ? true : idx < activeStepIndex;
                  const isCurr = !aiResponse && idx === activeStepIndex;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        isDone
                          ? 'bg-forest-500/10 border-forest-500/30 text-white'
                          : isCurr ? 'bg-saffron-500/10 border-saffron-500/50 text-white animate-pulse' : 'bg-white/5 border-white/5 text-white/30'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-mint-400 flex-shrink-0" />
                        ) : isCurr ? (
                          <Loader2 className="w-5 h-5 text-saffron-500 animate-spin flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs">{aiResponse && aiResponse.steps[idx] ? aiResponse.steps[idx].agentName : step.name}</span>
                          <span className="text-[10px] font-mono text-white/40">{aiResponse && aiResponse.steps[idx] ? aiResponse.steps[idx].timestamp : '10ms'}</span>
                        </div>
                        <p className="text-xs mt-1 text-white/80 font-medium">
                          {aiResponse && aiResponse.steps[idx] ? aiResponse.steps[idx].description : step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Response Narrative & Optimistic Action Modal */}
          {aiResponse && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-6 border border-terracotta-400/30 space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-cream">Store AI Response</h4>
                  <p className="text-sm text-white/90 mt-1 leading-relaxed whitespace-pre-line font-medium">
                    {aiResponse.summaryMessage}
                  </p>
                </div>
              </div>

              {/* Action Card: PO Drafted */}
              {aiResponse.actionResult?.type === 'PO_DRAFTED' && (
                <div className="bg-black/40 rounded-2xl p-4 border border-forest-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-forest-500/20 text-mint-400 px-2.5 py-1 rounded-lg border border-forest-500/30 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> Purchase Order Drafted
                    </span>
                    <span className="font-black text-sm text-white">{aiResponse.actionResult.data.poNumber}</span>
                  </div>

                  <div className="text-xs space-y-1 text-white/80 font-medium">
                    <div><strong>Supplier:</strong> {aiResponse.actionResult.data.supplierName} ({aiResponse.actionResult.data.supplierPhone})</div>
                    <div><strong>Items:</strong> {aiResponse.actionResult.data.items?.map((i:any) => `${i.qty} ${i.unit} ${i.name}`).join(', ')}</div>
                    <div><strong>Total Est. Amount:</strong> <span className="text-mint-400 font-extrabold text-sm">₹{aiResponse.actionResult.data.totalAmount.toLocaleString('en-IN')}</span></div>
                  </div>

                  {actionSuccess ? (
                    <div className="bg-forest-500/20 text-mint-400 font-extrabold text-xs p-3 rounded-xl border border-forest-500 text-center">
                      {actionSuccess}
                    </div>
                  ) : (
                    <div className="flex sm:flex-row flex-col gap-2 pt-2">
                      <button
                        onClick={() => handleSendPO(aiResponse.actionResult.data)}
                        className="flex-1 bg-gradient-to-r from-forest-500 to-mint-500 hover:from-forest-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all transform hover:scale-105"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Send PO via WhatsApp (1-Tap) 📲</span>
                      </button>
                      <button
                        onClick={() => downloadPurchaseOrderPDF(aiResponse.actionResult.data)}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>PDF</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Card: Invoice Created */}
              {aiResponse.actionResult?.type === 'INVOICE_CREATED' && (
                <div className="bg-black/40 rounded-2xl p-4 border border-terracotta-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-terracotta-500/20 text-terracotta-400 px-2.5 py-1 rounded-lg border border-terracotta-500/30 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5" /> POS Bill Created & Stored in DB
                    </span>
                    <span className="font-black text-sm text-white">{aiResponse.actionResult.data.invoiceNumber}</span>
                  </div>

                  <div className="text-xs space-y-1 text-white/80 font-medium">
                    <div><strong>Total Bill:</strong> <span className="text-terracotta-400 font-extrabold text-sm">₹{aiResponse.actionResult.data.grandTotal.toLocaleString('en-IN')}</span></div>
                    <div><strong>Net Shop Profit:</strong> <span className="text-mint-400 font-extrabold">₹{aiResponse.actionResult.data.totalProfit.toLocaleString('en-IN')}</span></div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => downloadInvoicePDF(aiResponse.actionResult.data)}
                      className="flex-1 bg-gradient-to-r from-terracotta-500 to-saffron-500 hover:from-terracotta-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all transform hover:scale-105"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download / Print Invoice PDF 📄</span>
                    </button>
                    <button
                      onClick={() => { closeAIModal(); navigate('/billing'); }}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-3 rounded-xl"
                    >
                      View POS
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Input Bar */}
        <div className="p-4 bg-black/40 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
            placeholder="Ask a follow-up question or command..."
            className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-white/40 focus:outline-none focus:border-terracotta-500"
          />
          <button
            onClick={() => executeCommand()}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-terracotta-500 to-saffron-500 hover:from-terracotta-600 text-white font-extrabold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Thinking...' : 'Send'}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
