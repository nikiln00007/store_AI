export type Language = 'en' | 'hi' | 'hinglish';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  shopName: string;
  shopType: string;
  city: string;
  address: string;
  gstNumber?: string;
  upiId?: string;
  languagePreference: Language;
}

export interface Item {
  _id?: string;
  id?: string;
  name: string;
  hindiName?: string;
  category: string;
  sku: string;
  barcode?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  unit: 'kg' | 'ltr' | 'pcs' | 'packet' | 'box' | 'strip' | 'gm' | 'ml';
  supplierId?: string;
  supplierName?: string;
  gstRate: number;
  updatedAt?: string;
}

export interface Supplier {
  _id?: string;
  id?: string;
  name: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address?: string;
  rating: number;
  categories: string[];
  paymentTerms: string;
  deliveryTimeDays?: number;
  itemsCount?: number;
  priceAdvantage?: string;
}

export interface InvoiceItem {
  itemId?: string;
  name: string;
  hindiName?: string;
  qty: number;
  unit: string;
  price: number;
  purchasePrice?: number;
  gstRate: number;
  total: number;
  itemProfit?: number;
}

export interface Invoice {
  _id?: string;
  id?: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  discount: number;
  grandTotal: number;
  totalProfit?: number;
  paymentMethod: 'Cash' | 'UPI' | 'Khata';
  status: 'Paid' | 'Pending';
  createdAt?: string;
}

export interface PurchaseOrder {
  _id?: string;
  id?: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  supplierWhatsapp?: string;
  items: {
    itemId?: string;
    name: string;
    hindiName?: string;
    qty: number;
    unit: string;
    estimatedPrice: number;
    total: number;
  }[];
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Received' | 'Cancelled';
  notes?: string;
  orderDate?: string;
  expectedDate?: string;
}
