import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Modal from './components/Modal';
import { MOTORCYCLES } from './data/motorcycles';

const App = () => {
  const [cart, setCart] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedMoto, setSelectedMoto] = useState(null);

  const classes = ['All', 'Sport', 'Cruiser', 'Enduro', 'Naked'];

  const filteredMotorcycles = useMemo(() => {
    if (activeFilter === 'All') return MOTORCYCLES;
    return MOTORCYCLES.filter(m => m.class === activeFilter);
  }, [activeFilter]);

  const addToCart = (moto) => {
    setCart(prev => [...prev, moto]);
    // В реальном приложении здесь было бы уведомление
  };

  return (
    <div className="min-h-screen">
      <Header cartCount={cart.length} />
      
      <main>
        <Hero />
        
        {/* Catalog Section */}
        <section id="catalog" className="py-24 bg-dark-bg">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm mb-2">Наш парк</h2>
                <h3 className="text-5xl font-black uppercase italic">Выберите своего зверя</h3>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {classes.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setActiveFilter(cls)}
                    className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 border ₽{
                      activeFilter === cls 
                        ? 'bg-accent border-accent text-white skew-x-[-10deg]' 
                        : 'border-white/10 hover:border-accent/50 text-gray-500 hover:text-white'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredMotorcycles.map(moto => (
                <ProductCard 
                  key={moto.id} 
                  moto={moto} 
                  onAddToCart={addToCart}
                  onClick={setSelectedMoto}
                />
              ))}
            </div>
            
            {filteredMotorcycles.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                Мотоциклы данного класса временно отсутствуют
              </div>
            )}
          </div>
        </section>

        {/* Footer info */}
        <footer className="py-12 border-t border-white/5 bg-black/50">
          <div className="container mx-auto px-6 text-center text-gray-600 text-sm uppercase tracking-[0.2em]">
            © 2026 MotoWorld Premium. Все права защищены.
          </div>
        </footer>
      </main>

      {/* Modal */}
      <Modal 
        moto={selectedMoto} 
        isOpen={!!selectedMoto} 
        onClose={() => setSelectedMoto(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default App;
