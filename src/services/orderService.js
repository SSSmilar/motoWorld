import { createOrder, fetchOrders } from './configuratorService';

/** Создать заказ через API бэкенда */
export async function submitOrder({ userId, customerName, phone, cartItems }) {
  return createOrder({
    customer_name: customerName,
    phone,
    user_id: userId ?? null,
    items: cartItems,
  });
}

/** Получить заказы пользователя с бэкенда */
export async function getOrders(userId) {
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

/** @deprecated */
export const create_order = async () => {
  throw new Error('Используйте submitOrder() — заказы теперь на бэкенде');
};

export const get_all_orders = () => fetchOrders();
export const get_orders_by_user = (user_id) => fetchOrders(user_id);
export const update_order_status = () => {};
export const cancel_order = () => {};
