import { Router, Request, Response } from 'express';
import { Supplier } from '../models/Supplier.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';
import { Item } from '../models/Item.js';
import { localStore } from '../utils/localStore.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// 1. Get All Suppliers with Price Comparison Table calculation
router.get('/', async (req: Request, res: Response) => {
  try {
    let suppliers: any[] = [];
    let items: any[] = [];

    if (global.isUsingFallbackDB) {
      suppliers = [...localStore.suppliers];
      items = [...localStore.items];
    } else {
      suppliers = await Supplier.find({});
      items = await Item.find({});
    }

    // Enhance suppliers with sample price comparison across items they supply
    const enrichedSuppliers = suppliers.map(sup => {
      const suppliedItems = items.filter(it => (it.supplierId === (sup._id || sup.id)) || (it.supplierName === sup.name));
      return {
        ...sup._doc || sup,
        itemsCount: suppliedItems.length,
        priceAdvantage: sup.rating >= 4.8 ? 'Best Price (-5% to -8%)' : 'Standard Market Rate'
      };
    });

    return res.json({ success: true, count: enrichedSuppliers.length, suppliers: enrichedSuppliers });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Create Supplier
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const supData = {
      _id: `sup-${Date.now()}`,
      ...req.body,
      createdAt: new Date()
    };

    if (!global.isUsingFallbackDB) {
      await Supplier.create(supData);
    }
    localStore.suppliers.push(supData);

    return res.status(201).json({ success: true, supplier: supData, message: 'Supplier add ho gaya!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Get All Purchase Orders
router.get('/po', async (req: Request, res: Response) => {
  try {
    let pos: any[] = [];
    if (global.isUsingFallbackDB) {
      pos = [...localStore.purchaseOrders];
    } else {
      pos = await PurchaseOrder.find({}).sort({ orderDate: -1 });
    }
    return res.json({ success: true, count: pos.length, purchaseOrders: pos });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Create Purchase Order (Manual or AI-drafted)
router.post('/po', authenticateToken, async (req: Request, res: Response) => {
  try {
    const poData = {
      _id: `po-${Date.now()}`,
      poNumber: `PO-2026-${String(Math.floor(Math.random() * 900 + 100))}`,
      ...req.body,
      status: req.body.status || 'Draft',
      orderDate: new Date(),
      expectedDate: new Date(Date.now() + 86400000 * (req.body.deliveryTimeDays || 2))
    };

    if (!global.isUsingFallbackDB) {
      await PurchaseOrder.create(poData);
    }
    localStore.purchaseOrders.unshift(poData);

    return res.status(201).json({ success: true, purchaseOrder: poData, message: 'Purchase Order draft ho gaya! 📋' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Simulate WhatsApp & Email PO Send
router.post('/po/:id/send', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let po: any;

    if (global.isUsingFallbackDB) {
      const idx = localStore.purchaseOrders.findIndex(p => (p._id || p.id) === id);
      if (idx === -1) return res.status(404).json({ error: 'PO not found' });
      localStore.purchaseOrders[idx].status = 'Sent';
      po = localStore.purchaseOrders[idx];
    } else {
      po = await PurchaseOrder.findByIdAndUpdate(id, { status: 'Sent' }, { new: true });
      if (!po) return res.status(404).json({ error: 'PO not found' });
      const idx = localStore.purchaseOrders.findIndex(p => (p._id || p.id) === id);
      if (idx !== -1) localStore.purchaseOrders[idx] = po;
    }

    return res.json({
      success: true,
      purchaseOrder: po,
      message: `✅ WhatsApp & Email PO sent to ${po.supplierName} (${po.supplierPhone})!`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
