import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  itemId?: string;
  name: string;
  hindiName?: string;
  qty: number;
  unit: string;
  price: number;
  purchasePrice: number;
  gstRate: number;
  total: number;
  itemProfit: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: IInvoiceItem[];
  subtotal: number;
  gstAmount: number;
  discount: number;
  grandTotal: number;
  totalProfit: number;
  paymentMethod: 'Cash' | 'UPI' | 'Khata';
  status: 'Paid' | 'Pending';
  createdAt: Date;
}

const InvoiceItemSchema: Schema = new Schema({
  itemId: { type: String },
  name: { type: String, required: true },
  hindiName: { type: String, default: '' },
  qty: { type: Number, required: true },
  unit: { type: String, default: 'pcs' },
  price: { type: Number, required: true },
  purchasePrice: { type: Number, default: 0 },
  gstRate: { type: Number, default: 5 },
  total: { type: Number, required: true },
  itemProfit: { type: Number, default: 0 }
}, { _id: false });

const InvoiceSchema: Schema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, default: 'Walking Customer' },
  customerPhone: { type: String, default: '' },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, required: true },
  gstAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  totalProfit: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Khata'], default: 'UPI' },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
  createdAt: { type: Date, default: Date.now }
}, { bufferCommands: false, bufferTimeoutMS: 100 });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
