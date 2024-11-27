import { create } from 'zustand';
import { CartItem, CustomerInfo, PaymentInfo, Product } from '../types';

interface Store {
  cart: CartItem[];
  customerInfo: CustomerInfo | null;
  paymentInfo: PaymentInfo | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCustomerInfo: (info: CustomerInfo) => void;
  setPaymentInfo: (info: PaymentInfo) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const DELIVERY_FEE = 2000; // Costo fijo de envío

export const useStore = create<Store>((set, get) => ({
  cart: [],
  customerInfo: null,
  paymentInfo: null,

  addToCart: (product) => {
    set((state) => {
      const existingItem = state.cart.find(item => item.product.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return { cart: [...state.cart, { product, quantity: 1 }] };
    });
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter(item => item.product.id !== productId)
    }));
  },

  updateQuantity: (productId, quantity) => {
    set((state) => ({
      cart: quantity === 0
        ? state.cart.filter(item => item.product.id !== productId)
        : state.cart.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
    }));
  },

  setCustomerInfo: (info) => {
    set({ customerInfo: info });
  },

  setPaymentInfo: (info) => {
    set({ paymentInfo: info });
  },

  clearCart: () => {
    set({ cart: [], customerInfo: null, paymentInfo: null });
  },

  getTotalPrice: () => {
    const { cart } = get();
    const subtotal = cart.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0);
    return subtotal + DELIVERY_FEE;
  },
}));