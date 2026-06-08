import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, Wrench, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { get_cart, update_cart_item_quantity, remove_from_cart, clear_cart, cart_to_order_items } from '../../services/cartService';
import { submitOrder } from '../../services/orderService';
import { formatPrice } from '../../services/configuratorService';

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clearCart: clearCartCtx, cartTotal } = useCart();

  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setCart(get_cart(user.userId));
    setCustomerName(user.name ?? user.email?.split('@')[0] ?? '');
  }, [user, navigate]);

  const reload = () => setCart(get_cart(user.userId));

  const handleQuantityChange = (cartItemId, quantity) => {
    update_cart_item_quantity(user.userId, cartItemId, quantity);
    reload();
  };

  const handleRemove = (cartItemId) => {
    remove_from_cart(user.userId, cartItemId);
    reload();
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await submitOrder({
        userId: user.userId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        cartItems: cart_to_order_items(cart),
      });

      clear_cart(user.userId);
      clearCartCtx();
      setSuccess(result.order_id);
      setCart([]);
    } catch (err) {
      setError(err.message || 'Не удалось оформить заказ');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-28 px-6 max-w-2xl mx-auto text-center pb-20">
        <div className="glass-card p-10">
          <h1 className="text-3xl font-black uppercase italic mb-4 text-green-400">Заказ оформлен!</h1>
          <p className="text-gray-400 mb-2">Номер вашего заказа:</p>
          <p className="text-2xl font-black text-accent mb-8">{success}</p>
          <button
            onClick={() => navigate('/orders')}
            className="btn-primary"
          >
            <span className="block skew-x-[12deg]">История заказов</span>
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-28 px-6 max-w-4xl mx-auto text-center pb-20">
        <h1 className="text-3xl font-black uppercase italic mb-4">Корзина</h1>
        <p className="text-gray-400 mb-8">Ваша корзина пуста.</p>
        <button onClick={() => navigate('/catalog')} className="btn-primary">
          <span className="block skew-x-[12deg]">В каталог</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 px-6 max-w-4xl mx-auto pb-20">
      <h1 className="text-3xl font-black uppercase italic mb-8">Корзина</h1>

      <div className="space-y-4 mb-10">
        {cart.map((item) => (
          <div key={item.cartItemId} className="glass-card p-4 flex items-start gap-4">
            <img
              src={item.image ?? item.vehicleImage}
              alt={item.name ?? item.vehicleName}
              className="w-24 h-24 object-cover border border-white/10"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {item.type === 'custom_build' && <Wrench size={14} className="text-accent" />}
                <h3 className="font-bold uppercase">
                  {item.type === 'custom_build' ? `${item.vehicleName} — кастомная сборка` : item.name}
                </h3>
              </div>
              {item.type === 'custom_build' && (
                <ul className="text-xs text-gray-500 mb-2 space-y-0.5">
                  {item.partNames?.map((name, i) => (
                    <li key={i}>• {name}</li>
                  ))}
                </ul>
              )}
              <p className="text-accent font-black">{formatPrice(item.price)}</p>
            </div>

            {item.type === 'part' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                  className="p-1 rounded bg-white/10 hover:bg-white/20"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                  className="p-1 rounded bg-white/10 hover:bg-white/20"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : null}

            <button onClick={() => handleRemove(item.cartItemId)} className="p-2 text-red-400 hover:text-red-300">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-black uppercase mb-4">Оформление заказа</h2>

        {error && (
          <div className="mb-4 p-3 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">Имя</label>
            <input
              type="text"
              className="w-full bg-black/40 border border-white/10 px-4 py-3 focus:border-accent outline-none"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">Телефон</label>
            <input
              type="tel"
              className="w-full bg-black/40 border border-white/10 px-4 py-3 focus:border-accent outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+7 (___) ___-__-__"
            />
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => { clear_cart(user.userId); clearCartCtx(); setCart([]); }}
              className="text-sm text-gray-400 hover:text-white underline"
            >
              Очистить корзину
            </button>
            <div className="text-right">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Итого</p>
              <p className="text-3xl font-black text-accent mb-3">{formatPrice(cartTotal)}</p>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-40"
              >
                <span className="block skew-x-[12deg] flex items-center gap-2 justify-center">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Оформить заказ
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CartPage;
