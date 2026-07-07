import mongoose, { Schema, Document } from 'mongoose';

export interface IPOItem {
  itemId?: string;
  name: string;
  hindiName?: string;
  qty: number;
  unit: string;
  estimatedPrice: number;
  total: number;
}

export interface IPurchaseOrder extends Document {
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierPhone: string;
  supplierWhatsapp: string;
  items: IPOItem[];
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Received' | 'Cancelled';
  notes: string;
  orderDate: Date;
  expectedDate: Date;
}

const POItemSchema: Schema = new Schema({
  itemId: { type: String },
  name: { type: String, required: true },
  hindiName: { type: String, default: '' },
  qty: { type: Number, required: true },
  unit: { type: String, default: 'pcs' },
  estimatedPrice: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const PurchaseOrderSchema: Schema = new Schema({
  poNumber: { type: String, required: true, unique: true },
  supplierId: { type: String, required: true },
  supplierName: { type: String, required: true },
  supplierPhone: { type: String, default: '' },
  supplierWhatsapp: { type: String, default: '' },
  items: [POItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Draft', 'Sent', 'Received', 'Cancelled'], default: 'Draft' },
  notes: { type: String, default: 'Please dispatch urgently. Payment via UPI upon delivery.' },
  orderDate: { type: Date, default: Date.now },
  expectedDate: { type: Date, default: () => new Date(Date.now() + 86400000 * 2) } // 2 days later
}, { bufferCommands: false, bufferTimeoutMS: 100 });

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
