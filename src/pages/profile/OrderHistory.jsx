// src/pages/profile/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import { get_orders_by_user } from '../../services/orderService';
import { get_current_user } from '../../services/authService';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const user = get_current_user();

    useEffect(() => {
        if (user) {
            setOrders(get_orders_by_user(user.userId));
        }
    }, [user]);

    if (!user) {
        return <p>Please log in to see your order history.</p>;
    }

    return (
        <div>
            <h2>My Orders</h2>
            {orders.length === 0 ? (
                <p>You have no orders.</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order.id}>
                            <h3>Order #{order.id} - {order.status}</h3>
                            <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                            <p>Total: ${order.total}</p>
                            <ul>
                                {order.items.map((item, idx) => (
                                    <li key={item.id ?? idx}>{item.title} - {item.quantity} x ${item.price}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OrderHistory;

