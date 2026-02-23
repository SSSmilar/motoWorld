import { ShoppingCart, Bike } from 'lucide-react';

const Header = ({ cartCount }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <Bike className="w-8 h-8 text-accent group-hover:rotate-12 transition-transform" />
          <span className="text-2xl font-black tracking-tighter uppercase italic">
            Moto<span className="text-accent">World</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
          <a href="#catalog" className="hover:text-accent transition-colors">Каталог</a>
          <a href="#" className="hover:text-accent transition-colors">О нас</a>
          <a href="#" className="hover:text-accent transition-colors">Контакты</a>
        </nav>

        {/* Cart */}
        <div className="relative cursor-pointer group">
          <ShoppingCart className="w-6 h-6 group-hover:text-accent transition-colors" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
              {cartCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
