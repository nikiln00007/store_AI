import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore.js';
import { api } from '../../lib/api.js';
import { Item } from '../../types/index.js';
import { 
  Search, Plus, Upload, Filter, AlertTriangle, Edit, Trash2, 
  Check, X, Sparkles, Volume2, Package, Download 
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const InventoryPage: React.FC = () => {
  const { openAIModal } = useStore();
  const [searchParams] = useSearchParams();
  const initialLowStock = searchParams.get('lowStock') === 'true';

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(initialLowStock);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  // Form
  const [form, setForm] = useState<any>({
    name: '',
    hindiName: '',
    category: 'Grocery',
    sku: `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
    purchasePrice: 50,
    sellingPrice: 65,
    stock: 25,
    minStockAlert: 10,
    unit: 'packet',
    gstRate: 5
  });

  const categories = ['All', 'Grocery', 'Dairy', 'Snacks', 'Medical', 'Personal Care', 'Household', 'Spices'];

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      if (res.data.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter items
  const filteredItems = items.filter((it) => {
    const matchesSearch = 
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === 'All' || it.category === selectedCategory;
    const matchesLow = !showLowStockOnly || it.stock <= it.minStockAlert;

    return matchesSearch && matchesCat && matchesLow;
  });

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setForm(item);
    } else {
      setEditingItem(null);
      setForm({
        name: '',
        hindiName: '',
        category: 'Grocery',
        sku: `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
        purchasePrice: 50,
        sellingPrice: 65,
        stock: 25,
        minStockAlert: 10,
        unit: 'packet',
        gstRate: 5
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem && (editingItem._id || editingItem.id)) {
        const id = editingItem._id || editingItem.id;
        await api.put(`/inventory/${id}`, form);
      } else {
        await api.post('/inventory', form);
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      alert('Error saving item');
    }
  };

  const handleDeleteItem = async (id?: string) => {
    if (!id || !confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      fetchInventory();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleBulkUpload = async () => {
    try {
      // Parse CSV text
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) return alert('Please enter at least header and 1 item row.');
      
      const uploadedItems = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts[0]) {
          uploadedItems.push({
            name: parts[0],
            hindiName: '',
            category: parts[1] || 'Grocery',
            sku: parts[2] || `SKU-BLK-${Date.now()}-${i}`,
            purchasePrice: Number(parts[3]) || 40,
            sellingPrice: Number(parts[4]) || 50,
            stock: Number(parts[5]) || 30,
            minStockAlert: Number(parts[6]) || 10,
            unit: parts[7] || 'packet',
            gstRate: Number(parts[8]) || 5
          });
        }
      }

      const res = await api.post('/inventory/bulk-upload', { items: uploadedItems });
      if (res.data.success) {
        setBulkSuccessMsg(res.data.message);
        setTimeout(() => {
          setIsBulkModalOpen(false);
          setBulkSuccessMsg('');
          setCsvText('');
          fetchInventory();
        }, 1500);
      }
    } catch (err: any) {
      alert('Bulk upload error: ' + err.message);
    }
  };

  const downloadSampleTemplate = () => {
    const template = `Name,Category,SKU,Purchase Price,Selling Price,Stock,Min Stock Alert,Unit,GST Rate\nBritannia Marie Gold 250g,Snacks,BRT-MAR-250G,28,35,40,10,packet,18\nHorlicks Health Drink 500g,Medical,HOR-HLT-500G,220,250,15,5,box,12`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Store_AI_Inventory_Template.csv';
    a.click();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-terracotta-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-charcoal flex items-center gap-2">
            <span>Inventory Management</span>
            <span className="text-xs font-bold bg-terracotta-100 text-terracotta-700 px-2.5 py-0.5 rounded-full">
              {items.length} Items
            </span>
          </h1>
          <p className="text-xs text-charcoal/60 font-medium mt-1">
            Add items, update stock levels, and trigger instant AI supplier reorders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="bg-softgray hover:bg-terracotta-50 text-charcoal font-bold text-xs px-3.5 py-2.5 rounded-xl border border-charcoal/10 flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-4 h-4 text-terracotta-600" />
            <span>Bulk CSV Upload</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-terracotta-500 to-saffron-500 hover:from-terracotta-600 hover:to-saffron-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-terracotta-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Item Name, SKU, or Category..."
            className="w-full bg-softgray/50 border border-charcoal/10 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:border-terracotta-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-charcoal/40 hover:text-charcoal">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Tabs & Low Stock Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              showLowStockOnly
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Alert</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'bg-softgray/60 text-charcoal/70 hover:bg-softgray hover:text-charcoal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid / Cards (Mobile friendly touch targets) */}
      {loading ? (
        <div className="py-20 text-center text-sm font-bold text-charcoal/40">Loading inventory items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center bg-white/60 rounded-3xl border border-terracotta-100">
          <Package className="w-12 h-12 text-charcoal/30 mx-auto mb-3" />
          <p className="font-extrabold text-charcoal text-base">No items found matching your filter.</p>
          <p className="text-xs text-charcoal/60 mt-1">Try searching for Tata Salt, Amul Butter, or Dolo 650.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setShowLowStockOnly(false); }}
            className="mt-4 bg-terracotta-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((it) => {
            const isLow = it.stock <= it.minStockAlert;
            return (
              <div
                key={it._id || it.id}
                className={`bg-white/90 backdrop-blur-md rounded-2xl p-5 border transition-all hover:shadow-xl relative overflow-hidden flex flex-col justify-between ${
                  isLow ? 'border-red-300 shadow-md shadow-red-500/5' : 'border-terracotta-100'
                }`}
              >
                {/* Low Stock Ribbon */}
                {isLow && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-red-500 to-terracotta-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Low Stock ({it.stock} {it.unit})</span>
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-softgray text-charcoal/70 px-2 py-0.5 rounded-md uppercase">
                      {it.category}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-charcoal/40">
                      {it.sku}
                    </span>
                  </div>

                  <h3 className="font-black text-lg text-charcoal leading-tight">
                    {it.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-softgray text-xs">
                    <div>
                      <span className="text-charcoal/50 block">Selling Price</span>
                      <span className="font-black text-base text-forest-600">₹{it.sellingPrice}</span>
                      <span className="text-[10px] text-charcoal/40 ml-1">/ {it.unit}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 block">Stock Level</span>
                      <span className={`font-black text-base ${isLow ? 'text-red-600' : 'text-charcoal'}`}>
                        {it.stock} <span className="text-xs font-normal">{it.unit}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-softgray mt-2">
                  {isLow ? (
                    <button
                      onClick={() => openAIModal(`Order ${it.name} urgently`)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs px-3 py-2 rounded-xl border border-red-200 flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-saffron-500" />
                      <span>AI Reorder</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-forest-600 bg-forest-50 px-2 py-1 rounded-lg">
                      ✓ Stock Healthy
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenModal(it)}
                      title="Edit Item"
                      className="p-2 bg-softgray hover:bg-terracotta-50 text-charcoal/70 hover:text-terracotta-700 rounded-xl transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(it._id || it.id)}
                      title="Delete Item"
                      className="p-2 bg-softgray hover:bg-red-50 text-charcoal/50 hover:text-red-600 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ADD/EDIT ITEM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-terracotta-100 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-softgray mb-4">
              <h3 className="text-lg font-black text-charcoal">
                {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-charcoal/40 hover:text-charcoal rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-charcoal mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Amul Butter 500g"
                    className="w-full bg-softgray/50 border border-charcoal/10 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:border-terracotta-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-softgray/50 border border-charcoal/10 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none"
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full bg-softgray/50 border border-charcoal/10 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Purchase Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.purchasePrice}
                    onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
                    className="w-full bg-softgray/50 border border-charcoal/10 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
                    className="w-full bg-softgray/50 border border-charcoal/10 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Current Stock *</label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full bg-softgray/50 border border-charcoal/10 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Min Stock Alert *</label>
                  <input
                    type="number"
                    required
                    value={form.minStockAlert}
                    onChange={(e) => setForm({ ...form, minStockAlert: Number(e.target.value) })}
                    className="w-full bg-softgray/50 border border-charcoal/10 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Unit *</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full bg-softgray/50 border border-charcoal/10 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none"
                  >
                    <option value="packet">packet</option>
                    <option value="kg">kg</option>
                    <option value="ltr">ltr</option>
                    <option value="pcs">pcs</option>
                    <option value="box">box</option>
                    <option value="strip">strip</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">GST Slab *</label>
                  <select
                    value={form.gstRate}
                    onChange={(e) => setForm({ ...form, gstRate: Number(e.target.value) })}
                    className="w-full bg-softgray/50 border border-charcoal/10 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none"
                  >
                    <option value={0}>0% (Tax Free)</option>
                    <option value={5}>5% (Essential)</option>
                    <option value={12}>12% (Standard)</option>
                    <option value={18}>18% (Packaged/Snacks)</option>
                    <option value={28}>28% (Luxury)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-softgray mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-softgray hover:bg-softgray/80 text-charcoal font-bold text-xs px-4 py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-terracotta-500 to-saffron-500 hover:from-terracotta-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md"
                >
                  {editingItem ? 'Save Changes' : 'Add Item to Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK CSV UPLOAD MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-terracotta-100 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-softgray mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-terracotta-50 flex items-center justify-center text-terracotta-600">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-charcoal">Bulk CSV / Excel Upload</h3>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-1.5 text-charcoal/40 hover:text-charcoal rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkSuccessMsg ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center text-forest-600 mx-auto animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-extrabold text-charcoal">{bulkSuccessMsg}</h4>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-softgray/50 p-3.5 rounded-2xl border border-charcoal/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-charcoal block">Need formatted columns?</span>
                    <span className="text-charcoal/60">Download sample template to make upload effortless.</span>
                  </div>
                  <button
                    onClick={downloadSampleTemplate}
                    className="bg-white hover:bg-terracotta-50 text-terracotta-600 font-bold px-3 py-1.5 rounded-xl border border-terracotta-200 shadow-sm flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Template</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Paste CSV Data Here *</label>
                  <textarea
                    rows={8}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder={`Name,Category,SKU,Purchase Price,Selling Price,Stock,Min Stock Alert,Unit,GST Rate\nBritannia Marie Gold 250g,Snacks,BRT-MAR-250G,28,35,40,10,packet,18`}
                    className="w-full bg-softgray/30 border border-charcoal/10 rounded-2xl p-3 text-xs font-mono focus:outline-none focus:border-terracotta-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-softgray">
                  <button
                    onClick={() => setIsBulkModalOpen(false)}
                    className="bg-softgray hover:bg-softgray/80 text-charcoal font-bold text-xs px-4 py-2.5 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkUpload}
                    className="bg-gradient-to-r from-terracotta-500 to-saffron-500 hover:from-terracotta-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Process CSV</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
