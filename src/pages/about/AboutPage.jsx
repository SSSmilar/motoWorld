import React from 'react';

const Advantage = ({ title, text, icon }) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-3 mb-4">
      <span className="w-8 h-8 flex items-center justify-center bg-accent/20 text-accent">{icon}</span>
      <h4 className="text-lg font-black uppercase tracking-widest">{title}</h4>
    </div>
    <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
  </div>
);

const AboutPage = () => {
  return (
    <main className="pt-28 pb-20 bg-dark-bg min-h-screen">
      {/* Hero */}
      <section className="mb-16">
        <div className="container mx-auto px-6">
          <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm mb-3">О компании</h2>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic mb-6">Мы продаем эмоции</h1>
          <p className="text-gray-400 max-w-3xl text-lg leading-relaxed">
            MotoWorld Premium — это команда энтузиастов, которая верит в силу скорости и свободы. 
            Мы отбираем только премиальные мотоциклы, предоставляя клиентам лучший сервис и уверенность на дороге.
          </p>
        </div>
      </section>

      {/* Advantages */}
      <section>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Advantage 
              title="Официальный дилер" 
              text="Прямые поставки от производителей. Гарантии подлинности и качества." 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4-6.5 4 2-7L2 9h7z"/></svg>} 
            />
            <Advantage 
              title="Сервис 24/7" 
              text="Личный менеджер и техподдержка в любое время суток." 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a10 10 0 100-20 10 10 0 000 20zm1-17v6l5 3"/></svg>} 
            />
            <Advantage 
              title="Гарантия" 
              text="Расширенные гарантийные программы и постгарантийный уход." 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l8 4v6c0 5-3.5 9.74-8 10-4.5-.26-8-5-8-10V6l8-4z"/></svg>} 
            />
            <Advantage 
              title="Тест-драйв" 
              text="Организуем индивидуальные тест-драйвы на закрытых трассах." 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11h14l-1-4H6l-1 4zm2 7a2 2 0 110-4 2 2 0 010 4zm10 0a2 2 0 110-4 2 2 0 010 4z"/></svg>} 
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
