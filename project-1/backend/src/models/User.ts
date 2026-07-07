import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone: string;
  shopName: string;
  shopType: string;
  city: string;
  address: string;
  gstNumber?: string;
  upiId?: string;
  languagePreference: 'en' | 'hi' | 'hinglish';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String, required: true },
  shopName: { type: String, required: true },
  shopType: { type: String, default: 'Kirana Store' },
  city: { type: String, default: 'Mumbai' },
  address: { type: String, default: 'Shop No 4, MG Road, Andheri West, Mumbai' },
  gstNumber: { type: String, default: '27AABCU9603R1ZM' },
  upiId: { type: String, default: 'rahul.kirana@okaxis' },
  languagePreference: { type: String, enum: ['en', 'hi', 'hinglish'], default: 'hinglish' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);
