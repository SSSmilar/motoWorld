/**
 * Сервис заказов (mock-api).
 * Хранит историю заказов в LocalStorage по ключу "mw_orders_{userId}".
 * При первом обращении генерирует фейковые заказы для демонстрации.
 */

import { v4 as uuidv4 } from 'uuid';
import { update_stock } from './productService';

function ordersKey(userId) {
  return `mw_orders_${userId}`;
}

const ORDERS_KEY = 'orders';

const get_orders = () => {
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
};

const save_orders = (orders) => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

/** Получить заказы пользователя; при первом вызове создаёт демо-данные */
export function getOrders(userId) {
  try {
    const raw = localStorage.getItem(ordersKey(userId));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }

  // Генерируем фейковые заказы для нового пользователя
  const fake = [
    {
      id: 'ord-1',
      date: '2025-12-01',
      items: [{ title: 'Yamaha MT-09', quantity: 1, price: 9500 }],
      total: 9500,
      status: 'Доставлен',
    },
    {
      id: 'ord-2',
      date: '2026-02-14',
      items: [
        { title: 'Ducati Panigale V4 R', quantity: 1, price: 45000 },
        { title: 'BMW R 1250 GS Adventure', quantity: 1, price: 24500 },
      ],
      total: 69500,
      status: 'В обработке',
    },
    {
      id: 'ord-3',
      date: '2026-03-28',
      items: [{ title: 'Honda CB650R', quantity: 2, price: 8900 }],
      total: 17800,
      status: 'Доставлен',
    },
  ];
  localStorage.setItem(ordersKey(userId), JSON.stringify(fake));
  return fake;
};

export const create_order = (user_id, cart_items) => {
    const orders = get_orders();
    const new_order = {
        id: uuidv4(),
        user_id,
        created_at: new Date().toISOString(),
        items: cart_items,
        status: 'В обработке',
        total: cart_items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };

    // Decrease stock for each item in the order
    cart_items.forEach(item => {
        update_stock(item.id, -item.quantity);
    });

    orders.push(new_order);
    save_orders(orders);
    return new_order;
};

export const get_orders_by_user = (user_id) => {
    const orders = get_orders();
    return orders.filter(order => order.user_id === user_id);
};

export const get_all_orders = () => {
    return get_orders();
};

export const update_order_status = (order_id, status) => {
    const orders = get_orders();
    const index = orders.findIndex(order => order.id === order_id);
    if (index !== -1) {
        orders[index].status = status;
        save_orders(orders);
    }
};

export const cancel_order = (order_id) => {
    const orders = get_orders();
    const index = orders.findIndex(order => order.id === order_id);
    if (index !== -1) {
        const order = orders[index];
        if (order.status !== 'Отменен') {
            order.status = 'Отменен';
            // Return items to stock
            order.items.forEach(item => {
                update_stock(item.id, item.quantity);
            });
            save_orders(orders);
        }
    }
};
