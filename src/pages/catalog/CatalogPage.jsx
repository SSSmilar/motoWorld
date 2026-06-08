import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { loadProducts } from '../../services/productService';
import { normalizeProduct } from '../../utils/productUtils';

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

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    loadProducts()
      .then((data) => setProducts(data.map(normalizeProduct)))
      .catch((err) => setError(err.message || 'Не удалось загрузить каталог'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category))],
    [products]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }, [searchQuery, products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedProductId) {
      return products.filter((p) => p.id === selectedProductId);
    }

    if (activeType === 'vehicle') {
      result = result.filter((p) => p.type === 'vehicle');
    } else if (activeType === 'part') {
      result = result.filter((p) => p.type === 'part');
    }

    if (activeCategory !== 'All') {
      result = result.filter((p) => p.category === activeCategory);
    } else if (searchQuery.trim()) {
      result = searchResults;
    }

    return result;
  }, [activeCategory, activeType, products, searchQuery, searchResults, selectedProductId]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    setSelectedProductId(null);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setSelectedProductId(null);
    setShowDropdown(false);
  };

  const handleResultClick = (product) => {
    setSelectedProductId(product.id);
    setSearchQuery(product.title);
    setShowDropdown(false);
  };

  return (
    <div className="pt-32 pb-24 bg-dark-bg min-h-screen">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm mb-2">Наш парк</h2>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic mb-8">НАШ КАТАЛОГ</h1>

          {error && (
            <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">{error}</div>
          )}

          <div className="relative max-w-2xl mb-6" ref={searchRef}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Поиск мотоциклов и запчастей..."
                className="w-full bg-white/5 border border-white/10 focus:border-accent/50 py-4 pl-12 pr-4 outline-none uppercase text-sm tracking-widest text-white"
              />
            </div>

            {showDropdown && searchQuery.trim() && (
              <div className="absolute top-full left-0 w-full bg-black/90 backdrop-blur-xl border border-white/10 z-50 max-h-[400px] overflow-y-auto shadow-2xl">
                {searchResults.length > 0 ? (
                  searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleResultClick(p)}
                      className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer border-b border-white/5"
                    >
                      <img src={p.imageUrl} alt={p.title} className="w-16 h-10 object-cover" />
                      <div>
                        <h4 className="font-bold uppercase text-sm">{p.title}</h4>
                        <p className="text-accent font-black text-xs mt-1">{p.price.toLocaleString()} ₽</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 uppercase text-xs">Ничего не найдено</div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {['All', 'vehicle', 'part'].map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-5 py-2 text-xs font-black uppercase tracking-widest border transition-all ${
                  activeType === type
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'border-white/10 text-gray-500 hover:text-white'
                }`}
              >
                {type === 'All' ? 'Все' : type === 'vehicle' ? 'Мотоциклы' : 'Запчасти'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all border ${
                  activeCategory === cat
                    ? 'bg-accent border-accent text-white skew-x-[-10deg]'
                    : 'border-white/10 hover:border-accent/50 text-gray-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} isHighlighted={selectedProductId === product.id} />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-500 uppercase tracking-widest">Товары не найдены</div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
