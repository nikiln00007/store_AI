import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore.js';
import { api } from '../../lib/api.js';
import { downloadPurchaseOrderPDF } from '../../lib/pdfGenerator.js';
import { Supplier, PurchaseOrder, Item } from '../../types/index.js';
import { 
  Users, Plus, Phone, MessageCircle, Star, Package, 
  Send, Sparkles, Download, CheckCircle2, Search, ArrowUpRight,
  MapPin, Mail, Building2, Eye, Clock, ShieldCheck, AlertTriangle
} from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const { openAIModal } = useStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'pos' | 'compare'>('suppliers');
  const [searchQuery, setSearchQuery] = useState('');

  // PO Creation modal
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [poItems, setPoItems] = useState<{ itemId: string; name: string; qty: number; unit: string; estimatedPrice: number }[]>([]);
  const [poNotes, setPoNotes] = useState('Urgent replenishment required. Please deliver by tomorrow morning.');

  // Vendor Details & Catalog modal
  const [viewingVendorModal, setViewingVendorModal] = useState<Supplier | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [supRes, itemRes, poRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/inventory'),
        api.get('/suppliers/po')
      ]);
      if (supRes.data.success) setSuppliers(supRes.data.suppliers);
      if (itemRes.data.success) setItems(itemRes.data.items);
      if (poRes.data.success) setPos(poRes.data.purchaseOrders || poRes.data.pos || []);
    } catch (err) {
      console.error('Failed to load supplier data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPoModal = (supplier: Supplier, specificItem?: Item) => {
    setSelectedSupplier(supplier);
    if (specificItem) {
      setPoItems([{
        itemId: specificItem._id || specificItem.id || '',
        name: specificItem.name,
        qty: Math.max(20, (specificItem.minStockAlert || 10) * 2 - specificItem.stock),
        unit: specificItem.unit,
        estimatedPrice: specificItem.purchasePrice
      }]);
    } else {
      // pre-fill with items from this supplier or low stock items
      const supItems = items.filter(it => it.supplierId === (supplier._id || supplier.id) || it.stock <= it.minStockAlert);
      if (supItems.length > 0) {
        setPoItems(supItems.slice(0, 3).map(it => ({
          itemId: it._id || it.id || '',
          name: it.name,
          qty: Math.max(20, it.minStockAlert * 2 - it.stock),
          unit: it.unit,
          estimatedPrice: it.purchasePrice
        })));
      } else {
        setPoItems([{ itemId: '', name: 'Amul Butter 500g', qty: 30, unit: 'packet', estimatedPrice: 220 }]);
      }
    }
    setIsPoModalOpen(true);
  };

  const handleCreateAndSendPO = async () => {
    if (!selectedSupplier || poItems.length === 0) return;
    try {
      const payload = {
        supplierId: selectedSupplier._id || selectedSupplier.id,
        supplierName: selectedSupplier.name,
        supplierPhone: selectedSupplier.phone,
        supplierWhatsapp: selectedSupplier.whatsapp,
        notes: poNotes,
        items: poItems.map(it => ({
          ...it,
          total: it.qty * it.estimatedPrice
        }))
      };

      const res = await api.post('/suppliers/po', payload);
      if (res.data.success) {
        const po = res.data.purchaseOrder || res.data.po;
        await api.post(`/suppliers/po/${po._id || po.id}/send`);
        alert('✅ Purchase Order generated and sent to supplier WhatsApp!');
        setIsPoModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      alert('Error creating PO: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-terracotta-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal flex items-center gap-2">
            <Users className="w-6 h-6 text-forest-600" />
            <span>Smart Suppliers & Reordering</span>
          </h1>
          <p className="text-xs text-charcoal/60 font-medium mt-1">
            Compare prices across suppliers, manage credit terms, and send automated WhatsApp purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openAIModal('Reorder low stock items automatically')}
            className="bg-gradient-to-r from-forest-500 to-mint-500 hover:from-forest-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-golden" />
            <span>AI Auto-Reorder All</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-softgray pb-2">
        {[
          { id: 'suppliers', label: 'Verified Suppliers' },
          { id: 'compare', label: 'Price Advantage Compare' },
          { id: 'pos', label: 'Purchase Orders (PO)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-charcoal text-white shadow'
                : 'text-charcoal/60 hover:bg-softgray hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SUPPLIERS LIST */}
      {activeTab === 'suppliers' && (
        <div className="grid md:grid-cols-2 gap-5">
          {loading ? (
            <div className="col-span-2 py-16 text-center text-sm font-bold text-charcoal/40">Loading suppliers...</div>
          ) : suppliers.map((sup) => {
            const vendorItems = items.filter(i => (i.supplierId === (sup._id || sup.id)) || (i.supplierName === sup.name));
            return (
              <div
                key={sup._id || sup.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-terracotta-100 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-lg text-charcoal flex items-center gap-1.5">
                        <span>{sup.name}</span>
                        <span className="flex items-center text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500 mr-1" /> {sup.rating}
                        </span>
                      </h3>
                      <p className="text-xs font-semibold text-charcoal/60 mt-0.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-terracotta-500 inline" /> Contact: {sup.contactPerson} • <span className="text-forest-700 font-bold">{sup.paymentTerms}</span>
                      </p>
                    </div>

                    {sup.priceAdvantage && (
                      <span className="bg-mint-100 text-forest-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl shadow-sm">
                        {sup.priceAdvantage}
                      </span>
                    )}
                  </div>

                  {/* Enhanced Vendor Details Box */}
                  <div className="bg-softgray/50 rounded-2xl p-3 my-3 text-xs space-y-1.5 border border-charcoal/5 font-medium text-charcoal/80">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-terracotta-500 flex-shrink-0" />
                      <span className="truncate">{sup.address || 'APMC Wholesale Market, Navi Mumbai'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-charcoal/5">
                      <span className="flex items-center gap-1 text-charcoal/70">
                        <Clock className="w-3.5 h-3.5 text-saffron-600 inline" /> Avg Delivery: <strong className="text-charcoal">{sup.deliveryTimeDays || 1} Day(s)</strong>
                      </span>
                      <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-charcoal/5 font-extrabold text-forest-700">
                        <Package className="w-3.5 h-3.5 text-forest-600 inline" /> {vendorItems.length} SKUs Supplied
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 my-3">
                    {sup.categories?.map((cat, idx) => (
                      <span key={idx} className="bg-softgray text-charcoal/80 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-charcoal/5">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-softgray flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://wa.me/91${sup.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${sup.phone}`}
                      className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
                      title="Call Vendor"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingVendorModal(sup)}
                      className="bg-charcoal/5 hover:bg-charcoal text-charcoal hover:text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 border border-charcoal/10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Vendor Details & Catalog</span>
                    </button>
                    <button
                      onClick={() => handleOpenPoModal(sup)}
                      className="bg-gradient-to-r from-terracotta-500 to-saffron-500 hover:from-terracotta-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Draft PO</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PRICE COMPARISON */}
      {activeTab === 'compare' && (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-terracotta-100 shadow-md">
          <h3 className="font-extrabold text-lg text-charcoal mb-4">Supplier Price Advantage Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-softgray text-charcoal font-extrabold">
                  <th className="p-3.5 rounded-l-xl">Supplier Name</th>
                  <th className="p-3.5">Primary Categories</th>
                  <th className="p-3.5">Avg Delivery Time</th>
                  <th className="p-3.5">Credit Terms</th>
                  <th className="p-3.5">Price Advantage / Margin</th>
                  <th className="p-3.5 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-softgray font-semibold text-charcoal/80">
                {suppliers.map((s) => (
                  <tr key={s._id || s.id} className="hover:bg-terracotta-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-charcoal">{s.name}</td>
                    <td className="p-3.5">{s.categories?.join(', ')}</td>
                    <td className="p-3.5">{s.deliveryTimeDays || 1} Day(s)</td>
                    <td className="p-3.5 text-forest-700 font-bold">{s.paymentTerms}</td>
                    <td className="p-3.5"><span className="bg-mint-100 text-forest-800 px-2 py-0.5 rounded font-extrabold">{s.priceAdvantage || 'Standard'}</span></td>
                    <td className="p-3.5 text-right">
                      <button onClick={() => handleOpenPoModal(s)} className="text-terracotta-600 font-extrabold hover:underline">
                        Order Now →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PURCHASE ORDERS LIST */}
      {activeTab === 'pos' && (
        <div className="space-y-3">
          {pos.length === 0 ? (
            <div className="py-16 text-center bg-white/60 rounded-3xl border border-terracotta-100 font-bold text-charcoal/50">
              No Purchase Orders dispatched yet. Click "Draft PO" above!
            </div>
          ) : pos.map((po) => (
            <div key={po._id || po.id} className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-terracotta-100 shadow-md flex sm:flex-row flex-col items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-charcoal">{po.poNumber}</span>
                  <span className="text-[10px] font-bold bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full">{po.status}</span>
                </div>
                <div className="text-xs font-semibold text-charcoal/70 mt-1">
                  Supplier: <strong>{po.supplierName}</strong> • Date: {new Date(po.orderDate || Date.now()).toLocaleDateString('en-IN')}
                </div>
                <div className="text-xs text-charcoal/50 mt-0.5">
                  Items: {po.items?.map(i => `${i.qty} ${i.unit} ${i.name}`).join(', ')}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-[10px] text-charcoal/40 font-bold uppercase">Est. Amount</div>
                  <div className="font-black text-base text-forest-600">₹{po.totalAmount.toLocaleString('en-IN')}</div>
                </div>
                <button
                  onClick={() => downloadPurchaseOrderPDF(po)}
                  className="bg-softgray hover:bg-terracotta-50 text-charcoal font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-terracotta-600" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DRAFT PO MODAL */}
      {isPoModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-terracotta-100 overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-softgray">
              <h3 className="text-lg font-black text-charcoal">Draft Purchase Order</h3>
              <button onClick={() => setIsPoModalOpen(false)} className="text-charcoal/40 hover:text-charcoal font-bold text-lg">✕</button>
            </div>

            <div className="bg-softgray/50 p-3 rounded-2xl text-xs space-y-1">
              <div><strong>Supplier:</strong> {selectedSupplier.name} ({selectedSupplier.contactPerson})</div>
              <div><strong>WhatsApp:</strong> +91 {selectedSupplier.whatsapp}</div>
            </div>

            <div className="space-y-2 max-h-[35vh] overflow-y-auto">
              <label className="block text-xs font-bold text-charcoal">Order Items *</label>
              {poItems.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-softgray/30 p-2 rounded-xl text-xs font-semibold">
                  <span className="flex-1">{it.name}</span>
                  <input
                    type="number"
                    value={it.qty}
                    onChange={(e) => {
                      const updated = [...poItems];
                      updated[idx].qty = Number(e.target.value) || 0;
                      setPoItems(updated);
                    }}
                    className="w-16 bg-white border rounded px-2 py-1 text-right"
                  />
                  <span className="text-charcoal/50">{it.unit}</span>
                  <span className="w-16 text-right font-bold text-forest-600">₹{it.qty * it.estimatedPrice}</span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Notes / Instructions</label>
              <textarea
                rows={2}
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                className="w-full bg-softgray/40 border border-charcoal/10 rounded-xl p-2.5 text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-softgray">
              <button onClick={() => setIsPoModalOpen(false)} className="px-4 py-2 bg-softgray rounded-xl text-xs font-bold text-charcoal">Cancel</button>
              <button
                onClick={handleCreateAndSendPO}
                className="px-5 py-2 bg-gradient-to-r from-forest-500 to-mint-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send via WhatsApp 🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR DETAILS & CATALOG MODAL */}
      {viewingVendorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF9F6] rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-terracotta-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-charcoal via-[#232B25] to-charcoal text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-terracotta-500 to-saffron-500 flex items-center justify-center text-white font-black shadow-lg text-lg">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black">{viewingVendorModal.name}</h2>
                    <span className="bg-yellow-400 text-charcoal text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-charcoal" /> {viewingVendorModal.rating}
                    </span>
                  </div>
                  <p className="text-xs text-mint-400 font-semibold mt-0.5">
                    Verified Store AI Supplier Partner • {viewingVendorModal.categories?.join(' • ')}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingVendorModal(null)} className="p-2 text-white/60 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold">✕</button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto grid lg:grid-cols-12 gap-6">
              
              {/* Left 5 Cols: Vendor Profile Scorecard & SLA */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-terracotta-100 shadow-sm space-y-3">
                  <h4 className="font-black text-sm text-charcoal flex items-center gap-1.5 border-b border-softgray pb-2.5">
                    <ShieldCheck className="w-4 h-4 text-forest-600" />
                    <span>Vendor Contact Profile</span>
                  </h4>
                  <div className="text-xs space-y-2 font-medium text-charcoal/80">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/60">Contact Person:</span>
                      <strong className="text-charcoal font-bold">{viewingVendorModal.contactPerson}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/60">Phone Number:</span>
                      <strong className="text-charcoal font-bold">+91 {viewingVendorModal.phone}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/60">WhatsApp Line:</span>
                      <strong className="text-green-700 font-bold">+91 {viewingVendorModal.whatsapp}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/60">Email Address:</span>
                      <strong className="text-charcoal font-bold truncate max-w-[180px]">{viewingVendorModal.email || 'partner@supplier.ai'}</strong>
                    </div>
                    <div className="pt-2 border-t border-softgray flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-terracotta-500 flex-shrink-0 mt-0.5" />
                      <span>{viewingVendorModal.address || 'APMC Wholesale Market, Sector 19, Vashi, Navi Mumbai, Maharashtra'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-forest-50 to-mint-50/30 rounded-2xl p-5 border border-forest-200/60 shadow-sm space-y-3">
                  <h4 className="font-black text-sm text-forest-900 flex items-center gap-1.5 border-b border-forest-200/50 pb-2">
                    <Clock className="w-4 h-4 text-forest-700" />
                    <span>Commercial SLA & Terms</span>
                  </h4>
                  <div className="text-xs space-y-2 font-semibold text-forest-900/90">
                    <div className="flex items-center justify-between">
                      <span>Payment Credit Terms:</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-forest-300 text-forest-800 font-extrabold">{viewingVendorModal.paymentTerms}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg Fulfillment Speed:</span>
                      <strong className="text-forest-800">{viewingVendorModal.deliveryTimeDays || 1} Business Day(s)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Price Advantage:</span>
                      <span className="text-terracotta-600 font-black">{viewingVendorModal.priceAdvantage || 'Standard Retail Margin'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Minimum Order Amount:</span>
                      <strong className="text-charcoal">₹2,000 (Free Delivery)</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-forest-200/40">
                      <span>GSTIN Number:</span>
                      <span className="font-mono font-bold text-charcoal">27AABCU9603R1ZM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Bank UPI Settlement:</span>
                      <span className="font-mono font-bold text-forest-800">settlement@okaxis</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/91${viewingVendorModal.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      const sup = viewingVendorModal;
                      setViewingVendorModal(null);
                      handleOpenPoModal(sup);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-terracotta-500 to-saffron-500 hover:from-terracotta-600 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Draft PO Now</span>
                  </button>
                </div>
              </div>

              {/* Right 7 Cols: Supplied Products Catalog */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-terracotta-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-softgray">
                  <div>
                    <h4 className="font-black text-sm text-charcoal flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-terracotta-600" />
                      <span>Supplied Products Catalog</span>
                    </h4>
                    <p className="text-[11px] text-charcoal/60 font-medium">Live stock levels in your shop & contractual pricing</p>
                  </div>
                  <span className="bg-softgray text-charcoal font-extrabold text-xs px-3 py-1 rounded-full border border-charcoal/5">
                    {items.filter(i => (i.supplierId === (viewingVendorModal._id || viewingVendorModal.id)) || (i.supplierName === viewingVendorModal.name)).length} SKUs
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[50vh] space-y-2 pr-1">
                  {items
                    .filter(i => (i.supplierId === (viewingVendorModal._id || viewingVendorModal.id)) || (i.supplierName === viewingVendorModal.name))
                    .map((item) => {
                      const isLowStock = item.stock <= (item.minStockAlert || 10);
                      return (
                        <div
                          key={item._id || item.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isLowStock ? 'bg-red-50/50 border-red-200' : 'bg-softgray/40 border-charcoal/5 hover:bg-terracotta-50/30'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-charcoal truncate">{item.name}</span>
                              {isLowStock && (
                                <span className="bg-red-100 text-red-700 text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5 flex-shrink-0">
                                  <AlertTriangle className="w-2.5 h-2.5 inline" /> Low Stock
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-semibold text-charcoal/60 mt-0.5 flex items-center gap-3">
                              <span>SKU: {item.sku}</span>
                              <span>•</span>
                              <span>In Shop: <strong className={isLowStock ? 'text-red-600 font-black' : 'text-forest-700 font-extrabold'}>{item.stock} {item.unit}</strong></span>
                            </div>
                          </div>

                          <div className="text-right flex items-center gap-3">
                            <div>
                              <div className="text-[10px] text-charcoal/50 font-bold uppercase">Vendor Rate</div>
                              <div className="font-black text-sm text-forest-700">₹{item.purchasePrice} <span className="text-[10px] font-normal text-charcoal/50">/{item.unit}</span></div>
                            </div>
                            <button
                              onClick={() => {
                                const sup = viewingVendorModal;
                                setViewingVendorModal(null);
                                handleOpenPoModal(sup, item);
                              }}
                              className="bg-charcoal text-white hover:bg-terracotta-600 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all shadow-sm flex items-center gap-1"
                              title="Reorder this specific SKU"
                            >
                              <span>+ Reorder</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  {items.filter(i => (i.supplierId === (viewingVendorModal._id || viewingVendorModal.id)) || (i.supplierName === viewingVendorModal.name)).length === 0 && (
                    <div className="py-12 text-center text-xs font-bold text-charcoal/40 bg-softgray/30 rounded-2xl">
                      No active catalog SKUs currently mapped to this vendor.
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-softgray flex justify-between items-center text-xs text-charcoal/60 font-semibold">
                  <span>Need custom items or contract negotiation?</span>
                  <a href={`tel:${viewingVendorModal.phone}`} className="text-terracotta-600 font-extrabold hover:underline">Call {viewingVendorModal.contactPerson} →</a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
