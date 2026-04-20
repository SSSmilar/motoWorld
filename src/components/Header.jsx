import { ShoppingCart, Bike, User, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { cartCount, openCart } = useCart();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <Bike className="w-8 h-8 text-accent group-hover:rotate-12 transition-transform" />
          <span className="text-2xl font-black tracking-tighter uppercase italic">
            Moto<span className="text-accent">World</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
          <Link to="/catalog" className="hover:text-accent transition-colors">Каталог</Link>
          <Link to="/about" className="hover:text-accent transition-colors">О нас</Link>
          <Link to="/contacts" className="hover:text-accent transition-colors">Контакты</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:text-accent transition-colors">Админ</Link>
          )}
        </nav>

        {/* Right side: auth + cart */}
        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/profile" className="flex items-center gap-1 hover:text-accent transition-colors text-sm">
              <User size={18} />
              <span className="hidden md:inline">{user.email}</span>
            </Link>
          ) : (
            <Link to="/login" className="flex items-center gap-1 hover:text-accent transition-colors text-sm">
              <LogIn size={18} />
              <span className="hidden md:inline">Войти</span>
            </Link>
          )}

          <div className="relative cursor-pointer group p-2" onClick={openCart}>
            <ShoppingCart className="w-6 h-6 group-hover:text-accent transition-colors" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse shadow-[0_0_10px_rgba(255,62,0,0.5)]">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
