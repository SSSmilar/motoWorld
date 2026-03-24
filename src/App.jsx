import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Modal from './components/Modal';
import HomePage from './pages/home/HomePage';
import CatalogPage from './pages/catalog/CatalogPage';
import AboutPage from './pages/about/AboutPage';
import ContactsPage from './pages/contacts/ContactsPage';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';

const App = () => {
  const [selectedMoto, setSelectedMoto] = useState(null);

  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-dark-bg text-white">
          <Header />
          
          <CartDrawer />

          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  setSelectedMoto={setSelectedMoto} 
                />
              } 
            />
            <Route 
              path="/catalog" 
              element={
                <CatalogPage />
              } 
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
          </Routes>

          {/* Modal (global for now as it was in App) */}
          <Modal 
            moto={selectedMoto} 
            isOpen={!!selectedMoto} 
            onClose={() => setSelectedMoto(null)}
          />
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
