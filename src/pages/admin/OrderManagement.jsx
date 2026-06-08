import React, { useState, useEffect } from 'react';
import { get_all_orders } from '../../services/orderService';
import { formatPrice } from '../../services/configuratorService';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get_all_orders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-400">Загрузка заказов...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-black uppercase mb-6">Управление заказами</h2>
      {orders.length === 0 ? (
        <p className="text-gray-400">Заказов пока нет.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border border-white/10 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-bold">{order.id}</span>
                <span className="text-accent">{formatPrice(order.total_price)}</span>
              </div>
              <p className="text-sm text-gray-400">{order.customer_name} · {order.phone}</p>
              <p className="text-xs text-gray-500 mt-1">{order.created_at?.slice(0, 10)} · {order.status}</p>
              <ul className="mt-2 text-xs text-gray-500">
                {(order.items ?? []).map((item, i) => (
                  <li key={i}>
                    {item.type === 'custom_build' ? item.vehicle_name : item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderManagement;
