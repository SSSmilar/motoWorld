import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ moto, onAddToCart, onClick }) => {
  return (
    <div 
      className="glass-card group cursor-pointer overflow-hidden flex flex-col"
      onClick={() => onClick(moto)}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={moto.image} 
          alt={moto.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-accent px-3 py-1 text-xs font-black uppercase skew-x-[-10deg]">
          {moto.class}
        </div>
      </div>

      {/* Info */}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold uppercase mb-2 group-hover:text-accent transition-colors">
          {moto.name}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {moto.description}
        </p>
        
        <div className="mt-auto flex justify-between items-center">
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Кубатура</div>
            <div className="text-lg font-black italic">{moto.engine}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Цена</div>
            <div className="text-2xl font-black text-accent">₽{moto.price.toLocaleString()}</div>
          </div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(moto);
          }}
          className="mt-6 w-full bg-white/5 hover:bg-accent text-white py-3 transition-all duration-300 flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest border border-white/10 hover:border-accent"
        >
          <ShoppingCart className="w-4 h-4" />
          В корзину
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
