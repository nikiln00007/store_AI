import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore.js';
import { api } from '../../lib/api.js';
import { downloadInvoicePDF } from '../../lib/pdfGenerator.js';
import { Item, Invoice } from '../../types/index.js';
import { 
  Search, Plus, Minus, Trash2, Receipt, IndianRupee, QrCode, 
  CheckCircle2, Sparkles, User, Phone, Tag, Printer, Download, ArrowRight 
} from 'lucide-react';

export const BillingPage: React.FC = () => {
  const { 
    cart, addToCart, removeFromCart, updateCartQty, clearCart,
    customerName, setCustomerName, customerPhone, setCustomerPhone,
    paymentMethod, setPaymentMethod, discount, setDiscount
  } = useStore();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Success modal after invoice creation
  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['All', 'Grocery', 'Dairy', 'Snacks', 'Medical', 'Personal Care', 'Household', 'Spices'];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      if (res.data.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load items for POS', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(it => {
    const matchesSearch = 
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || it.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate live totals
  const subtotalRaw = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);
  const totalGst = cart.reduce((sum, item) => {
    const lineTotal = item.sellingPrice * item.qty;
    const gst = (lineTotal * item.gstRate) / (100 + item.gstRate);
    return sum + gst;
  }, 0);
  const estimatedProfit = cart.reduce((sum, item) => {
    return sum + ((item.sellingPrice - item.purchasePrice) * item.qty);
  }, 0);

  const netSubtotal = subtotalRaw - totalGst;
  const grandTotal = Math.round(subtotalRaw - discount);

  const handleGenerateBill = async () => {
    if (cart.length === 0) {
      return alert('Cart is empty. Please add items first.');
    }
    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName || 'Walking Customer',
        customerPhone: customerPhone || '',
        paymentMethod,
        discount: Number(discount) || 0,
        items: cart.map(item => ({
          itemId: item._id || item.id,
          name: item.name,
          hindiName: '',
          qty: item.qty,
          unit: item.unit,
          price: item.sellingPrice,
          purchasePrice: item.purchasePrice,
          gstRate: item.gstRate
        }))
      };

      const res = await api.post('/invoices', payload);
      if (res.data.success) {
        setLastInvoice(res.data.invoice);
        setIsSuccessModalOpen(true);
        clearCart();
        fetchItems(); // refresh stock
      }
    } catch (err: any) {
      alert('Error creating bill: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 pb-20 md:pb-8">
      
      {/* Left 7 Cols: Fast POS Item Picker */}
      <div className="lg:col-span-7 space-y-4">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-terracotta-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-charcoal flex items-center gap-2">
                <Receipt className="w-6 h-6 text-terracotta-600" />
                <span>Lightning-Fast POS Billing</span>
              </h1>
              <p className="text-xs text-charcoal/60 font-medium">
                Tap items to add instantly. Automatic GST & shop profit calculation.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Scan barcode or search item name..."
              className="w-full bg-softgray/60 border border-charcoal/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-terracotta-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto mt-3 pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-charcoal text-white shadow-sm'
                    : 'bg-softgray/50 text-charcoal/70 hover:bg-softgray hover:text-charcoal'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Item Grid (Big touch targets for fast Indian retail) */}
        {loading ? (
          <div className="py-16 text-center text-sm font-bold text-charcoal/40">Loading shop items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-white/60 rounded-3xl border border-terracotta-100 font-bold text-charcoal/50">
            No items found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredItems.map((it) => {
              const inCart = cart.find(c => (c._id || c.id) === (it._id || it.id));
              const isOut = it.stock <= 0;
              return (
                <div
                  key={it._id || it.id}
                  onClick={() => !isOut && addToCart(it, 1)}
                  className={`bg-white/90 backdrop-blur-md rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                    inCart 
                      ? 'border-terracotta-500 ring-2 ring-terracotta-500/20 shadow-md bg-terracotta-50/20' 
                      : isOut ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : 'border-terracotta-100 hover:border-terracotta-300 hover:shadow-lg'
                  }`}
                >
                  {inCart && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-terracotta-500 text-white font-extrabold text-xs rounded-full flex items-center justify-center shadow">
                      {inCart.qty}
                    </div>
                  )}

                  <div>
                    <span className="text-[9px] font-bold bg-softgray text-charcoal/60 px-1.5 py-0.5 rounded uppercase">
                      {it.category}
                    </span>
                    <h3 className="font-extrabold text-sm text-charcoal mt-1 line-clamp-2 leading-snug">
                      {it.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-softgray flex items-center justify-between">
                    <div>
                      <span className="font-black text-base text-forest-600">₹{it.sellingPrice}</span>
                      <span className="text-[10px] text-charcoal/40 ml-0.5">/{it.unit}</span>
                    </div>
                    <div className="text-[10px] font-bold text-charcoal/50">
                      Stock: {it.stock}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right 5 Cols: Live Cart & Instant POS Bill Generator */}
      <div className="lg:col-span-5 bg-white/95 backdrop-blur-xl rounded-3xl border border-terracotta-200 shadow-2xl p-6 flex flex-col justify-between h-[calc(100vh-100px)] lg:sticky lg:top-[80px]">
        
        {/* Cart Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-softgray mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-terracotta-50 flex items-center justify-center text-terracotta-600 font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-charcoal">
                  Current Bill
                </h3>
                <span className="text-xs text-charcoal/60 font-semibold">{cart.length} unique items in cart</span>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Customer & Payment Mode Settings */}
          <div className="bg-softgray/50 p-3.5 rounded-2xl border border-charcoal/10 space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <User className="w-3.5 h-3.5 text-charcoal/40 absolute left-3 top-3" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="w-full bg-white border border-charcoal/10 rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-terracotta-500"
                />
              </div>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-charcoal/40 absolute left-3 top-3" />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone (for WhatsApp / Store Credit)"
                  className="w-full bg-white border border-charcoal/10 rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-terracotta-500"
                />
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="flex items-center gap-1.5 pt-1">
              {(['UPI', 'Cash', 'Khata'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPaymentMethod(mode)}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                    paymentMethod === mode
                      ? mode === 'UPI' ? 'bg-forest-600 text-white shadow-sm' :
                        mode === 'Cash' ? 'bg-blue-600 text-white shadow-sm' : 'bg-saffron-600 text-white shadow-sm'
                      : 'bg-white text-charcoal/70 border border-charcoal/10 hover:bg-softgray'
                  }`}
                >
                  {mode === 'UPI' && <QrCode className="w-3.5 h-3.5" />}
                  <span>{mode === 'Khata' ? 'Store Credit' : mode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cart Item List */}
          <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="py-10 text-center text-charcoal/40 font-semibold text-sm">
                Tap items on the left to add to bill.
              </div>
            ) : (
              cart.map((item) => {
                const itemId = item._id || item.id || '';
                return (
                  <div key={itemId} className="flex items-center justify-between p-2.5 bg-softgray/40 rounded-xl border border-charcoal/5">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-extrabold text-xs text-charcoal truncate">{item.name}</div>
                      <div className="text-[10px] font-semibold text-terracotta-600">₹{item.sellingPrice} / {item.unit}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-charcoal/10 rounded-lg overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateCartQty(itemId, item.qty - 1)}
                          className="px-2 py-1 text-charcoal/60 hover:bg-softgray hover:text-charcoal transition-colors font-bold text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-black text-xs text-charcoal min-w-[24px] text-center">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(itemId, item.qty + 1)}
                          className="px-2 py-1 text-charcoal/60 hover:bg-softgray hover:text-charcoal transition-colors font-bold text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className="p-1 text-charcoal/30 hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Calculation & UPI Footer */}
        <div className="pt-4 border-t border-softgray space-y-3">
          {/* Discount input */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-charcoal/70 flex items-center gap-1"><Tag className="w-3.5 h-3.5"/> Discount (₹):</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              className="w-20 bg-softgray/60 border border-charcoal/10 rounded-lg px-2 py-1 text-right font-bold focus:outline-none focus:border-terracotta-500"
            />
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-xs font-medium text-charcoal/70">
            <div className="flex justify-between">
              <span>Subtotal (Net):</span>
              <span className="font-bold">₹{netSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST Amount:</span>
              <span className="font-bold">₹{totalGst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-forest-600 bg-forest-50 p-1.5 rounded-lg font-bold">
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-golden"/> Estimated Shop Profit:</span>
              <span>₹{estimatedProfit.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-base font-black text-charcoal pt-2 border-t border-charcoal/10">
              <span>Grand Total:</span>
              <span className="text-terracotta-600 text-xl">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerateBill}
            disabled={cart.length === 0 || submitting}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform ${
              cart.length > 0 && !submitting
                ? 'bg-gradient-to-r from-terracotta-500 via-saffron-500 to-terracotta-600 hover:from-terracotta-600 text-white shadow-terracotta-500/30 hover:scale-[1.02]'
                : 'bg-softgray text-charcoal/30 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>{submitting ? 'Generating Invoice...' : 'Generate Bill & Save to DB 🚀'}</span>
          </button>
        </div>

      </div>

      {/* SUCCESS & DOWNLOAD INVOICE MODAL */}
      {isSuccessModalOpen && lastInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-terracotta-200 text-center space-y-4">
            <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center text-forest-600 mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-charcoal">Bill Created Successfully! 🎉</h3>
              <p className="text-xs font-semibold text-forest-600 mt-1">
                {lastInvoice.invoiceNumber} • Saved directly to Database
              </p>
              <p className="text-xs text-charcoal/60 mt-1">
                Shop inventory stock levels updated automatically.
              </p>
            </div>

            <div className="bg-softgray/50 p-4 rounded-2xl border border-charcoal/10 text-left space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span>Customer:</span>
                <span>{lastInvoice.customerName}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Payment Mode:</span>
                <span className="text-terracotta-600">{lastInvoice.paymentMethod === 'Khata' ? 'Store Credit' : lastInvoice.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-charcoal pt-1 border-t border-charcoal/10">
                <span>Grand Total:</span>
                <span>₹{lastInvoice.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  downloadInvoicePDF(lastInvoice);
                }}
                className="w-full bg-gradient-to-r from-forest-500 to-mint-500 hover:from-forest-600 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>Download / Print PDF Invoice 📄</span>
              </button>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full bg-softgray hover:bg-softgray/80 text-charcoal font-bold text-xs py-2.5 rounded-xl"
              >
                Close & Start Next Bill
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
