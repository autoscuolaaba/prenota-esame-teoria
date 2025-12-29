import React from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { BookingForm } from './components/BookingForm';
import { AdminPanel } from './components/AdminPanel';

const TopBar: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
    const navigate = useNavigate();

    return (
        <div className="flex justify-between items-center px-6 py-6 absolute top-0 left-0 w-full z-20 max-w-[480px] left-1/2 -translate-x-1/2">
            {/* Back Button / Admin Button */}
            {isAdmin ? (
              <button
                  onClick={() => navigate('/')}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all text-[#0B0F19]"
              >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
              </button>
            ) : (
              <button
                  onClick={() => navigate('/admin')}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-400 transition-colors opacity-30"
              >
                  <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
              </button>
            )}

            {/* Center - WhatsApp or Title */}
            {isAdmin ? (
              <span className="font-bold text-lg text-[#0B0F19] bg-white/80 backdrop-blur px-4 py-1 rounded-full shadow-sm">
                  Prenotazioni
              </span>
            ) : (
              <a
                href="https://www.autoscuoleaba.it/iscrizione-patente"
                className="flex items-center gap-2 bg-white text-[#0B0F19] font-semibold px-5 py-2.5 rounded-full shadow-lg active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Iscrizione
              </a>
            )}

            {/* Placeholder for symmetry */}
            <div className="w-8 h-8"></div>
        </div>
    );
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('admin');

  // Layout Admin - si espande su desktop
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="max-w-7xl mx-auto">
          <main className="pt-4 px-4 pb-8 min-h-screen">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Layout Form - mobile normale, desktop espanso
  return (
    <div className="min-h-screen bg-[#E5E7EB] lg:bg-gradient-to-br lg:from-slate-100 lg:to-slate-200">

      {/* Mobile Layout - resta identico */}
      <div className="lg:hidden">
        <div className="min-h-screen max-w-[480px] mx-auto relative bg-[#E5E7EB]">
          {/* Background Map Pattern (Abstract) */}
          <div className="absolute top-0 left-0 w-full h-[400px] bg-[#E5E7EB] z-0 opacity-50">
            <div className="absolute inset-0 opacity-100" style={{
                backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px'
            }}></div>
            <div className="absolute top-20 left-10 w-32 h-32 bg-gray-300 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-60"></div>
          </div>

          <TopBar isAdmin={false} />

          <main className="relative z-10 pt-24 min-h-screen">
            {children}
          </main>
        </div>
      </div>

      {/* Desktop Layout - completamente diverso */}
      <div className="hidden lg:block min-h-screen">
        {/* Header Desktop */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-black tracking-tighter text-[#1a1a1a]" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
                ABA
              </div>
              <div className="text-sm font-light tracking-[0.2rem] text-gray-500 border-l border-gray-300 pl-4">
                AUTOSCUOLE
              </div>
            </div>
            <a
              href="https://www.autoscuoleaba.it/iscrizione-patente"
              className="flex items-center gap-2 text-gray-600 hover:text-[#0B0F19] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Torna a Iscrizione
            </a>
          </div>
        </header>

        {/* Main Content Desktop */}
        <main className="max-w-7xl mx-auto px-8 py-12 relative">
          {/* Pattern di puntini decorativi con admin nascosto */}
          <div className="absolute top-2 left-2 flex gap-3">
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full opacity-40"></div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full opacity-40"></div>
            <button
              onClick={() => window.location.hash = '/admin'}
              className="w-1.5 h-1.5 bg-gray-400 rounded-full opacity-50 hover:opacity-80 transition-opacity cursor-default"
            />
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full opacity-40"></div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full opacity-40"></div>
          </div>
          {children}
        </main>

        {/* Footer Desktop */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Autoscuole ABA - Prenotazione Esame Teoria
          </div>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<BookingForm />} />
          <Route path="/admin" element={<AdminPanel onLogout={() => window.location.hash = '/'} />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;