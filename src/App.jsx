import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { init_admin } from './services/authService';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/home/HomePage';
import CatalogPage from './pages/catalog/CatalogPage';
import AboutPage from './pages/about/AboutPage';
import ContactsPage from './pages/contacts/ContactsPage';
import LoginForm from './pages/auth/LoginForm';
import RegistrationForm from './pages/auth/RegistrationForm';
import ProfilePage from './pages/profile/ProfilePage';
import OrderHistory from './pages/profile/OrderHistory';
import CartPage from './pages/cart/CartPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import ForbiddenPage from './pages/ForbiddenPage';

const App = () => {
  useEffect(() => {
    init_admin();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-white">
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowed_roles={['user', 'admin']} />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/cart" element={<CartPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowed_roles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<ProductManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
