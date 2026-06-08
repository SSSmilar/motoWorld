import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as cartSvc from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const reloadCart = useCallback(() => {
    if (user) {
      setCartItems(cartSvc.get_cart(user.userId));
    } else {
      setCartItems([]);
    }
  }, [user?.userId]);

  useEffect(() => {
    reloadCart();
  }, [reloadCart]);

  const getCartQuantity = useCallback(
    (productId) => {
      const item = cartItems.find((i) => i.type === 'part' && i.productId === productId);
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  const addToCart = (product, quantity = 1) => {
    if (!user || !product) return;
    cartSvc.add_part_to_cart(user.userId, product, quantity);
    reloadCart();
  };

  const addCustomBuild = (build) => {
    if (!user || !build) return;
    cartSvc.add_custom_build_to_cart(user.userId, build);
    reloadCart();
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (!user) return;
    cartSvc.update_cart_item_quantity(user.userId, cartItemId, quantity);
    reloadCart();
  };

  const removeFromCart = (cartItemId) => {
    if (!user) return;
    cartSvc.remove_from_cart(user.userId, cartItemId);
    reloadCart();
  };

  const clearCart = () => {
    if (!user) return;
    cartSvc.clear_cart(user.userId);
    setCartItems([]);
  };

  const cartTotal = useMemo(() => cartSvc.get_cart_total(cartItems), [cartItems]);

  const cartCount = useMemo(
    () => cartItems.reduce((s, i) => s + (i.quantity ?? 1), 0),
    [cartItems]
  );

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen]);

  const value = {
    cartItems,
    addToCart,
    addCustomBuild,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    getCartQuantity,
    isCartOpen,
    toggleCart: () => setIsCartOpen((v) => !v),
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
