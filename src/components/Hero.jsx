import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  
  const goToCatalog = () => {
    navigate('/catalog');
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 scale-105"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(10,10,10,1)), url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1920')` 
        }}
      />
      
      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 text-center">
        <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-4 leading-tight">
          Почувствуй <br />
          <span className="text-accent drop-shadow-[0_0_15px_rgba(255,62,0,0.5)]">Адреналин</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 uppercase tracking-widest font-light">
          Премиальные мотоциклы для тех, кто не признает компромиссов. Твой путь начинается здесь.
        </p>
        <button 
          onClick={goToCatalog}
          className="btn-primary flex items-center gap-2 mx-auto hover:scale-105 active:scale-95"
        >
          Смотреть модели
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer" onClick={goToCatalog}>
        <ChevronDown className="w-8 h-8 text-accent" />
      </div>
    </section>
  );
};

export default Hero;
