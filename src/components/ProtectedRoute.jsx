import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowed_roles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowed_roles && !allowed_roles.includes(user.role)) {
        return <Navigate to="/forbidden" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
