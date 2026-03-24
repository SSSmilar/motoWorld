import React, { useState, useEffect } from 'react';
import { fetchCatalogData } from './catalogService';
import { ShoppingCart, Check, X } from 'lucide-react';

const SkeletonCard = () => (
  <div className="glass-card animate-pulse">
    <div className="aspect-[16/9] bg-white/5" />
    <div className="p-6">
      <div className="h-4 bg-white/10 w-1/4 mb-4" />
      <div className="h-6 bg-white/20 w-3/4 mb-2" />
      <div className="h-4 bg-white/10 w-full mb-6" />
      <div className="flex justify-between items-center">
        <div className="h-6 bg-white/20 w-1/3" />
        <div className="h-10 bg-white/10 w-10 rounded-full" />
      </div>
    </div>
  </div>
);

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchCatalogData();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch catalog:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleAddToCart = (product) => {
    console.log(`[Catalog] Added to cart: ${product.title} (ID: ${product.id})`);
    setCartCount(prev => prev + 1);
  };

  return (
    <section id="catalog" className="py-24 bg-dark-bg">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-4">
              Наш <span className="text-accent">Каталог</span>
            </h2>
            <div className="h-1 w-20 bg-accent" />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm uppercase tracking-wider transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-accent text-white font-bold' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="glass-card group flex flex-col h-full">
                <div className="relative overflow-hidden aspect-[16/9]">
                  <img 
                    src={product.imageUrl} 
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="border-2 border-white/30 px-4 py-2 text-white font-bold uppercase tracking-widest -rotate-12">
                        Нет в наличии
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">
                    {product.category}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold uppercase tracking-tight">{product.title}</h3>
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-500">
                      {product.inStock ? (
                        <><Check size={12} className="text-green-500" /> В наличии</>
                      ) : (
                        <><X size={12} className="text-red-500" /> Под заказ</>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-6 flex-grow">
                    {product.shortDescription}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-2xl font-black text-white italic">
                      ${product.price.toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className={`p-3 rounded-none transition-all duration-300 ${
                        product.inStock 
                          ? 'bg-accent text-white hover:scale-110 hover:shadow-[0_0_15px_rgba(255,62,0,0.4)]' 
                          : 'bg-white/5 text-gray-600 cursor-not-allowed'
                      }`}
                      title="Добавить в корзину"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Local UI State Test Indicator */}
        {cartCount > 0 && (
          <div className="mt-12 p-4 bg-accent/10 border border-accent/20 text-center">
            <p className="text-gray-300 text-sm uppercase tracking-widest">
              Товаров в локальной корзине: <span className="text-accent font-bold">{cartCount}</span> (проверка стейта)
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Catalog;
