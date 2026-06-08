import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Wrench } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PartCard = ({ product, isHighlighted }) => {
  const { addToCart, getCartQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);

  const inStock = (product.stock ?? 0) > 0;
  const qtyInCart = getCartQuantity(product.id);
  const canAdd = inStock && qtyInCart < product.stock;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={`block border border-white/10 bg-black/30 hover:border-accent/40 hover:bg-black/50 transition-all duration-300 p-5 h-full ${
        isHighlighted ? 'ring-2 ring-accent border-accent/50' : ''
      }`}
    >
      <div className="flex gap-4">
        <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-accent/10 border border-accent/20">
          <Wrench className="w-6 h-6 text-accent" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-accent font-bold">
              {product.category}
            </span>
            {product.brand && (
              <span className="text-[10px] uppercase text-gray-500 shrink-0">{product.brand}</span>
            )}
          </div>

          <h3 className="text-sm font-bold uppercase tracking-tight mb-2 line-clamp-2 group-hover:text-accent">
            {product.title}
          </h3>

          {product.compatible_with?.length > 0 && (
            <p className="text-[10px] text-gray-500 mb-3 line-clamp-1">
              Для: {product.compatible_with.join(', ')}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
            <div>
              <div className="text-lg font-black text-white italic">
                {product.price.toLocaleString()} ₽
              </div>
              <div className="text-[10px] text-gray-500 uppercase">
                {inStock ? `${product.stock} шт.` : 'Нет в наличии'}
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                canAdd
                  ? 'bg-accent text-white hover:scale-105'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isAdded ? <><Check size={14} /> OK</> : <><ShoppingCart size={14} /> В корзину</>}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PartCard;
