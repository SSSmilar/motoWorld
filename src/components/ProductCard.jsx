import React from 'react';
import { Link } from 'react-router-dom';
import PartCard from './PartCard';
import VehicleImage from './VehicleImage';

const ProductCard = ({ product, isHighlighted }) => {
  if (product.type === 'part') {
    return <PartCard product={product} isHighlighted={isHighlighted} />;
  }

  return <VehicleCard product={product} isHighlighted={isHighlighted} />;
};

const VehicleCard = ({ product, isHighlighted }) => (
  <Link
    to={`/product/${product.id}`}
    className={`glass-card group flex flex-col h-full transition-all duration-500 ${
      isHighlighted ? 'ring-2 ring-accent shadow-[0_0_20px_rgba(255,62,0,0.3)]' : ''
    }`}
  >
    <VehicleImage src={product.imageUrl} alt={product.title} />
      <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">
        {product.category}
      </div>
      <div className="absolute top-4 right-4 bg-black/60 text-white text-[10px] font-bold px-2 py-1 uppercase">
        Мотоцикл
      </div>
    </div>

    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-accent transition-colors mb-2">
        {product.title}
      </h3>
      <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-2">{product.description}</p>
      <div className="text-2xl font-black text-white italic mt-auto">
        {product.price.toLocaleString()} ₽
      </div>
    </div>
  </Link>
);

export default ProductCard;
