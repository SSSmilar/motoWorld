import { X, CheckCircle } from 'lucide-react';

const Modal = ({ moto, isOpen, onClose, onAddToCart }) => {
  if (!isOpen || !moto) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative glass-card max-w-4xl w-full grid md:grid-cols-2 overflow-hidden animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-accent rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="h-64 md:h-full">
          <img src={moto.image} alt={moto.name} className="w-full h-full object-cover" />
        </div>

        <div className="p-8 flex flex-col justify-center">
          <div className="text-accent font-black uppercase tracking-[0.3em] text-sm mb-2">{moto.class}</div>
          <h2 className="text-4xl font-black uppercase italic mb-4">{moto.name}</h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            {moto.description}
          </p>

          <div className="grid grid-cols-2 gap-8 mb-8 border-y border-white/10 py-6">
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Двигатель</div>
              <div className="text-xl font-black italic">{moto.engine}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Стоимость</div>
              <div className="text-2xl font-black text-accent">₽{moto.price.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-accent" /> Гарантия 2 года
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-accent" /> Бесплатный тест-драйв
              </li>
            </ul>
            <button 
              onClick={() => {
                onAddToCart(moto);
                onClose();
              }}
              className="btn-primary w-full"
            >
              Добавить в корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
