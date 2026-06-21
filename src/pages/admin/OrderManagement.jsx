import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  ORDER_STATUSES,
  initAdminStorage,
} from '../../services/adminStorageService';
import { formatPrice } from '../../services/configuratorService';
import { CARD_CLS, BTN_DANGER } from './adminStyles';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = () => setOrders(getOrders());

  useEffect(() => {
    initAdminStorage().finally(() => {
      reload();
      setLoading(false);
    });
  }, []);

  const handleStatusChange = (orderId, status) => {
    updateOrderStatus(orderId, status);
    reload();
  };

  const handleDelete = (orderId) => {
    if (!window.confirm('Удалить заказ?')) return;
    deleteOrder(orderId);
    reload();
  };

  if (loading) {
    return <div className="text-gray-400">Загрузка заказов...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-black uppercase mb-6">Управление заказами</h2>

      {orders.length === 0 ? (
        <p className="text-gray-400">Заказов пока нет.</p>
      ) : (
        <div className={`${CARD_CLS} overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-gray-400">
              <tr>
                <th className="py-3 pr-4">ID</th>
                <th className="py-3 pr-4">Клиент</th>
                <th className="py-3 pr-4">Телефон</th>
                <th className="py-3 pr-4">Дата</th>
                <th className="py-3 pr-4">Сумма</th>
                <th className="py-3 pr-4">Статус</th>
                <th className="py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 pr-4 font-mono text-xs">{order.id}</td>
                  <td className="py-3 pr-4">{order.customer_name}</td>
                  <td className="py-3 pr-4 text-gray-400">{order.phone}</td>
                  <td className="py-3 pr-4 text-gray-400">
                    {order.created_at?.slice(0, 10) ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-accent font-semibold">
                    {formatPrice(order.total_price)}
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={order.status ?? 'Новый'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-gray-900">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(order.id)}
                      className="p-2 hover:text-red-400 transition"
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
