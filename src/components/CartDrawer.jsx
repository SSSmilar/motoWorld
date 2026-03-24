import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
  const { isCartOpen, closeCart, cartItems, removeFromCart, clearCart, cartTotal } = useCart();

  const handleCheckout = () => {
    alert(`Функция оплаты в разработке. Итого к оплате: $${cartTotal.toLocaleString()}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-dark-bg border-l border-white/10 z-[70] shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-accent w-6 h-6" />
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Корзина</h2>
          </div>
          <button 
            onClick={closeCart}
            className="p-2 hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p className="uppercase tracking-widest text-sm font-bold">Корзина пуста</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-20 h-20 bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-tight text-white leading-tight mb-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-accent font-black text-sm italic">
                          ${item.price.toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">
                          Кол-во: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-500 hover:text-red-500 transition-colors self-start"
                    >
                      <Trash2 size={12} />
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-black/40">
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-400 uppercase tracking-widest text-xs font-bold">Итого:</span>
              <span className="text-2xl font-black text-white italic">${cartTotal.toLocaleString()}</span>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={handleCheckout}
                className="w-full py-4 bg-accent text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,62,0,0.3)]"
              >
                ОФОРМИТЬ ЗАКАЗ
              </button>
              <button 
                onClick={clearCart}
                className="w-full py-4 border border-white/10 text-gray-400 font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors"
              >
                ОЧИСТИТЬ КОРЗИНУ
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
