// Cart context for managing shopping cart state across the application

import { createContext, useContext, useState, ReactNode } from 'react';
import { products } from '../lib/sample-data';

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  getCartSummary: () => CartSummary;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (productId: string, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === productId);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, {
        productId,
        quantity,
        addedAt: new Date().toISOString()
      }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prevItems => prevItems.filter(item => item.productId !== productId));
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === productId);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        );
      }
      
      return [...prevItems, {
        productId,
        quantity,
        addedAt: new Date().toISOString()
      }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: string) => {
    return items.find(item => item.productId === productId)?.quantity || 0;
  };

  const getCartSummary = (): CartSummary => {
    const subtotal = items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const deliveryFee = subtotal >= 500 ? 0 : 40; // Free delivery above ₹500
    const totalPrice = subtotal + tax + deliveryFee;

    return {
      items,
      totalItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      deliveryFee,
      totalPrice: Math.round(totalPrice * 100) / 100
    };
  };

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
    getCartSummary
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};