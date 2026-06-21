import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Wrench } from 'lucide-react';
import { getProductById } from '../../services/productService';
import { formatPrice, fetchVehicleCatalogPrice, fetchStockParts } from '../../services/configuratorService';
import { normalizeProduct } from '../../utils/productUtils';
import VehicleImage from '../../components/VehicleImage';
import PartCategoryIcon from '../../components/PartCategoryIcon';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [catalogPrice, setCatalogPrice] = useState(null);
  const [stockParts, setStockParts] = useState([]);
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
        return Promise.all([
          fetchVehicleCatalogPrice(normalized)
            .then(setCatalogPrice)
            .catch(() => setCatalogPrice(normalized.price)),
          fetchStockParts(normalized.id)
            .then(setStockParts)
            .catch(() => setStockParts([])),
        ]);
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

        <div className="glass-card overflow-hidden">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
              <div className="flex flex-col gap-4 w-full">
                <div className="relative w-full">
                  <VehicleImage
                    src={product.imageUrl}
                    alt={product.name}
                    hover={false}
                    frameClassName="w-full aspect-[4/3] md:aspect-[3/2]"
                  />
                  <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                    {product.category}
                  </div>
                </div>

                <Link
                  to={`/configurator?vehicle=${product.id}`}
                  className="btn-primary w-full text-center"
                >
                  <span className="block skew-x-[12deg]">Перейти в конфигуратор</span>
                </Link>

                <Link
                  to="/catalog"
                  className="w-full py-3 border border-white/10 text-gray-400 text-xs uppercase tracking-wider text-center hover:border-accent/50 hover:text-white transition-colors"
                >
                  Назад в каталог
                </Link>
              </div>

              <div className="flex flex-col min-w-0">
                <p className="text-accent font-black uppercase tracking-[0.3em] text-xs mb-2">Мотоцикл</p>
                <h1 className="text-3xl md:text-4xl font-black uppercase italic mb-4">{product.name}</h1>
                <p className="text-gray-400 leading-relaxed mb-6">{product.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6 border-y border-white/10 py-6">
                  <Spec label="Двигатель" value={product.engine} />
                  <Spec label="Вес" value={product.weight} />
                  <Spec label="Коробка" value={product.transmission} />
                  <Spec label="Категория" value={product.category} />
                </div>

                {stockParts.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Wrench className="w-4 h-4 text-accent" />
                      <h2 className="text-sm font-bold uppercase tracking-wider">Стоковая комплектация</h2>
                    </div>
                    <ul className="space-y-2">
                      {stockParts.map((part) => (
                        <li
                          key={part.id}
                          className="flex items-center gap-3 p-3 border border-white/10 bg-black/30"
                        >
                          <PartCategoryIcon category={part.category} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{part.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{part.category}</p>
                          </div>
                          <span className="text-xs text-accent font-bold shrink-0">
                            {formatPrice(part.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-4xl font-black text-accent italic mt-auto">
                  {formatPrice(catalogPrice ?? product.price)}
                </div>
              </div>
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
