import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice.js';
import { Item } from '../models/Item.js';
import { localStore } from '../utils/localStore.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// 1. Get Dashboard Summary Metrics
router.get('/summary', async (req: Request, res: Response) => {
  try {
    let invoices: any[] = [];
    let items: any[] = [];

    if (global.isUsingFallbackDB) {
      invoices = [...localStore.invoices];
      items = [...localStore.items];
    } else {
      invoices = await Invoice.find({});
      items = await Item.find({});
    }

    const todaySales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const todayProfit = invoices.reduce((sum, inv) => sum + (inv.totalProfit || inv.grandTotal * 0.2), 0);
    const lowStockCount = items.filter(it => it.stock <= it.minStockAlert).length;
    const pendingKhata = invoices.filter(inv => inv.paymentMethod === 'Khata' && inv.status === 'Pending')
                                 .reduce((sum, inv) => sum + inv.grandTotal, 0) + 3200; // baseline khata

    return res.json({
      success: true,
      summary: {
        todaySales: Math.round(todaySales),
        todayProfit: Math.round(todayProfit),
        lowStockCount,
        pendingKhata: Math.round(pendingKhata),
        activeOrders: 2
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Get Chart Data for Recharts (Revenue trend, Category breakdown, Top items)
router.get('/charts', async (req: Request, res: Response) => {
  try {
    // 7-day revenue trend
    const revenueTrend = [
      { day: 'Mon', sales: 4200, profit: 950 },
      { day: 'Tue', sales: 5100, profit: 1180 },
      { day: 'Wed', sales: 4800, profit: 1050 },
      { day: 'Thu', sales: 6300, profit: 1520 },
      { day: 'Fri', sales: 5900, profit: 1380 },
      { day: 'Sat', sales: 7400, profit: 1850 },
      { day: 'Sun', sales: 8100, profit: 2100 }
    ];

    // Category distribution
    const categoryBreakdown = [
      { name: 'Grocery & Staples', value: 38, color: '#E07A5F' },
      { name: 'Dairy & Snacks', value: 27, color: '#66D4A3' },
      { name: 'Medical & Pharma', value: 18, color: '#FFB300' },
      { name: 'Personal Care', value: 10, color: '#2E7D32' },
      { name: 'Household', value: 7, color: '#FF8A80' }
    ];

    // Top selling items
    const topItems = [
      { name: 'Amul Butter 500g', sold: 48, revenue: 13680 },
      { name: 'Parle-G Biscuit 800g', sold: 65, revenue: 5850 },
      { name: 'Tata Salt 1kg', sold: 42, revenue: 1260 },
      { name: 'Aashirvaad Atta 5kg', sold: 18, revenue: 4320 },
      { name: 'Dolo 650 Strip', sold: 55, revenue: 1760 }
    ];

    return res.json({
      success: true,
      charts: {
        revenueTrend,
        categoryBreakdown,
        topItems
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Get AI Narrative Business Insights
router.get('/ai-insights', async (req: Request, res: Response) => {
  try {
    const insights = [
      {
        id: 'ins-1',
        type: 'growth',
        titleEn: 'Dairy Products Generating 24% Net Profit Margin!',
        titleHi: 'डेयरी और स्नैक्स में सबसे ज्यादा मुनाफा (24% मार्जिन)!',
        descriptionEn: 'Your sales for Amul Butter and Milk increased by 18% this weekend. Consider expanding refrigeration capacity.',
        descriptionHi: 'इस वीकेंड अमूल मक्खन और दूध की बिक्री में 18% की वृद्धि हुई है। स्टॉक हमेशा फुल रखें।',
        actionText: 'Restock Dairy Now',
        actionLink: '/suppliers'
      },
      {
        id: 'ins-2',
        type: 'warning',
        titleEn: '6 Essential Items Reaching Low Stock Threshold',
        titleHi: '6 जरूरी सामानों का स्टॉक खत्म होने वाला है!',
        descriptionEn: 'Aashirvaad Atta (3 left), Amul Butter (4 left), and Dove Soap (5 left) need immediate purchase orders.',
        descriptionHi: 'आशीर्वाद आटा (3 बचे), अमूल मक्खन (4 बचे) और डव साबुन का तुरंत ऑर्डर भेजें ताकि ग्राहक न लौटें।',
        actionText: 'AI Auto-Order All',
        actionLink: '/ai'
      },
      {
        id: 'ins-3',
        type: 'tip',
        titleEn: 'Store Credit Recovery Opportunity: ₹3,200 Pending',
        titleHi: 'खाता वसूली का मौका: ₹3,200 बाकी हैं',
        descriptionEn: 'Sending WhatsApp payment reminders on Sunday evening results in 68% faster store credit settlements.',
        descriptionHi: 'रविवार शाम को व्हाट्सएप पर UPI पेमेंट रिमाइंडर भेजने से 68% जल्दी खाता का पैसा वापस मिलता है।',
        actionText: 'Send Reminders',
        actionLink: '/billing'
      }
    ];

    return res.json({ success: true, insights });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Export CSV / Excel simulation
router.get('/export', async (req: Request, res: Response) => {
  try {
    let invoices: any[] = [];
    if (global.isUsingFallbackDB) {
      invoices = [...localStore.invoices];
    } else {
      invoices = await Invoice.find({});
    }

    // Generate clean CSV header & rows
    const header = 'Invoice Number,Customer Name,Payment Method,Subtotal (INR),GST (INR),Grand Total (INR),Net Profit (INR),Status,Date\n';
    const rows = invoices.map(inv => 
      `"${inv.invoiceNumber}","${inv.customerName}","${inv.paymentMethod}",${inv.subtotal},${inv.gstAmount},${inv.grandTotal},${inv.totalProfit || 0},"${inv.status}","${new Date(inv.createdAt).toLocaleDateString()}"`
    ).join('\n');

    const csvContent = header + rows;

    res.header('Content-Type', 'text/csv');
    res.attachment(`Store_AI_Sales_Report_${new Date().toISOString().slice(0,10)}.csv`);
    return res.send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
