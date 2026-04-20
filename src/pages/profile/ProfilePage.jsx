import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen pt-28 px-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Профиль</h1>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div>
                    <span className="text-gray-400 text-sm">Email</span>
                    <p className="text-lg">{user.email}</p>
                </div>
                <div>
                    <span className="text-gray-400 text-sm">Роль</span>
                    <p className="text-lg capitalize">{user.role}</p>
                </div>
                <div className="flex gap-4 mt-4">
                    <Link to="/orders" className="bg-white/10 hover:bg-white/20 transition rounded-lg px-6 py-2 font-semibold">
                        История заказов
                    </Link>
                    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 transition rounded-lg px-6 py-2 font-semibold">
                        Выйти
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
