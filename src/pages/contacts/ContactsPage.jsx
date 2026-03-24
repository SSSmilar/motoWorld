import React from 'react';

const ContactsPage = () => {
  return (
    <main className="pt-28 pb-20 bg-dark-bg min-h-screen">
      <section className="mb-12">
        <div className="container mx-auto px-6">
          <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm mb-2">Связаться с нами</h2>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic mb-8">Контакты</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-black uppercase tracking-widest mb-2">Адрес</h3>
                <p className="text-gray-400">Россия, г. Москва, пр-т Премиум, д. 7</p>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-black uppercase tracking-widest mb-2">Телефон</h3>
                <a href="tel:+79991234567" className="text-accent hover:underline">+7 (999) 123-45-67</a>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-black uppercase tracking-widest mb-2">Email</h3>
                <a href="mailto:sales@motoworld.ru" className="text-accent hover:underline">sales@motoworld.ru</a>
              </div>

              {/* Social */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-black uppercase tracking-widest mb-4">Мы в соцсетях</h3>
                <div className="flex items-center gap-4">
                  <a href="https://t.me/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-accent transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.03 15.47l-.39 5.48c.56 0 .8-.24 1.08-.53l2.6-2.49 5.39 3.94c.99.55 1.69.26 1.95-.93l3.54-16.6.01-.01c.31-1.45-.53-2.02-1.49-1.67L1.12 9.69C-.3 10.26-.28 11.1.89 11.45l5.37 1.67L19.3 6.17c.6-.39 1.14-.17.69.22"/></svg>
                    <span className="uppercase text-xs tracking-widest">Telegram</span>
                  </a>
                  <a href="https://vk.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-accent transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h3.5l2.5 6 2.5-6H15l-4 9 3 6h-3.5L9 16l-2 5H3l3-6L3 6zM17 6h3v12h-3z"/></svg>
                    <span className="uppercase text-xs tracking-widest">VK</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-2">
              <div className="relative w-full" style={{paddingTop: '56.25%'}}>
                <iframe 
                  title="Yandex Map"
                  src="https://yandex.ru/map-widget/v1/?um=constructor%3A8a881a98319b57f0f20bdeec36229ed10f013880a29acd19a6a8732e6dcfbd3b&amp;source=constructor"
                  frameBorder="0"
                  className="absolute inset-0 w-full h-full border border-white/10"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactsPage;
