import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    itemCount: 0,
    subtotal: 0,
    tax: 0,
    shippingFee: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  // Sync cart when user signs in or out
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setItems([]);
      setSummary({ itemCount: 0, subtotal: 0, tax: 0, shippingFee: 0, total: 0 });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to add products to your cart');
    }
    const res = await api.post('/cart', { productId, quantity });
    if (res.success) {
      await fetchCart();
      return res.message;
    }
    throw new Error(res.message || 'Failed to add item to cart');
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (!isAuthenticated) return;
    const res = await api.put(`/cart/${cartItemId}`, { quantity });
    if (res.success) {
      await fetchCart();
    } else {
      throw new Error(res.message || 'Failed to update quantity');
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!isAuthenticated) return;
    const res = await api.delete(`/cart/${cartItemId}`);
    if (res.success) {
      await fetchCart();
    } else {
      throw new Error(res.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    const res = await api.delete('/cart');
    if (res.success) {
      setItems([]);
      setSummary({ itemCount: 0, subtotal: 0, tax: 0, shippingFee: 0, total: 0 });
    }
  };

  const value = {
    items,
    summary,
    itemCount: summary.itemCount || 0,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
