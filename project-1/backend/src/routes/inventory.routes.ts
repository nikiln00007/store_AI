import { Router, Request, Response } from 'express';
import { Item } from '../models/Item.js';
import { localStore } from '../utils/localStore.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// 1. Get All Items (with search, category filter, low-stock filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, lowStock } = req.query;
    let items: any[] = [];

    if (global.isUsingFallbackDB) {
      items = [...localStore.items];
    } else {
      items = await Item.find({});
    }

    // Apply filters in memory if fallback or for consistent bilingual search
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(q) || 
        (item.hindiName && item.hindiName.toLowerCase().includes(q)) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    if (category && typeof category === 'string' && category !== 'All') {
      items = items.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    if (lowStock === 'true') {
      items = items.filter(item => item.stock <= item.minStockAlert);
    }

    return res.json({ success: true, count: items.length, items });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Get Single Item
router.get('/:id', async (req: Request, res: Response) => {
  try {
    let item: any;
    if (global.isUsingFallbackDB) {
      item = localStore.items.find(i => (i._id || i.id) === req.params.id);
    } else {
      item = await Item.findById(req.params.id);
    }

    if (!item) return res.status(404).json({ error: 'Item not found' });
    return res.json({ success: true, item });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Create Item
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const itemData = {
      _id: `item-${Date.now()}`,
      ...req.body,
      updatedAt: new Date()
    };

    if (!global.isUsingFallbackDB) {
      await Item.create(itemData);
    }
    localStore.items.push(itemData);

    return res.status(201).json({ success: true, item: itemData, message: 'Naya item zoda gaya! 📦' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Update Item
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let updatedItem: any;

    if (global.isUsingFallbackDB) {
      const idx = localStore.items.findIndex(i => (i._id || i.id) === id);
      if (idx === -1) return res.status(404).json({ error: 'Item not found' });
      localStore.items[idx] = { ...localStore.items[idx], ...req.body, updatedAt: new Date() };
      updatedItem = localStore.items[idx];
    } else {
      updatedItem = await Item.findByIdAndUpdate(id, { ...req.body, updatedAt: new Date() }, { new: true });
      if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
      // update localStore too
      const idx = localStore.items.findIndex(i => (i._id || i.id) === id);
      if (idx !== -1) localStore.items[idx] = updatedItem;
    }

    return res.json({ success: true, item: updatedItem, message: 'Stock update ho gaya! ✨' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Delete Item
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (global.isUsingFallbackDB) {
      localStore.items = localStore.items.filter(i => (i._id || i.id) !== id);
    } else {
      await Item.findByIdAndDelete(id);
      localStore.items = localStore.items.filter(i => (i._id || i.id) !== id);
    }

    return res.json({ success: true, message: 'Item hata diya gaya.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. Bulk CSV Upload Parser simulation & handler
router.post('/bulk-upload', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // Array of item objects from frontend CSV parser
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided in bulk upload' });
    }

    const processedItems = items.map((it, idx) => ({
      _id: `item-bulk-${Date.now()}-${idx}`,
      name: it.name || `Item ${idx + 1}`,
      hindiName: it.hindiName || '',
      category: it.category || 'Grocery',
      sku: it.sku || `SKU-BLK-${Date.now()}-${idx}`,
      purchasePrice: Number(it.purchasePrice) || 50,
      sellingPrice: Number(it.sellingPrice) || 60,
      stock: Number(it.stock) || 20,
      minStockAlert: Number(it.minStockAlert) || 10,
      unit: it.unit || 'pcs',
      gstRate: Number(it.gstRate) || 5,
      updatedAt: new Date()
    }));

    if (!global.isUsingFallbackDB) {
      await Item.insertMany(processedItems);
    }
    localStore.items.push(...processedItems);

    return res.status(201).json({
      success: true,
      count: processedItems.length,
      message: `${processedItems.length} items safalta-poorvak add ho gaye! 🚀`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
