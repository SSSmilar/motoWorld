import React, { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Bike, Wrench, ClipboardList } from 'lucide-react';
import { initAdminStorage } from '../../services/adminStorageService';

const NAV_ITEMS = [
  { to: '/admin/orders', label: 'Заказы', icon: ClipboardList },
  { to: '/admin/motorcycles', label: 'Мотоциклы', icon: Bike },
  { to: '/admin/parts', label: 'Запчасти', icon: Wrench },
];

const AdminDashboard = () => {
  const location = useLocation();

  useEffect(() => {
    initAdminStorage();
  }, []);

  return (
    <div className="min-h-screen pt-28 px-6 pb-12 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
          Админ-панель
        </h1>
        <p className="text-gray-400 text-sm">
          Управление заказами, мотоциклами и запчастями
        </p>
      </div>

      <nav className="flex flex-wrap gap-3 mb-8">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
                active
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
};

export default AdminDashboard;
