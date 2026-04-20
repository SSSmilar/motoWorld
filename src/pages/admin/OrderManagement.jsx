// src/pages/admin/OrderManagement.jsx
import React, { useState, useEffect } from 'react';
import { get_all_orders, update_order_status, cancel_order } from '../../services/orderService';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        setOrders(get_all_orders());
    }, []);

    const handleStatusChange = (id, status) => {
        update_order_status(id, status);
        setOrders(get_all_orders());
    };

    const handleCancel = (id) => {
        cancel_order(id);
        setOrders(get_all_orders());
    };

    return (
        <div>
            <h2>Order Management</h2>
            <ul>
                {orders.map(order => (
                    <li key={order.id}>
                        Order #{order.id} - Status: {order.status}
                        <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                            <option value="В обработке">В обработке</option>
                            <option value="Доставлен">Доставлен</option>
                            <option value="Отменен">Отменен</option>
                        </select>
                        {order.status !== 'Отменен' && <button onClick={() => handleCancel(order.id)}>Cancel Order</button>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderManagement;

