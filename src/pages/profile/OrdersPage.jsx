import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOrders } from '../../services/orderService';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../services/configuratorService';

const statusStyles = {
  'Доставлен': 'bg-green-600/20 text-green-400',
  'В обработке': 'bg-yellow-600/20 text-yellow-400',
  'Отменен': 'bg-red-600/20 text-red-400',
};

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getOrders(user.userId)
      .then(setOrders)
      .catch((e) => setError(e.message || 'Не удалось загрузить заказы'))
      .finally(() => setLoading(false));
  }, [user?.userId]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 px-6 max-w-4xl mx-auto pb-20">
      <div className="mb-6">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
        >
          ← Назад в каталог
        </Link>
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">История заказов</h1>

      {error && (
        <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-400">У вас пока нет заказов.</p>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 transition hover:border-accent/30">
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

              <ul className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>{item.title} × {item.quantity}</span>
                      <span className="text-white font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    {item.part_names?.length > 0 && (
                      <ul className="text-xs text-gray-500 mt-1 ml-2">
                        {item.part_names.map((name, i) => (
                          <li key={i}>• {name}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/10 pt-3 flex justify-end">
                <p className="text-lg font-black">Итого: {formatPrice(order.total)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
