import React, { useState } from 'react';
import { ShoppingCart, Check, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, isHighlighted }) => {
  const { addToCart, getCartQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);

  const inStock = product.stock > 0;
  const qtyInCart = getCartQuantity(product.id);
  const canAdd = inStock && qtyInCart < product.stock;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    addToCart(product.id);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div
      className={`glass-card group flex flex-col h-full transition-all duration-500 ${
        isHighlighted ? 'ring-2 ring-accent shadow-[0_0_20px_rgba(255,62,0,0.3)]' : ''
      }`}
    >
      <div className="relative overflow-hidden aspect-[16/9]">
        <img src={product.imageUrl} alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        {!inStock && (
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
            {inStock ? (
              <><Check size={12} className="text-green-500" /> В наличии ({product.stock})</>
            ) : (
              <><X size={12} className="text-red-500" /> Под заказ</>
            )}
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-6 flex-grow">{product.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <div className="text-2xl font-black text-white italic">
            ${product.price.toLocaleString()}
          </div>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={`px-4 py-3 rounded-none transition-all duration-300 flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest ${
              canAdd
                ? 'bg-accent text-white hover:scale-105 hover:shadow-[0_0_15px_rgba(255,62,0,0.4)]'
                : 'bg-white/5 text-gray-600 cursor-not-allowed'
            }`}
            title={!canAdd && inStock ? 'Максимум в корзине' : 'Добавить в корзину'}
          >
            {isAdded ? (
              <><Check size={16} /> Добавлено</>
            ) : !canAdd && inStock ? (
              <><Check size={16} /> Макс.</>
            ) : (
              <><ShoppingCart size={16} /> В корзину</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
