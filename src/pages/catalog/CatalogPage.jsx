import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Wrench } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { loadProducts } from '../../services/productService';
import { fetchVehicleCatalogPrices } from '../../services/configuratorService';
import { normalizeProduct, getCategoriesForType } from '../../utils/productUtils';

const SkeletonCard = () => (
  <div className="glass-card animate-pulse">
    <div className="aspect-[16/9] bg-white/5" />
    <div className="p-6">
      <div className="h-4 bg-white/10 w-1/4 mb-4" />
      <div className="h-6 bg-white/20 w-3/4 mb-2" />
    </div>
  </div>
);

const PartSkeleton = () => (
  <div className="border border-white/10 bg-black/30 animate-pulse p-5 h-32" />
);

const CatalogPage = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [catalogPrices, setCatalogPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [catalogType, setCatalogType] = useState(location.state?.type === 'part' ? 'part' : 'vehicle');
  const [activeCategory, setActiveCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    loadProducts()
      .then(async (data) => {
        const normalized = data.map(normalizeProduct);
        setProducts(normalized);
        const vehicles = normalized.filter((p) => p.type === 'vehicle');
        if (vehicles.length > 0) {
          const prices = await fetchVehicleCatalogPrices(vehicles);
          setCatalogPrices(prices);
        }
      })
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

  const typeProducts = useMemo(
    () => products.filter((p) => p.type === catalogType),
    [products, catalogType]
  );

  const subCategories = useMemo(() => {
    const allowed = getCategoriesForType(catalogType);
    const present = new Set(typeProducts.map((p) => p.category));
    return ['Все', ...allowed.filter((c) => present.has(c))];
  }, [typeProducts, catalogType]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return typeProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.brand && p.brand.toLowerCase().includes(query))
    );
  }, [searchQuery, typeProducts]);

  const filteredProducts = useMemo(() => {
    let result = typeProducts;

    if (activeCategory !== 'Все') {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      result = result.filter((p) =>
        searchResults.some((r) => r.id === p.id)
      );
    }

    return result;
  }, [typeProducts, activeCategory, searchQuery, searchResults]);

  const handleTypeChange = (type) => {
    setCatalogType(type);
    setActiveCategory('Все');
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const isPartsView = catalogType === 'part';

  return (
    <div className="pt-32 pb-24 bg-dark-bg min-h-screen">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm mb-2">Наш парк</h2>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic mb-8">НАШ КАТАЛОГ</h1>

          {error && (
            <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">{error}</div>
          )}

          {/* Шаг 1: тип каталога */}
          <div className="flex gap-3 mb-6">
            {[
              { id: 'vehicle', label: 'Мотоциклы' },
              { id: 'part', label: 'Запчасти' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleTypeChange(id)}
                className={`px-8 py-3 text-sm font-black uppercase tracking-widest border transition-all ${
                  catalogType === id
                    ? 'bg-accent border-accent text-white'
                    : 'border-white/10 text-gray-500 hover:border-accent/50 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Поиск */}
          <div className="relative max-w-2xl mb-6" ref={searchRef}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                placeholder={isPartsView ? 'Поиск запчастей по названию или бренду...' : 'Поиск мотоциклов...'}
                className="w-full bg-white/5 border border-white/10 focus:border-accent/50 py-4 pl-12 pr-4 outline-none uppercase text-sm tracking-widest text-white"
              />
            </div>

            {showDropdown && searchQuery.trim() && (
              <div className="absolute top-full left-0 w-full bg-black/90 backdrop-blur-xl border border-white/10 z-50 max-h-[400px] overflow-y-auto shadow-2xl">
                {searchResults.length > 0 ? (
                  searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => { setSearchQuery(p.title); setShowDropdown(false); }}
                      className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer border-b border-white/5"
                    >
                      {isPartsView ? (
                        <div className="w-10 h-10 flex items-center justify-center bg-accent/10 border border-accent/20 shrink-0">
                          <Wrench size={16} className="text-accent" />
                        </div>
                      ) : (
                        <img src={p.imageUrl} alt={p.title} className="w-16 h-10 object-cover shrink-0" />
                      )}
                      <div>
                        <h4 className="font-bold uppercase text-sm">{p.title}</h4>
                        <p className="text-[10px] text-gray-500">{p.category}</p>
                        <p className="text-accent font-black text-xs mt-1">
                          {(catalogPrices[p.id] ?? p.price).toLocaleString()} ₽
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 uppercase text-xs">Ничего не найдено</div>
                )}
              </div>
            )}
          </div>

          {/* Шаг 2: подкатегории (только для выбранного типа) */}
          <div className="mb-2">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
              {isPartsView ? 'Категория запчастей' : 'Тип мотоцикла'}
            </p>
            <div className="flex flex-wrap gap-2">
              {subCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-5 py-2 text-xs font-black uppercase tracking-widest transition-all border ${
                    activeCategory === cat
                      ? 'bg-accent border-accent text-white'
                      : 'border-white/10 hover:border-accent/50 text-gray-500 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className={`grid gap-6 ${isPartsView ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'}`}>
            {[...Array(8)].map((_, i) => (isPartsView ? <PartSkeleton key={i} /> : <SkeletonCard key={i} />))}
          </div>
        ) : (
          <div className={`grid ${isPartsView ? 'grid-cols-1 md:grid-cols-2 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'}`}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  catalogPrice: product.type === 'vehicle' ? catalogPrices[product.id] : undefined,
                }}
              />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-500 uppercase tracking-widest">
            {isPartsView ? 'Запчасти не найдены' : 'Мотоциклы не найдены'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
