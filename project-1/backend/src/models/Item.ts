import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
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
  gstRate: number; // 0, 5, 12, 18, 28
  updatedAt: Date;
}

const ItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  hindiName: { type: String, default: '' },
  category: { type: String, required: true },
  sku: { type: String, required: true },
  barcode: { type: String, default: '' },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  minStockAlert: { type: Number, required: true, default: 10 },
  unit: { type: String, enum: ['kg', 'ltr', 'pcs', 'packet', 'box', 'strip', 'gm', 'ml'], default: 'pcs' },
  supplierId: { type: String },
  supplierName: { type: String },
  gstRate: { type: Number, default: 5 },
  updatedAt: { type: Date, default: Date.now }
}, { bufferCommands: false, bufferTimeoutMS: 100 });

export const Item = mongoose.model<IItem>('Item', ItemSchema);
