// src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminDashboard = () => {
    return (
        <div>
            <h1>Admin Panel</h1>
            <nav>
                <Link to="products">Manage Products</Link> | <Link to="orders">Manage Orders</Link>
            </nav>
            <Outlet />
        </div>
    );
};

export default AdminDashboard;

