import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  rating: number; // 1 to 5 stars
  categories: string[];
  paymentTerms: string; // e.g., 'Immediate', '7 Days Khata', '15 Days Credit'
  deliveryTimeDays: number;
  createdAt: Date;
}

const SupplierSchema: Schema = new Schema({
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, required: true },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  rating: { type: Number, default: 4.8 },
  categories: [{ type: String }],
  paymentTerms: { type: String, default: 'Immediate' },
  deliveryTimeDays: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
}, { bufferCommands: false, bufferTimeoutMS: 100 });

export const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);
