import React, { createContext, useContext, useState, useEffect } from 'react';
import { init_admin, get_current_user, login as svcLogin, register as svcRegister, logout as svcLogout } from '../services/authService';
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
    init_admin();
    initProducts();
    setUser(get_current_user());
    setReady(true);
  }, []);

  const login = (email, password) => {
    try {
      svcLogin(email, password);
      setUser(get_current_user());
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  };

  const register = (email, password) => {
    try {
      svcRegister(email, password);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
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
