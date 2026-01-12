import React, { useState } from 'react';
import Background from './components/Background';
import Hero from './components/Hero';
import RSVP from './components/RSVP';
import MapSection from './components/MapSection';
import Game from './components/Game';
import Admin from './components/Admin';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded simple creds for demo purposes
    if (adminUser === 'admin' && adminPass === 'tech2026') {
      setCurrentView(AppView.ADMIN_DASHBOARD);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.ADMIN_DASHBOARD:
        return <Admin onLogout={() => setCurrentView(AppView.HOME)} />;

      case AppView.ADMIN_LOGIN:
        return (
          <div className="min-h-screen flex items-center justify-center relative p-4">
            <Background />
            <div className="bg-gray-900/40 border border-cyan-500/30 p-8 rounded-lg max-w-sm w-full shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl">
              <h2 className="text-2xl text-cyan-400 font-mono mb-6 text-center">SYSTEM ACCESS</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input
                  type="text"
                  placeholder="User"
                  value={adminUser}
                  onChange={e => setAdminUser(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600/50 p-2 text-white rounded focus:border-cyan-500 focus:outline-none backdrop-blur-sm"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600/50 p-2 text-white rounded focus:border-cyan-500 focus:outline-none backdrop-blur-sm"
                />
                {loginError && <p className="text-red-500 text-xs">Access Denied. Invalid Credentials.</p>}
                <button 
                  type="submit"
                  className="w-full bg-cyan-700/80 hover:bg-cyan-600/80 text-white font-bold py-2 rounded transition backdrop-blur-md"
                >
                  LOGIN
                </button>
                <button 
                  type="button"
                  onClick={() => setCurrentView(AppView.HOME)}
                  className="w-full text-gray-400 text-sm hover:text-white"
                >
                  Return to Home
                </button>
              </form>
            </div>
          </div>
        );

      case AppView.HOME:
      default:
        return (
          <main className="relative min-h-screen w-full overflow-x-hidden text-white font-mono selection:bg-cyan-500 selection:text-black">
            <Background />
            
            <div className="relative z-10 pb-20">
              {/* Login Button */}
              <div className="absolute top-4 right-4 z-50">
                <button 
                  onClick={() => setCurrentView(AppView.ADMIN_LOGIN)}
                  className="text-xs text-gray-400 hover:text-cyan-400 border border-transparent hover:border-cyan-900/50 px-2 py-1 rounded transition-colors backdrop-blur-sm"
                >
                  [ADMIN ACCESS]
                </button>
              </div>

              <Hero />
              
              <div className="space-y-24">
                <RSVP />
                <MapSection />
                <Game />
              </div>

              <footer className="text-center py-10 text-gray-500 text-xs mt-20 border-t border-white/10 backdrop-blur-sm bg-black/20">
                <p>RAFAEL © 2026 // DESIGNED BY AI // POWERED BY R5 Hub</p>
              </footer>
            </div>
          </main>
        );
    }
  };

  return renderContent();
};

export default App;
