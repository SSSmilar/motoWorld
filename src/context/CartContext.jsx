import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as cartSvc from '../services/cartService';
import { getProducts } from '../services/productService';

const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

/**
 * CartProvider — корзина привязана к текущему пользователю.
 * Данные хранятся в LocalStorage через cartService.
 */
export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]); // [{ productId, quantity }]
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Загружаем корзину при смене пользователя
  useEffect(() => {
    if (user) {
      setCartItems(cartSvc.getCart(user.userId));
    } else {
      setCartItems([]);
    }
  }, [user]);

  const products = useMemo(() => getProducts(), [cartItems]);

  /** Получить количество данного товара уже в корзине */
  const getCartQuantity = useCallback(
    (productId) => {
      const item = cartItems.find((i) => i.productId === productId);
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  const addToCart = (productId) => {
    if (!user) return;
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const updated = cartSvc.addToCart(user.userId, productId, product.stock);
    setCartItems([...updated]);
  };

  const updateQuantity = (productId, quantity) => {
    if (!user) return;
    const product = products.find((p) => p.id === productId);
    const maxQty = product ? product.stock : quantity;
    const clamped = Math.min(quantity, maxQty);
    const updated = cartSvc.updateCartItem(user.userId, productId, clamped);
    setCartItems([...updated]);
  };

  const removeFromCart = (productId) => {
    if (!user) return;
    const updated = cartSvc.removeFromCart(user.userId, productId);
    setCartItems([...updated]);
  };

  const clearCart = () => {
    if (!user) return;
    cartSvc.clearCart(user.userId);
    setCartItems([]);
  };

  // Обогащённые элементы корзины (с данными товара)
  const enrichedItems = useMemo(() => {
    return cartItems.map((ci) => {
      const p = products.find((pr) => pr.id === ci.productId) || {};
      return { ...ci, title: p.title, price: p.price, imageUrl: p.imageUrl, stock: p.stock };
    });
  }, [cartItems, products]);

  const cartTotal = useMemo(
    () => enrichedItems.reduce((s, i) => s + (i.price || 0) * i.quantity, 0),
    [enrichedItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((s, i) => s + i.quantity, 0),
    [cartItems]
  );

  // Блокировка скролла при открытой корзине
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen]);

  const value = {
    cartItems: enrichedItems,
    addToCart,
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
