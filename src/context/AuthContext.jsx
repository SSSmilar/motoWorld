import React, { createContext, useContext, useState } from 'react';
import { init_admin, get_current_user, login as svcLogin, register as svcRegister, logout as svcLogout } from '../services/authService';
import { initProducts } from '../services/productService';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  // Инициализируем синхронно — нет задержки, нет белого экрана
  const [user, setUser] = useState(() => {
    try {
      init_admin();
      initProducts();
      return get_current_user();
    } catch {
      return null;
    }
  });

  const login = (email, password) => {
    try {
      svcLogin(email, password);
      const session = get_current_user();
      setUser(session);
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
    try {
      svcLogout();
    } catch { /* ignore */ }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
