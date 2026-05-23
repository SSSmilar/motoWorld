import React, { useState, useEffect } from 'react';
import { getOrders } from '../../services/orderService';
import { get_current_user } from '../../services/authService';

const statusStyles = {
  'Доставлен': 'bg-green-600/20 text-green-400',
  'В обработке': 'bg-yellow-600/20 text-yellow-400',
  'Отменен': 'bg-red-600/20 text-red-400',
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = get_current_user();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = getOrders(user.userId);
      setOrders(data);
    } catch (e) {
      setError(e.message || 'Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  if (!user) {
    return <p className="text-gray-400 text-center mt-20">Войдите, чтобы увидеть историю заказов.</p>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">Ошибка: {error}</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Мои заказы</h2>

      {orders.length === 0 ? (
        <p className="text-gray-400">У вас пока нет заказов.</p>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 transition hover:border-accent/30">
              {/* Header */}
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-widest">Заказ</span>
                  <span className="ml-2 text-sm font-bold">{order.id}</span>
                  <span className="ml-3 text-gray-500 text-xs">{order.date}</span>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[order.status] || 'bg-white/10 text-gray-400'}`}>
                  {order.status}
                </span>
              </div>

              {/* Thumbnails */}
              {order.items.some((i) => i.imageUrl) && (
                <div className="flex gap-3 mb-4 overflow-x-auto">
                  {order.items.slice(0, 3).map((item, idx) => (
                    item.imageUrl ? (
                      <img
                        key={idx}
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover border border-white/10 flex-shrink-0"
                      />
                    ) : null
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Items list */}
              <ul className="space-y-1 mb-4">
                {order.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex justify-between">
                    <span>{item.title} × {item.quantity}</span>
                    <span className="text-white font-semibold">{(item.price * item.quantity).toLocaleString()} ₽</span>
                  </li>
                ))}
              </ul>

              {/* Total */}
              <div className="border-t border-white/10 pt-3 flex justify-end">
                <p className="text-lg font-black">Итого: {order.total.toLocaleString()} ₽</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
