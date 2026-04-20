/**
 * Сервис заказов (mock-api).
 * Единое хранилище: ключ "mw_orders" — массив всех заказов.
 * Каждый заказ имеет поле user_id для фильтрации по пользователю.
 */

import { v4 as uuidv4 } from 'uuid';
import { update_stock } from './productService';

const ORDERS_KEY = 'mw_orders';

const get_all_raw = () => {
    try {
        const data = localStorage.getItem(ORDERS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const save_all = (orders) => {
    try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch { /* storage full or unavailable */ }
};

const formatDate = (iso) => iso.slice(0, 10); // "YYYY-MM-DD"

/** Получить заказы пользователя; при первом вызове создаёт демо-данные */
export function getOrders(userId) {
    const all = get_all_raw();
    const userOrders = all.filter(o => o.user_id === userId);

    if (userOrders.length === 0) {
        const fake = [
            {
                id: 'ord-1',
                user_id: userId,
                date: '2025-12-01',
                items: [{ title: 'Yamaha MT-09', quantity: 1, price: 9500 }],
                total: 9500,
                status: 'Доставлен',
            },
            {
                id: 'ord-2',
                user_id: userId,
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
                user_id: userId,
                date: '2026-03-28',
                items: [{ title: 'Honda CB650R', quantity: 2, price: 8900 }],
                total: 17800,
                status: 'Доставлен',
            },
        ];
        save_all([...all, ...fake]);
        return fake;
    }

    return userOrders;
}

/** Создать новый заказ */
export const create_order = (user_id, cart_items) => {
    const all = get_all_raw();
    const new_order = {
        id: uuidv4(),
        user_id,
        date: formatDate(new Date().toISOString()),
        items: cart_items.map(item => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
        })),
        status: 'В обработке',
        total: cart_items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };

    cart_items.forEach(item => {
        update_stock(item.id, -item.quantity);
    });

    all.push(new_order);
    save_all(all);
    return new_order;
};

/** Заказы конкретного пользователя */
export const get_orders_by_user = (user_id) => {
    return get_all_raw().filter(order => order.user_id === user_id);
};

/** Все заказы (для админа) */
export const get_all_orders = () => {
    return get_all_raw();
};

export const update_order_status = (order_id, status) => {
    const orders = get_all_raw();
    const index = orders.findIndex(o => o.id === order_id);
    if (index !== -1) {
        orders[index].status = status;
        save_all(orders);
    }
};

export const cancel_order = (order_id) => {
    const orders = get_all_raw();
    const index = orders.findIndex(o => o.id === order_id);
    if (index !== -1 && orders[index].status !== 'Отменен') {
        orders[index].status = 'Отменен';
        orders[index].items.forEach(item => {
            update_stock(item.id, item.quantity);
        });
        save_all(orders);
    }
};
