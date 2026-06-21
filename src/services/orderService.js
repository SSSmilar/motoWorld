import { createOrder, fetchOrders } from './configuratorService';
import { addOrder, getOrders, updateOrderStatus, deleteOrder, ORDER_STATUSES } from './adminStorageService';

/** Создать заказ через API и сохранить в localStorage */
export async function submitOrder({ userId, customerName, phone, cartItems }) {
  const result = await createOrder({
    customer_name: customerName,
    phone,
    user_id: userId ?? null,
    items: cartItems,
  });

  addOrder({
    id: result.order_id,
    customer_name: customerName,
    phone,
    user_id: userId ?? null,
    items: cartItems,
    total_price: result.total ?? 0,
    status: 'Новый',
    created_at: new Date().toISOString(),
  });

  return result;
}

/** Получить заказы пользователя с бэкенда */
export async function getOrdersByUser(userId) {
  const orders = await fetchOrders(userId);
  return orders.map((order) => ({
    id: order.id,
    date: order.created_at?.slice(0, 10) ?? '',
    status: order.status ?? 'В обработке',
    total: order.total_price,
    items: (order.items ?? []).map((item) => ({
      title:
        item.type === 'custom_build'
          ? `${item.vehicle_name} (сборка)`
          : item.name,
      quantity: item.quantity ?? 1,
      price: item.unit_price ?? item.line_total,
      imageUrl: null,
      part_names: item.part_names,
    })),
  }));
}

/** Получить все заказы из localStorage (для админки) */
export function get_all_orders() {
  return Promise.resolve(getOrders());
}

export function get_orders_by_user(user_id) {
  return Promise.resolve(getOrders().filter((o) => o.user_id === user_id));
}

export function update_order_status(orderId, status) {
  if (!ORDER_STATUSES.includes(status)) return getOrders();
  return updateOrderStatus(orderId, status);
}

export function cancel_order(orderId) {
  return deleteOrder(orderId);
}

/** @deprecated */
export const create_order = async () => {
  throw new Error('Используйте submitOrder()');
};

/** Алиас для совместимости с OrdersPage */
export { getOrdersByUser as getOrders };
