import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { Supplier } from '../models/Supplier.js';
import { Invoice } from '../models/Invoice.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';
import { localStore } from './localStore.js';

dotenv.config();

export const seedDatabase = async (isStandalone = false) => {
  try {
    if (isStandalone) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/store_ai';
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        console.log(`[Seed] 🌿 Connected to MongoDB at ${uri}`);
      } catch (err) {
        console.warn(`[Seed] ⚠️ Local MongoDB offline. Seeding Resilient In-Memory LocalStore...`);
        global.isUsingFallbackDB = true;
      }
    }

    // Clear old data
    if (!global.isUsingFallbackDB) {
      await User.deleteMany({});
      await Item.deleteMany({});
      await Supplier.deleteMany({});
      await Invoice.deleteMany({});
      await PurchaseOrder.deleteMany({});
    }
    localStore.clearAll();

    // 1. Seed Demo User
    const hashedPassword = await bcrypt.hash('dukaan2026', 10);
    const demoUserObj = {
      _id: 'user-1',
      name: 'Rahul Sharma',
      email: 'rahul@store.ai',
      password: hashedPassword,
      phone: '+91 98201 23456',
      shopName: 'Sharma General Store',
      shopType: 'Retail & Medical Superstore',
      city: 'Mumbai',
      address: 'Shop No. 4, MG Road, Andheri West, Mumbai, Maharashtra 400058',
      gstNumber: '27AABCU9603R1ZM',
      upiId: 'sharma.store@okaxis',
      languagePreference: 'en',
      createdAt: new Date()
    };

    if (!global.isUsingFallbackDB) {
      await User.create(demoUserObj);
    }
    localStore.users.push(demoUserObj);

    // 2. Seed Suppliers
    const suppliersData = [
      {
        _id: 'sup-1',
        name: 'Ramesh Distributors',
        contactPerson: 'Ramesh Bhai Patel',
        phone: '+91 98201 11223',
        whatsapp: '+91 98201 11223',
        email: 'ramesh.dist@gmail.com',
        address: 'APMC Market, Vashi, Navi Mumbai',
        rating: 4.9,
        categories: ['Grocery', 'Spices', 'Staples'],
        paymentTerms: '7 Days Store Credit',
        deliveryTimeDays: 1,
        createdAt: new Date()
      },
      {
        _id: 'sup-2',
        name: 'Sharma Pharma & Surgical',
        contactPerson: 'Vikram Sharma',
        phone: '+91 98209 87654',
        whatsapp: '+91 98209 87654',
        email: 'sharmapharma@yahoo.co.in',
        address: 'Princess Street, Dawa Bazaar, Mumbai',
        rating: 4.8,
        categories: ['Medical', 'Personal Care', 'Healthcare'],
        paymentTerms: '15 Days Credit',
        deliveryTimeDays: 1,
        createdAt: new Date()
      },
      {
        _id: 'sup-3',
        name: 'Mumbai Dairy & Snacks Agency',
        contactPerson: 'Suresh Shirke',
        phone: '+91 98334 45566',
        whatsapp: '+91 98334 45566',
        email: 'mumbai.dairy@outlook.com',
        address: 'Goregaon East, Mumbai',
        rating: 4.7,
        categories: ['Dairy', 'Snacks', 'Beverages'],
        paymentTerms: 'Immediate',
        deliveryTimeDays: 1,
        createdAt: new Date()
      },
      {
        _id: 'sup-4',
        name: 'Mahavir General Agencies',
        contactPerson: 'Jainesh Shah',
        phone: '+91 98112 23344',
        whatsapp: '+91 98112 23344',
        email: 'mahavir.agencies@gmail.com',
        address: 'Bhuleshwar Market, Mumbai',
        rating: 4.6,
        categories: ['Household', 'Cleaning', 'Personal Care'],
        paymentTerms: '7 Days Store Credit',
        deliveryTimeDays: 2,
        createdAt: new Date()
      }
    ];

    if (!global.isUsingFallbackDB) {
      await Supplier.insertMany(suppliersData);
    }
    localStore.suppliers.push(...suppliersData);

    // 3. Seed Items (18 Realistic Indian Retail Products)
    const itemsData = [
      {
        _id: 'item-1',
        name: 'Tata Salt 1kg',
        hindiName: 'टाटा नमक 1 किलो',
        category: 'Grocery',
        sku: 'TAT-SLT-1KG',
        barcode: '8901030310234',
        purchasePrice: 25,
        sellingPrice: 30,
        stock: 45,
        minStockAlert: 10,
        unit: 'packet',
        supplierId: 'sup-1',
        supplierName: 'Ramesh Distributors',
        gstRate: 5,
        updatedAt: new Date()
      },
      {
        _id: 'item-2',
        name: 'Amul Butter 500g',
        hindiName: 'अमूल मक्खन 500 ग्राम',
        category: 'Dairy',
        sku: 'AML-BTR-500G',
        barcode: '8901262010045',
        purchasePrice: 260,
        sellingPrice: 285,
        stock: 4, // LOW STOCK!
        minStockAlert: 10,
        unit: 'packet',
        supplierId: 'sup-3',
        supplierName: 'Mumbai Dairy & Snacks Agency',
        gstRate: 12,
        updatedAt: new Date()
      },
      {
        _id: 'item-3',
        name: 'Parle-G Biscuit 800g',
        hindiName: 'पारले-जी बिस्कुट 800 ग्राम',
        category: 'Snacks',
        sku: 'PRL-G-800G',
        barcode: '8901030110023',
        purchasePrice: 75,
        sellingPrice: 90,
        stock: 60,
        minStockAlert: 15,
        unit: 'packet',
        supplierId: 'sup-3',
        supplierName: 'Mumbai Dairy & Snacks Agency',
        gstRate: 18,
        updatedAt: new Date()
      },
      {
        _id: 'item-4',
        name: 'Aashirvaad Shudh Chakki Atta 5kg',
        hindiName: 'आशीर्वाद आटा 5 किलो',
        category: 'Grocery',
        sku: 'ASH-ATT-5KG',
        barcode: '8901725111054',
        purchasePrice: 210,
        sellingPrice: 240,
        stock: 3, // LOW STOCK!
        minStockAlert: 10,
        unit: 'kg',
        supplierId: 'sup-1',
        supplierName: 'Ramesh Distributors',
        gstRate: 5,
        updatedAt: new Date()
      },
      {
        _id: 'item-5',
        name: 'Dolo 650 Tablet Strip',
        hindiName: 'डोलो 650 गोली (15 पीस)',
        category: 'Medical',
        sku: 'DOL-650-STP',
        barcode: '8904100230012',
        purchasePrice: 22,
        sellingPrice: 32,
        stock: 120,
        minStockAlert: 20,
        unit: 'strip',
        supplierId: 'sup-2',
        supplierName: 'Sharma Pharma & Surgical',
        gstRate: 12,
        updatedAt: new Date()
      },
      {
        _id: 'item-6',
        name: 'Fortune Sunlite Sunflower Oil 1L',
        hindiName: 'फॉर्च्यून सूरजमुखी तेल 1 लीटर',
        category: 'Grocery',
        sku: 'FRT-SUN-1L',
        barcode: '8906001010045',
        purchasePrice: 125,
        sellingPrice: 145,
        stock: 18,
        minStockAlert: 12,
        unit: 'ltr',
        supplierId: 'sup-1',
        supplierName: 'Ramesh Distributors',
        gstRate: 5,
        updatedAt: new Date()
      },
      {
        _id: 'item-7',
        name: 'Maggi 2-Minute Noodles 4-Pack',
        hindiName: 'मैगी नूडल्स 4-पैक 280g',
        category: 'Snacks',
        sku: 'MAG-NDL-4PK',
        barcode: '8901058810034',
        purchasePrice: 50,
        sellingPrice: 60,
        stock: 8, // LOW STOCK!
        minStockAlert: 15,
        unit: 'packet',
        supplierId: 'sup-3',
        supplierName: 'Mumbai Dairy & Snacks Agency',
        gstRate: 18,
        updatedAt: new Date()
      },
      {
        _id: 'item-8',
        name: 'Surf Excel Easy Wash 1kg',
        hindiName: 'सर्फ एक्सेल वाशिंग पाउडर 1 किलो',
        category: 'Household',
        sku: 'SRF-EXL-1KG',
        barcode: '8901030430012',
        purchasePrice: 115,
        sellingPrice: 135,
        stock: 25,
        minStockAlert: 10,
        unit: 'packet',
        supplierId: 'sup-4',
        supplierName: 'Mahavir General Agencies',
        gstRate: 18,
        updatedAt: new Date()
      },
      {
        _id: 'item-9',
        name: 'Colgate MaxFresh Paste 150g',
        hindiName: 'कोलगेट टूथपेस्ट 150 ग्राम',
        category: 'Personal Care',
        sku: 'CLG-MAX-150G',
        barcode: '8901314010023',
        purchasePrice: 80,
        sellingPrice: 98,
        stock: 32,
        minStockAlert: 10,
        unit: 'pcs',
        supplierId: 'sup-4',
        supplierName: 'Mahavir General Agencies',
        gstRate: 18,
        updatedAt: new Date()
      },
      {
        _id: 'item-10',
        name: 'Brooke Bond Red Label Tea 500g',
        hindiName: 'रेड लेबल चाय पत्ती 500 ग्राम',
        category: 'Grocery',
        sku: 'BRK-RED-500G',
        barcode: '8901030510045',
        purchasePrice: 230,
        sellingPrice: 270,
        stock: 14,
        minStockAlert: 10,
        unit: 'packet',
        supplierId: 'sup-1',
        supplierName: 'Ramesh Distributors',
        gstRate: 5,
        updatedAt: new Date()
      },
      {
        _id: 'item-11',
        name: 'Dove Cream Beauty Soap 3x100g',
        hindiName: 'डव साबुन 3-पैक',
        category: 'Personal Care',
        sku: 'DOV-SOP-3PK',
        barcode: '8901030610012',
        purchasePrice: 130,
        sellingPrice: 155,
        stock: 5, // LOW STOCK!
        minStockAlert: 12,
        unit: 'box',
        supplierId: 'sup-4',
        supplierName: 'Mahavir General Agencies',
        gstRate: 18,
        updatedAt: new Date()
      },
      {
        _id: 'item-12',
        name: 'Vicks Vaporub 50g',
        hindiName: 'विक्स वेपोरब 50 ग्राम',
        category: 'Medical',
        sku: 'VCK-VAP-50G',
        barcode: '4902430110023',
        purchasePrice: 110,
        sellingPrice: 135,
        stock: 22,
        minStockAlert: 10,
        unit: 'pcs',
        supplierId: 'sup-2',
        supplierName: 'Sharma Pharma & Surgical',
        gstRate: 12,
        updatedAt: new Date()
      },
      {
        _id: 'item-13',
        name: 'Haldiram Bhujia Sev 400g',
        hindiName: 'हल्दीराम भुजिया सेव 400 ग्राम',
        category: 'Snacks',
        sku: 'HLD-BHJ-400G',
        barcode: '8904063210034',
        purchasePrice: 85,
        sellingPrice: 105,
        stock: 40,
        minStockAlert: 15,
        unit: 'packet',
        supplierId: 'sup-3',
        supplierName: 'Mumbai Dairy & Snacks Agency',
        gstRate: 12,
        updatedAt: new Date()
      },
      {
        _id: 'item-14',
        name: 'MDH Degi Mirch Powder 100g',
        hindiName: 'एमडीएच देगी मिर्च मसाला 100g',
        category: 'Spices',
        sku: 'MDH-MIR-100G',
        barcode: '8902114010012',
        purchasePrice: 70,
        sellingPrice: 85,
        stock: 30,
        minStockAlert: 10,
        unit: 'packet',
        supplierId: 'sup-1',
        supplierName: 'Ramesh Distributors',
        gstRate: 5,
        updatedAt: new Date()
      },
      {
        _id: 'item-15',
        name: 'Everest Garam Masala 100g',
        hindiName: 'एवरेस्ट गरम मसाला 100 ग्राम',
        category: 'Spices',
        sku: 'EVR-GRM-100G',
        barcode: '8901786010023',
        purchasePrice: 65,
        sellingPrice: 80,
        stock: 6, // LOW STOCK!
        minStockAlert: 10,
        unit: 'packet',
        supplierId: 'sup-1',
        supplierName: 'Ramesh Distributors',
        gstRate: 5,
        updatedAt: new Date()
      },
      {
        _id: 'item-16',
        name: 'Britannia Good Day Cookies 600g',
        hindiName: 'ब्रिटानिया गुड डे कुकीज़ 600 ग्राम',
        category: 'Snacks',
        sku: 'BRT-GDD-600G',
        barcode: '8901063010045',
        purchasePrice: 110,
        sellingPrice: 130,
        stock: 50,
        minStockAlert: 15,
        unit: 'packet',
        supplierId: 'sup-3',
        supplierName: 'Mumbai Dairy & Snacks Agency',
        gstRate: 18,
        updatedAt: new Date()
      },
      {
        _id: 'item-17',
        name: 'Lifebuoy Total 10 Soap 125g',
        hindiName: 'लाइफबॉय टोटल 10 साबुन 125g',
        category: 'Personal Care',
        sku: 'LFB-SOP-125G',
        barcode: '8901030710034',
        purchasePrice: 32,
        sellingPrice: 40,
        stock: 80,
        minStockAlert: 20,
        unit: 'pcs',
        supplierId: 'sup-4',
        supplierName: 'Mahavir General Agencies',
        gstRate: 18,
        updatedAt: new Date()
      },
      {
        _id: 'item-18',
        name: 'Amul Taaza Homogenised Milk 1L',
        hindiName: 'अमूल ताज़ा दूध 1 लीटर',
        category: 'Dairy',
        sku: 'AML-MLK-1L',
        barcode: '8901262010056',
        purchasePrice: 64,
        sellingPrice: 72,
        stock: 2, // LOW STOCK!
        minStockAlert: 15,
        unit: 'ltr',
        supplierId: 'sup-3',
        supplierName: 'Mumbai Dairy & Snacks Agency',
        gstRate: 0,
        updatedAt: new Date()
      }
    ];

    if (!global.isUsingFallbackDB) {
      await Item.insertMany(itemsData);
    }
    localStore.items.push(...itemsData);

    // 4. Seed Historical Invoices (10 Realistic Sales)
    const invoicesData = [
      {
        _id: 'inv-1',
        invoiceNumber: 'INV-2026-001',
        customerName: 'Amit Verma',
        customerPhone: '9820198765',
        items: [
          { itemId: 'item-1', name: 'Tata Salt 1kg', hindiName: 'टाटा नमक 1 किलो', qty: 2, unit: 'packet', price: 30, purchasePrice: 25, gstRate: 5, total: 60, itemProfit: 10 },
          { itemId: 'item-6', name: 'Fortune Sunlite Sunflower Oil 1L', hindiName: 'फॉर्च्यून सूरजमुखी तेल 1 लीटर', qty: 1, unit: 'ltr', price: 145, purchasePrice: 125, gstRate: 5, total: 145, itemProfit: 20 }
        ],
        subtotal: 195.24,
        gstAmount: 9.76,
        discount: 0,
        grandTotal: 205,
        totalProfit: 30,
        paymentMethod: 'UPI',
        status: 'Paid',
        createdAt: new Date(Date.now() - 3600000 * 5) // 5 hours ago today
      },
      {
        _id: 'inv-2',
        invoiceNumber: 'INV-2026-002',
        customerName: 'Priya Nair (Khata)',
        customerPhone: '9833123456',
        items: [
          { itemId: 'item-3', name: 'Parle-G Biscuit 800g', hindiName: 'पारले-जी बिस्कुट 800 ग्राम', qty: 3, unit: 'packet', price: 90, purchasePrice: 75, gstRate: 18, total: 270, itemProfit: 45 },
          { itemId: 'item-10', name: 'Brooke Bond Red Label Tea 500g', hindiName: 'रेड लेबल चाय पत्ती 500 ग्राम', qty: 1, unit: 'packet', price: 270, purchasePrice: 230, gstRate: 5, total: 270, itemProfit: 40 }
        ],
        subtotal: 468.64,
        gstAmount: 71.36,
        discount: 0,
        grandTotal: 540,
        totalProfit: 85,
        paymentMethod: 'Khata',
        status: 'Pending',
        createdAt: new Date(Date.now() - 3600000 * 4) // 4 hours ago
      },
      {
        _id: 'inv-3',
        invoiceNumber: 'INV-2026-003',
        customerName: 'Sanjay Kadam',
        customerPhone: '9819876543',
        items: [
          { itemId: 'item-5', name: 'Dolo 650 Tablet Strip', hindiName: 'डोलो 650 गोली (15 पीस)', qty: 2, unit: 'strip', price: 32, purchasePrice: 22, gstRate: 12, total: 64, itemProfit: 20 },
          { itemId: 'item-12', name: 'Vicks Vaporub 50g', hindiName: 'विक्स वेपोरब 50 ग्राम', qty: 1, unit: 'pcs', price: 135, purchasePrice: 110, gstRate: 12, total: 135, itemProfit: 25 }
        ],
        subtotal: 177.68,
        gstAmount: 21.32,
        discount: 0,
        grandTotal: 199,
        totalProfit: 45,
        paymentMethod: 'Cash',
        status: 'Paid',
        createdAt: new Date(Date.now() - 3600000 * 3)
      },
      {
        _id: 'inv-4',
        invoiceNumber: 'INV-2026-004',
        customerName: 'Walking Customer',
        customerPhone: '',
        items: [
          { itemId: 'item-16', name: 'Britannia Good Day Cookies 600g', hindiName: 'ब्रिटानिया गुड डे कुकीज़ 600 ग्राम', qty: 2, unit: 'packet', price: 130, purchasePrice: 110, gstRate: 18, total: 260, itemProfit: 40 },
          { itemId: 'item-18', name: 'Amul Taaza Homogenised Milk 1L', hindiName: 'अमूल ताज़ा दूध 1 लीटर', qty: 2, unit: 'ltr', price: 72, purchasePrice: 64, gstRate: 0, total: 144, itemProfit: 16 }
        ],
        subtotal: 364.34,
        gstAmount: 39.66,
        discount: 0,
        grandTotal: 404,
        totalProfit: 56,
        paymentMethod: 'UPI',
        status: 'Paid',
        createdAt: new Date(Date.now() - 3600000 * 2)
      },
      {
        _id: 'inv-5',
        invoiceNumber: 'INV-2026-005',
        customerName: 'Deepak Rao (Khata)',
        customerPhone: '9820554433',
        items: [
          { itemId: 'item-4', name: 'Aashirvaad Shudh Chakki Atta 5kg', hindiName: 'आशीर्वाद आटा 5 किलो', qty: 1, unit: 'kg', price: 240, purchasePrice: 210, gstRate: 5, total: 240, itemProfit: 30 },
          { itemId: 'item-8', name: 'Surf Excel Easy Wash 1kg', hindiName: 'सर्फ एक्सेल वाशिंग पाउडर 1 किलो', qty: 2, unit: 'packet', price: 135, purchasePrice: 115, gstRate: 18, total: 270, itemProfit: 40 }
        ],
        subtotal: 457.63,
        gstAmount: 52.37,
        discount: 0,
        grandTotal: 510,
        totalProfit: 70,
        paymentMethod: 'Khata',
        status: 'Pending',
        createdAt: new Date(Date.now() - 3600000 * 1)
      }
    ];

    if (!global.isUsingFallbackDB) {
      await Invoice.insertMany(invoicesData);
    }
    localStore.invoices.push(...invoicesData);

    // 5. Seed Purchase Orders
    const poData = [
      {
        _id: 'po-1',
        poNumber: 'PO-2026-001',
        supplierId: 'sup-3',
        supplierName: 'Mumbai Dairy & Snacks Agency',
        supplierPhone: '+91 98334 45566',
        supplierWhatsapp: '+91 98334 45566',
        items: [
          { itemId: 'item-2', name: 'Amul Butter 500g', qty: 20, unit: 'packet', estimatedPrice: 260, total: 5200 },
          { itemId: 'item-18', name: 'Amul Taaza Homogenised Milk 1L', qty: 30, unit: 'ltr', estimatedPrice: 64, total: 1920 }
        ],
        totalAmount: 7120,
        status: 'Sent',
        notes: 'Low stock alert triggered AI reorder. Please deliver by tomorrow morning.',
        orderDate: new Date(Date.now() - 86400000 * 3), // 3 days ago
        expectedDate: new Date(Date.now() - 86400000)
      },
      {
        _id: 'po-2',
        poNumber: 'PO-2026-002',
        supplierId: 'sup-1',
        supplierName: 'Ramesh Distributors',
        supplierPhone: '+91 98201 11223',
        supplierWhatsapp: '+91 98201 11223',
        items: [
          { itemId: 'item-4', name: 'Aashirvaad Shudh Chakki Atta 5kg', qty: 15, unit: 'kg', estimatedPrice: 210, total: 3150 },
          { itemId: 'item-15', name: 'Everest Garam Masala 100g', qty: 25, unit: 'packet', estimatedPrice: 65, total: 1625 }
        ],
        totalAmount: 4775,
        status: 'Received',
        notes: 'Drafted automatically by Store AI Assistant and fulfilled on schedule.',
        orderDate: new Date(Date.now() - 86400000 * 1), // 1 day ago
        expectedDate: new Date()
      },
      {
        _id: 'po-3',
        poNumber: 'PO-2026-003',
        supplierId: 'sup-2',
        supplierName: 'Sharma Pharma & Surgical',
        supplierPhone: '+91 98209 87654',
        supplierWhatsapp: '+91 98209 87654',
        items: [
          { itemId: 'item-5', name: 'Dolo 650 Tablet Strip', qty: 40, unit: 'strip', estimatedPrice: 22, total: 880 },
          { itemId: 'item-11', name: 'Vicks Vaporub 50g', qty: 20, unit: 'box', estimatedPrice: 110, total: 2200 },
          { itemId: 'item-12', name: 'Dettol Antiseptic Liquid 500ml', qty: 15, unit: 'ltr', estimatedPrice: 155, total: 2325 }
        ],
        totalAmount: 5405,
        status: 'Sent',
        notes: 'Urgent medical inventory restocking. Dispatched via automated WhatsApp trigger.',
        orderDate: new Date(),
        expectedDate: new Date(Date.now() + 86400000 * 1)
      },
      {
        _id: 'po-4',
        poNumber: 'PO-2026-004',
        supplierId: 'sup-4',
        supplierName: 'Mahavir General Agencies',
        supplierPhone: '+91 98112 23344',
        supplierWhatsapp: '+91 98112 23344',
        items: [
          { itemId: 'item-8', name: 'Surf Excel Easy Wash 1kg', qty: 20, unit: 'kg', estimatedPrice: 110, total: 2200 },
          { itemId: 'item-14', name: 'Colgate Strong Teeth 200g', qty: 30, unit: 'pcs', estimatedPrice: 85, total: 2550 }
        ],
        totalAmount: 4750,
        status: 'Draft',
        notes: 'AI predicted stockout in household cleaning aisle. Pending approval.',
        orderDate: new Date(),
        expectedDate: new Date(Date.now() + 86400000 * 2)
      }
    ];

    if (!global.isUsingFallbackDB) {
      await PurchaseOrder.insertMany(poData);
    }
    localStore.purchaseOrders.push(...poData);

    console.log(`[Store AI] 🌾 Seeding complete! 18 Products, 4 Suppliers, 5 Invoices, and 4 POs ready.`);
    if (isStandalone) {
      process.exit(0);
    }
  } catch (err: any) {
    console.error(`[Store AI] ❌ Seeding Error:`, err);
    if (isStandalone) process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase(true);
}
