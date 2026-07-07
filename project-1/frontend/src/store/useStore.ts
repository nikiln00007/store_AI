import { create } from 'zustand';
import axios from 'axios';
import { api } from '../lib/api.js';
import { User, Item, Language } from '../types/index.js';

interface CartItem extends Item {
  qty: number;
}

interface StoreState {
  // Auth
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // POS Cart
  cart: CartItem[];
  customerName: string;
  customerPhone: string;
  paymentMethod: 'Cash' | 'UPI' | 'Khata';
  discount: number;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setPaymentMethod: (method: 'Cash' | 'UPI' | 'Khata') => void;
  setDiscount: (disc: number) => void;
  addToCart: (item: Item, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  clearCart: () => void;

  // AI Modal
  isAIModalOpen: boolean;
  aiPrompt: string;
  openAIModal: (prompt?: string) => void;
  closeAIModal: () => void;
  setAIPrompt: (prompt: string) => void;
}

const savedToken = localStorage.getItem('dukaan_token');
const savedUser = localStorage.getItem('dukaan_user') ? JSON.parse(localStorage.getItem('dukaan_user')!) : null;
const savedLang: Language = 'en';

if (savedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

export const useStore = create<StoreState>((set, get) => ({
  // Auth
  token: savedToken,
  user: savedUser,
  isAuthenticated: !!savedToken,
  setAuth: (token, user) => {
    localStorage.setItem('dukaan_token', token);
    localStorage.setItem('dukaan_user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('dukaan_token');
    localStorage.removeItem('dukaan_user');
    delete axios.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];
    set({ token: null, user: null, isAuthenticated: false });
  },

  // Language
  language: savedLang,
  setLanguage: (lang) => {
    localStorage.setItem('dukaan_lang', lang);
    set({ language: lang });
  },

  // POS Cart
  cart: [],
  customerName: '',
  customerPhone: '',
  paymentMethod: 'UPI',
  discount: 0,
  setCustomerName: (name) => set({ customerName: name }),
  setCustomerPhone: (phone) => set({ customerPhone: phone }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setDiscount: (discount) => set({ discount }),
  addToCart: (item, qty = 1) => {
    const currentCart = get().cart;
    const itemId = item._id || item.id || '';
    const existingIndex = currentCart.findIndex(i => (i._id || i.id) === itemId);

    if (existingIndex > -1) {
      const updated = [...currentCart];
      updated[existingIndex].qty += qty;
      set({ cart: updated });
    } else {
      set({ cart: [...currentCart, { ...item, qty }] });
    }
  },
  removeFromCart: (itemId) => {
    set({ cart: get().cart.filter(i => (i._id || i.id) !== itemId) });
  },
  updateCartQty: (itemId, qty) => {
    if (qty <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    const updated = get().cart.map(i => (i._id || i.id) === itemId ? { ...i, qty } : i);
    set({ cart: updated });
  },
  clearCart: () => set({ cart: [], customerName: '', customerPhone: '', discount: 0, paymentMethod: 'UPI' }),

  // AI Modal
  isAIModalOpen: false,
  aiPrompt: '',
  openAIModal: (prompt = '') => set({ isAIModalOpen: true, aiPrompt: prompt }),
  closeAIModal: () => set({ isAIModalOpen: false, aiPrompt: '' }),
  setAIPrompt: (prompt) => set({ aiPrompt: prompt })
}));
