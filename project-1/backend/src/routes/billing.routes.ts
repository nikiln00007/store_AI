import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice.js';
import { Item } from '../models/Item.js';
import { localStore } from '../utils/localStore.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// 1. Get All Invoices
router.get('/', async (req: Request, res: Response) => {
  try {
    let invoices: any[] = [];
    if (global.isUsingFallbackDB) {
      invoices = [...localStore.invoices];
    } else {
      invoices = await Invoice.find({}).sort({ createdAt: -1 });
    }
    return res.json({ success: true, count: invoices.length, invoices });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Get Single Invoice
router.get('/:id', async (req: Request, res: Response) => {
  try {
    let inv: any;
    if (global.isUsingFallbackDB) {
      inv = localStore.invoices.find(i => (i._id || i.id) === req.params.id || i.invoiceNumber === req.params.id);
    } else {
      inv = await Invoice.findOne({ $or: [{ _id: req.params.id }, { invoiceNumber: req.params.id }] });
    }
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    return res.json({ success: true, invoice: inv });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Create POS Bill / Invoice (Deducts Stock & Calculates GST/Profit)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone, items, paymentMethod, discount } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Bill must contain at least 1 item' });
    }

    let subtotal = 0;
    let gstAmount = 0;
    let totalProfit = 0;
    const processedItems = [];

    // Process each item and deduct stock
    for (const it of items) {
      let dbItem: any;
      if (global.isUsingFallbackDB) {
        dbItem = localStore.items.find(i => (i._id || i.id) === it.itemId || i.sku === it.sku || i.name === it.name);
      } else {
        dbItem = await Item.findById(it.itemId);
        if (!dbItem && it.sku) dbItem = await Item.findOne({ sku: it.sku });
      }

      const price = Number(it.price) || (dbItem ? dbItem.sellingPrice : 50);
      const purchasePrice = Number(it.purchasePrice) || (dbItem ? dbItem.purchasePrice : price * 0.8);
      const qty = Number(it.qty) || 1;
      const gstRate = Number(it.gstRate) || (dbItem ? dbItem.gstRate : 5);
      
      const lineTotal = price * qty;
      const lineGst = (lineTotal * gstRate) / (100 + gstRate); // Inclusive GST calculation
      const lineProfit = (price - purchasePrice) * qty;

      subtotal += lineTotal - lineGst;
      gstAmount += lineGst;
      totalProfit += lineProfit;

      processedItems.push({
        itemId: dbItem ? (dbItem._id || dbItem.id) : it.itemId,
        name: dbItem ? dbItem.name : it.name,
        hindiName: dbItem ? dbItem.hindiName : (it.hindiName || ''),
        qty,
        unit: dbItem ? dbItem.unit : (it.unit || 'pcs'),
        price,
        purchasePrice,
        gstRate,
        total: Number(lineTotal.toFixed(2)),
        itemProfit: Number(lineProfit.toFixed(2))
      });

      // Deduct stock in DB
      if (dbItem) {
        const newStock = Math.max(0, dbItem.stock - qty);
        if (global.isUsingFallbackDB) {
          const idx = localStore.items.findIndex(i => (i._id || i.id) === (dbItem._id || dbItem.id));
          if (idx !== -1) {
            localStore.items[idx].stock = newStock;
            localStore.items[idx].updatedAt = new Date();
          }
        } else {
          await Item.findByIdAndUpdate(dbItem._id, { stock: newStock, updatedAt: new Date() });
          const idx = localStore.items.findIndex(i => (i._id || i.id) === String(dbItem._id));
          if (idx !== -1) localStore.items[idx].stock = newStock;
        }
      }
    }

    const disc = Number(discount) || 0;
    const grandTotal = Math.round(subtotal + gstAmount - disc);

    const invoiceNumber = `INV-2026-${String(Math.floor(Math.random() * 9000 + 1000))}`;
    const invoiceObj = {
      _id: `inv-${Date.now()}`,
      invoiceNumber,
      customerName: customerName || 'Walking Customer',
      customerPhone: customerPhone || '',
      items: processedItems,
      subtotal: Number(subtotal.toFixed(2)),
      gstAmount: Number(gstAmount.toFixed(2)),
      discount: disc,
      grandTotal,
      totalProfit: Number(totalProfit.toFixed(2)),
      paymentMethod: paymentMethod || 'UPI',
      status: paymentMethod === 'Khata' ? 'Pending' : 'Paid',
      createdAt: new Date()
    };

    if (!global.isUsingFallbackDB) {
      await Invoice.create(invoiceObj);
    }
    localStore.invoices.unshift(invoiceObj);

    return res.status(201).json({
      success: true,
      invoice: invoiceObj,
      message: `Invoice ${invoiceNumber} generated successfully! 🧾 Thank you!`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Get Invoice PDF Download Data
router.get('/:id/pdf-data', async (req: Request, res: Response) => {
  try {
    let inv: any;
    if (global.isUsingFallbackDB) {
      inv = localStore.invoices.find(i => (i._id || i.id) === req.params.id || i.invoiceNumber === req.params.id);
    } else {
      inv = await Invoice.findOne({ $or: [{ _id: req.params.id }, { invoiceNumber: req.params.id }] });
    }
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });

    // Format metadata for PDF generator
    const pdfPayload = {
      shopDetails: {
        name: 'Sharma Kirana & General Store',
        subtitle: 'India\'s Smartest Autonomous Retail Store 🌿',
        address: 'Shop No. 4, MG Road, Andheri West, Mumbai 400058',
        gstin: '27AABCU9603R1ZM',
        phone: '+91 98201 23456',
        email: 'rahul@store.ai'
      },
      invoice: inv,
      upiDetails: {
        upiId: 'sharma.kirana@okaxis',
        qrText: `upi://pay?pa=sharma.kirana@okaxis&pn=Sharma%20Kirana&am=${inv.grandTotal}&cu=INR`
      },
      footerMessage: 'Thank you for shopping with us! Visit again! 🙏'
    };

    return res.json({ success: true, pdfData: pdfPayload });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
