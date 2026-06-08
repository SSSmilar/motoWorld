import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../../components/Hero';
import ProductCard from '../../components/ProductCard';
import { loadProducts } from '../../services/productService';
import { normalizeProduct } from '../../utils/productUtils';

const HomePage = () => {
  const [topModels, setTopModels] = useState([]);

  useEffect(() => {
    loadProducts()
      .then((data) => {
        const vehicles = data.filter((p) => p.type === 'vehicle').map(normalizeProduct);
        setTopModels(vehicles.slice(0, 4));
      })
      .catch(() => setTopModels([]));
  }, []);

  return (
    <main>
      <Hero />
      <section className="py-20 bg-dark-bg border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm mb-2">Выбор клиентов</h2>
              <h3 className="text-4xl md:text-5xl font-black uppercase italic">ПОПУЛЯРНЫЕ МОДЕЛИ</h3>
            </div>
            <Link to="/catalog" className="text-xs uppercase tracking-widest text-gray-400 hover:text-accent transition-colors">
              Весь каталог →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {topModels.map((product) => (
              <ProductCard key={product.id} product={product} isHighlighted={false} />
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 bg-black/50">
        <div className="container mx-auto px-6 text-center text-gray-600 text-sm uppercase tracking-[0.2em]">
          © 2026 МотоМир Premium. Все права защищены.
        </div>
      </footer>
    </main>
  );
};

export default HomePage;
