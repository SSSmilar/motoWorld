import React, { useEffect, useState } from 'react';
import Hero from '../../components/Hero';
import ProductCard from '../../components/ProductCard';
import { getTopModels } from '../../catalog-feature/catalogService';

const HomePage = ({ setSelectedMoto }) => {
  const [topModels, setTopModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getTopModels().then(data => {
      if (mounted) setTopModels(data);
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <main>
      <Hero />

      {/* ПОПУЛЯРНЫЕ МОДЕЛИ */}
      <section className="py-20 bg-dark-bg border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm mb-2">Выбор клиентов</h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase italic">ПОПУЛЯРНЫЕ МОДЕЛИ</h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card animate-pulse">
                  <div className="aspect-[16/9] bg-white/5" />
                  <div className="p-6">
                    <div className="h-4 bg-white/10 w-1/4 mb-4" />
                    <div className="h-6 bg-white/20 w-3/4 mb-2" />
                    <div className="h-4 bg-white/10 w-full mb-6" />
                    <div className="h-6 bg-white/20 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {topModels.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  isHighlighted={false}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      
      <footer className="py-12 border-t border-white/5 bg-black/50">
        <div className="container mx-auto px-6 text-center text-gray-600 text-sm uppercase tracking-[0.2em]">
          © 2026 MotoWorld Premium. Все права защищены.
        </div>
      </footer>
    </main>
  );
};

export default HomePage;
