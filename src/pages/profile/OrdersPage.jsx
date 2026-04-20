import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOrders } from '../../services/orderService';

const OrdersPage = () => {
  const { user } = useAuth();
  if (!user) return null;
  const orders = getOrders(user.userId);

  return (
    <div className="min-h-screen pt-28 px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">История заказов</h1>

      {orders.length === 0 ? (
        <p className="text-gray-400">У вас пока нет заказов.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm">Заказ {order.id} — {order.date}</span>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  order.status === 'Доставлен' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
                }`}>
                  {order.status}
                </span>
              </div>
              <ul className="space-y-1 mb-3">
                {order.items.map((item, idx) => (
                  <li key={idx} className="text-sm">
                    {item.title} × {item.quantity} — ${item.price.toLocaleString()}
                  </li>
                ))}
              </ul>
              <p className="font-bold text-lg">Итого: ${order.total.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
