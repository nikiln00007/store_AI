import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Disable Mongoose command buffering globally BEFORE any models or routes are imported!
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 100);

import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seed.js';
import authRoutes from './routes/auth.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import suppliersRoutes from './routes/suppliers.routes.js';
import billingRoutes from './routes/billing.routes.js';
import aiRoutes from './routes/ai.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Welcome Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Store AI — Smart Autonomous Business Assistant',
    version: '1.0.0',
    status: 'Active 🌿',
    message: 'Welcome! Backend server is 100% online and operational.'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/invoices', billingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serverless DB Initialization Guard
let dbInitPromise: Promise<void> | null = null;
const initDatabase = async () => {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await connectDB();
      console.log(`[Store AI] 🌱 Initializing automatic demo seeding...`);
      await seedDatabase(false);
    })();
  }
  return dbInitPromise;
};

app.use(async (req, res, next) => {
  try {
    await initDatabase();
  } catch (err) {
    console.error('[Store AI] DB Initialization error:', err);
  }
  next();
});

// Start Server locally (skip listen on Vercel serverless functions)
if (!process.env.VERCEL) {
  initDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`\n=============================================================`);
      console.log(`🌿 STORE AI BACKEND SERVER ONLINE ON PORT ${PORT}`);
      console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📦 Seeded with 18 Realistic Retail Items & 4 Suppliers`);
      console.log(`=============================================================\n`);
    });
  }).catch(err => {
    console.error(`[Server Error]`, err);
  });
}

export default app;
