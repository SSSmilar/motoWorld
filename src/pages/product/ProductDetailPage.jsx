import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getProductById } from '../../services/productService';
import { formatPrice, fetchVehicleCatalogPrice } from '../../services/configuratorService';
import { normalizeProduct } from '../../utils/productUtils';
import VehicleImage from '../../components/VehicleImage';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [catalogPrice, setCatalogPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getProductById(id)
      .then((p) => {
        const normalized = normalizeProduct(p);
        if (normalized.type !== 'vehicle') {
          navigate('/catalog', { replace: true, state: { type: 'part' } });
          return;
        }
        setProduct(normalized);
        return fetchVehicleCatalogPrice(normalized)
          .then(setCatalogPrice)
          .catch(() => setCatalogPrice(normalized.price));
      })
      .catch((err) => setError(err.message || 'Товар не найден'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

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
          <div className="relative">
            <VehicleImage src={product.imageUrl} alt={product.name} hover={false} />
            <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
              {product.category}
            </div>
          </div>

          <div className="p-8 lg:p-12 flex flex-col">
            <p className="text-accent font-black uppercase tracking-[0.3em] text-xs mb-2">Мотоцикл</p>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic mb-4">{product.name}</h1>
            <p className="text-gray-400 leading-relaxed mb-8">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-8 border-y border-white/10 py-6">
              <Spec label="Двигатель" value={product.engine} />
              <Spec label="Вес" value={product.weight} />
              <Spec label="Коробка" value={product.transmission} />
              <Spec label="Категория" value={product.category} />
            </div>

            <div className="text-4xl font-black text-accent italic mb-8">
              {formatPrice(catalogPrice ?? product.price)}
            </div>

            <Link
              to={`/configurator?vehicle=${product.id}`}
              className="btn-primary text-center mt-auto"
            >
              <span className="block skew-x-[12deg]">Перейти в конфигуратор</span>
            </Link>
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
