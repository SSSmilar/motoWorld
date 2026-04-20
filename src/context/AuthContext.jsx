import React, { createContext, useContext, useState, useEffect } from 'react';
import { initAuth, getSession, login as svcLogin, register as svcRegister, logout as svcLogout } from '../services/authService';
import { initProducts } from '../services/productService';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { userId, email, role } | null
  const [ready, setReady] = useState(false);

  // Инициализация при монтировании: создаём тестового админа и загружаем каталог
  useEffect(() => {
    initAuth();
    initProducts();
    setUser(getSession());
    setReady(true);
  }, []);

  const login = (email, password) => {
    const res = svcLogin(email, password);
    if (res.ok) setUser(res.session);
    return res;
  };

  const register = (email, password) => {
    const res = svcRegister(email, password);
    if (res.ok) setUser(res.session);
    return res;
  };

  const logout = () => {
    svcLogout();
    setUser(null);
  };

  if (!ready) return null; // ждём инициализации

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
