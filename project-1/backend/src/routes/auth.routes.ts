import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { localStore } from '../utils/localStore.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dukaan_ai_super_secret_key_2026';

// Helper to generate JWT
const generateToken = (user: any) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, name: user.name, shopName: user.shopName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 1. Prominent Demo Login (Pre-filled Rahul Sharma, Kirana Store, Mumbai)
router.post('/demo-login', async (req: Request, res: Response) => {
  try {
    let user: any;
    if (global.isUsingFallbackDB) {
      user = localStore.users[0] || {
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
    } else {
      user = await User.findOne({ email: 'rahul@store.ai' });
      if (!user) {
        // If not found in DB, return default Rahul Sharma
        user = {
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
      }
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      message: 'Welcome back! Logged in to Store AI. 🌿',
      token,
      user
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Standard Login / OTP simulation
router.post('/login', async (req: Request, res: Response) => {
  const { email, password, phone } = req.body;
  try {
    let user: any;
    if (global.isUsingFallbackDB) {
      user = localStore.users.find(u => u.email === email || u.phone === phone) || localStore.users[0];
    } else {
      user = await User.findOne({ $or: [{ email }, { phone }] });
      if (!user && (email === 'rahul@store.ai' || email === 'rahul@dukaan.ai' || phone === '9820123456')) {
        return res.redirect('/api/auth/demo-login');
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found. Try Demo Login!' });
    }

    const token = generateToken(user);
    return res.json({ success: true, token, user });
  } catch (err: any) {
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

    if (!global.isUsingFallbackDB) {
      await User.create(newUserObj);
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
    if (global.isUsingFallbackDB) {
      user = localStore.users.find(u => (u._id || u.id) === req.user.id) || localStore.users[0];
    } else {
      user = await User.findById(req.user.id);
      if (!user) user = await User.findOne({ email: req.user.email });
    }
    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
