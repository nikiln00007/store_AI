import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { localStore } from '../utils/localStore.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dukaan_ai_super_secret_key_2026';

// Default demo user object — used as ultimate fallback everywhere
const DEFAULT_DEMO_USER = {
  _id: 'user-1',
  name: 'Rahul Sharma',
  email: 'rahul@store.ai',
  phone: '+91 98201 23456',
  shopName: 'Sharma General Store',
  shopType: 'Retail & Medical Superstore',
  city: 'Mumbai',
  address: 'Shop No. 4, MG Road, Andheri West, Mumbai, Maharashtra 400058',
  gstNumber: '27AABCU9603R1ZM',
  upiId: 'sharma.store@okaxis',
  languagePreference: 'en'
};

// Helper to generate JWT
const generateToken = (user: any) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, name: user.name, shopName: user.shopName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Safe Mongoose query helper — tries Mongoose, catches ANY error, falls back to localStore
const safeMongoFind = async (modelName: string, query: any): Promise<any | null> => {
  // If we know we're using fallback, don't even try Mongoose
  if (global.isUsingFallbackDB) return null;

  try {
    // Dynamically import the model to avoid top-level import issues
    const { User } = await import('../models/User.js');
    const result = await User.findOne(query);
    return result;
  } catch (err: any) {
    console.warn(`[Auth] Mongoose query failed (${err.message}), using localStore fallback`);
    return null;
  }
};

// 1. Prominent Demo Login (Pre-filled Rahul Sharma, Kirana Store, Mumbai)
router.post('/demo-login', async (req: Request, res: Response) => {
  try {
    // On Vercel serverless, ALWAYS use localStore or hardcoded demo user — never touch Mongoose
    let user: any = localStore.users[0] || DEFAULT_DEMO_USER;

    // Only attempt MongoDB if NOT on Vercel and NOT using fallback
    if (!process.env.VERCEL && !global.isUsingFallbackDB) {
      const mongoUser = await safeMongoFind('User', { email: 'rahul@store.ai' });
      if (mongoUser) user = mongoUser;
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      message: 'Welcome back! Logged in to Store AI. 🌿',
      token,
      user
    });
  } catch (err: any) {
    // Even if everything fails, still return the demo user so login NEVER breaks
    const token = generateToken(DEFAULT_DEMO_USER);
    return res.json({
      success: true,
      message: 'Welcome back! Logged in to Store AI. 🌿',
      token,
      user: DEFAULT_DEMO_USER
    });
  }
});

// 2. Standard Login / OTP simulation
router.post('/login', async (req: Request, res: Response) => {
  const { email, password, phone } = req.body;
  try {
    let user: any;

    // Always check localStore first (works on both Vercel and local)
    user = localStore.users.find(u => u.email === email || u.phone === phone);

    // If not found in localStore AND not on Vercel, try MongoDB
    if (!user && !process.env.VERCEL && !global.isUsingFallbackDB) {
      user = await safeMongoFind('User', { $or: [{ email }, { phone }] });
    }

    // If still not found, check if it's the demo user credentials
    if (!user && (email === 'rahul@store.ai' || email === 'rahul@dukaan.ai' || phone === '9820123456')) {
      user = localStore.users[0] || DEFAULT_DEMO_USER;
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found. Try Demo Login!' });
    }

    const token = generateToken(user);
    return res.json({ success: true, token, user });
  } catch (err: any) {
    // Fallback: if anything crashes, try to return demo user for known emails
    if (email === 'rahul@store.ai' || email === 'rahul@dukaan.ai') {
      const token = generateToken(DEFAULT_DEMO_USER);
      return res.json({ success: true, token, user: DEFAULT_DEMO_USER });
    }
    return res.status(500).json({ error: err.message });
  }
});

// 3. Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, shopName, shopType, city } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const newUserObj = {
      _id: `user-${Date.now()}`,
      name: name || 'Retail Shopkeeper',
      email: email || `user_${Date.now()}@store.ai`,
      password: hashedPassword,
      phone: phone || '+91 98000 00000',
      shopName: shopName || 'My General Store',
      shopType: shopType || 'Retail Store',
      city: city || 'Mumbai',
      address: `${shopName || 'Shop'}, ${city || 'Mumbai'}`,
      languagePreference: 'en',
      createdAt: new Date()
    };

    // Try MongoDB, but don't let it crash registration
    if (!process.env.VERCEL && !global.isUsingFallbackDB) {
      try {
        const { User } = await import('../models/User.js');
        await User.create(newUserObj);
      } catch (dbErr: any) {
        console.warn(`[Auth] MongoDB create failed (${dbErr.message}), saving to localStore only`);
      }
    }
    localStore.users.push(newUserObj);

    const token = generateToken(newUserObj);
    return res.status(201).json({ success: true, token, user: newUserObj });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Get Current User / Me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let user: any;

    // Always check localStore first
    user = localStore.users.find(u => (u._id || u.id) === req.user.id) || localStore.users[0];

    // If not found in localStore AND not on Vercel, try MongoDB
    if (!user && !process.env.VERCEL && !global.isUsingFallbackDB) {
      try {
        const { User } = await import('../models/User.js');
        user = await User.findById(req.user.id);
        if (!user) user = await User.findOne({ email: req.user.email });
      } catch (dbErr: any) {
        console.warn(`[Auth] MongoDB query failed (${dbErr.message}), using localStore`);
      }
    }

    // Ultimate fallback
    if (!user) user = DEFAULT_DEMO_USER;

    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
