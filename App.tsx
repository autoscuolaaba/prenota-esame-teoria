import React from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { BookingForm } from './components/BookingForm';
import { AdminPanel } from './components/AdminPanel';
import { ThemeProvider } from './contexts/ThemeContext';
import { WindowChrome, ThemeToggle, TrafficLights } from './components/macos/WindowChrome';

// Mobile top bar component
const MobileTopBar: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center px-6 py-6 absolute top-0 left-0 w-full z-20 max-w-[480px] left-1/2 -translate-x-1/2">
      {isAdmin ? (
        <button
          onClick={() => navigate('/')}
          className="w-12 h-12 bg-macos-bg rounded-full flex items-center justify-center shadow-macos-md active:scale-95 transition-all text-macos-text"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => navigate('/admin')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-macos-text-tertiary hover:text-macos-text-secondary transition-colors opacity-30"
        >
          <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
        </button>
      )}

      {isAdmin ? (
        <span className="font-semibold text-sm text-macos-text bg-macos-bg/80 backdrop-blur px-4 py-2 rounded-full shadow-macos-sm">
          Prenotazioni
        </span>
      ) : (
        <a
          href="https://www.autoscuoleaba.it/iscrizione-patente"
          className="flex items-center gap-2 bg-macos-bg text-macos-text font-semibold px-5 py-2.5 rounded-full shadow-macos-md active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Iscrizione
        </a>
      )}

      <ThemeToggle />
    </div>
  );
};

// Desktop header with theme toggle
const DesktopHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-macos-bg border-b border-macos-border">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black tracking-tighter text-macos-text" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
            ABA
          </div>
          <div className="text-xs font-medium tracking-[0.15rem] text-macos-text-secondary border-l border-macos-border pl-4">
            AUTOSCUOLE
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a
            href="https://www.autoscuoleaba.it/iscrizione-patente"
            className="flex items-center gap-2 text-macos-text-secondary hover:text-macos-text transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Torna a Iscrizione
          </a>
        </div>
      </div>
    </header>
  );
};

// Layout component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.includes('admin');

  // Admin Layout
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-macos-bg-secondary">
        {/* Mobile Admin */}
        <div className="lg:hidden">
          <MobileTopBar isAdmin={true} />
          <main className="pt-24 px-4 pb-8 max-w-[480px] mx-auto">
            {children}
          </main>
        </div>

        {/* Desktop Admin - Full width with macOS style */}
        <div className="hidden lg:block min-h-screen">
          <div className="flex flex-col min-h-screen">
            {/* Toolbar */}
            <div className="macos-titlebar h-12 flex items-center px-4 border-b border-macos-border">
              <TrafficLights onClose={() => navigate('/')} />
              <span className="text-sm font-medium text-macos-text-secondary flex-1 text-center">
                Pannello Amministrazione
              </span>
              <ThemeToggle />
            </div>

            {/* Content */}
            <main className="flex-1 p-6 bg-macos-bg-secondary">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Booking Form Layout
  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="min-h-screen max-w-[480px] mx-auto relative">
          {/* Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-[400px] z-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(var(--text-tertiary) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            <div className="absolute top-20 left-10 w-32 h-32 bg-macos-accent/20 rounded-full blur-3xl"></div>
            <div className="absolute top-10 right-10 w-40 h-40 bg-macos-bg rounded-full blur-3xl"></div>
          </div>

          <MobileTopBar isAdmin={false} />

          <main className="relative z-10 pt-24 min-h-screen">
            {children}
          </main>
        </div>
      </div>

      {/* Desktop Layout - macOS Window Style */}
      <div className="hidden lg:flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Header above window */}
          <div className="flex justify-between items-center mb-6 px-2">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-black tracking-tighter text-macos-text" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
                ABA
              </div>
              <div className="text-xs font-medium tracking-[0.15rem] text-macos-text-secondary border-l border-macos-border pl-4">
                AUTOSCUOLE
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <a
                href="https://www.autoscuoleaba.it/iscrizione-patente"
                className="flex items-center gap-2 text-macos-text-secondary hover:text-macos-text transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Torna a Iscrizione
              </a>
            </div>
          </div>

          {/* macOS Window */}
          <WindowChrome
            title="Prenota Esame Teoria"
            toolbar={
              <button
                onClick={() => navigate('/admin')}
                className="w-6 h-6 rounded flex items-center justify-center text-macos-text-tertiary hover:text-macos-text-secondary transition-colors"
                title="Admin"
              >
                <div className="w-1 h-1 bg-current rounded-full"></div>
              </button>
            }
          >
            {children}
          </WindowChrome>

          {/* Footer */}
          <div className="text-center text-xs text-macos-text-tertiary mt-6">
            © {new Date().getFullYear()} Autoscuole ABA
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<BookingForm />} />
            <Route path="/admin" element={<AdminPanel onLogout={() => window.location.hash = '/'} />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
