import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Wrench, Loader2, CheckCircle } from 'lucide-react';
import { getProductById } from '../../services/productService';
import { formatPrice } from '../../services/configuratorService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, getCartQuantity, openCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    getProductById(id)
      .then(setProduct)
      .catch((err) => setError(err.message || 'Товар не найден'))
      .finally(() => setLoading(false));
  }, [id]);

  const isVehicle = product?.type === 'vehicle';
  const qtyInCart = product ? getCartQuantity(product.id) : 0;
  const inStock = (product?.stock ?? 0) > 0;

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!product || isVehicle) return;
    addToCart(product, 1);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-28 px-6 text-center">
        <p className="text-red-400 mb-6">{error || 'Товар не найден'}</p>
        <Link to="/catalog" className="text-accent hover:underline uppercase text-sm tracking-widest">
          ← Вернуться в каталог
        </Link>
      </div>
    );
  }

  const categoryLabel = product.category;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-dark-bg">
      <div className="container mx-auto px-6">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Назад в каталог
        </Link>

        <div className="glass-card grid lg:grid-cols-2 gap-0 overflow-hidden">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[480px]">
            {isVehicle ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center bg-black/40 border-b border-white/10">
                <Wrench className="w-16 h-16 text-accent mb-4" />
                <span className="text-accent text-xs uppercase tracking-widest font-bold">{categoryLabel}</span>
                {product.brand && (
                  <span className="text-gray-500 text-sm mt-2 uppercase">{product.brand}</span>
                )}
              </div>
            )}
            <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
              {categoryLabel}
            </div>
          </div>

          <div className="p-8 lg:p-12 flex flex-col">
            <p className="text-accent font-black uppercase tracking-[0.3em] text-xs mb-2">
              {isVehicle ? 'Мотоцикл' : 'Запчасть'}
            </p>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic mb-4">{product.name}</h1>
            <p className="text-gray-400 leading-relaxed mb-8">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-8 border-y border-white/10 py-6">
              {isVehicle ? (
                <>
                  <Spec label="Двигатель" value={product.engine} />
                  <Spec label="Вес" value={product.weight} />
                  <Spec label="Коробка" value={product.transmission} />
                  <Spec label="Категория" value={categoryLabel} />
                </>
              ) : (
                <>
                  <Spec label="Бренд" value={product.brand} />
                  <Spec label="Материал" value={product.material} />
                  <Spec label="Совместимость" value={product.compatible_with?.join(', ')} />
                  <Spec label="На складе" value={`${product.stock} шт.`} />
                </>
              )}
            </div>

            <div className="text-4xl font-black text-accent italic mb-8">
              {formatPrice(product.price)}
            </div>

            <div className="mt-auto flex flex-col sm:flex-row gap-4">
              {isVehicle ? (
                <Link
                  to={`/configurator?vehicle=${product.id}`}
                  className="btn-primary flex-1 text-center"
                >
                  <span className="block skew-x-[12deg] flex items-center justify-center gap-2">
                    <Wrench size={18} /> Перейти в конфигуратор
                  </span>
                </Link>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || qtyInCart >= product.stock}
                  className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="block skew-x-[12deg] flex items-center justify-center gap-2">
                    {added ? (
                      <><CheckCircle size={18} /> Добавлено</>
                    ) : (
                      <><ShoppingCart size={18} /> Добавить в корзину</>
                    )}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Spec({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">{label}</div>
      <div className="text-sm font-bold uppercase">{value || '—'}</div>
    </div>
  );
}

export default ProductDetailPage;
