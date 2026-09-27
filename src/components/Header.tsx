import React from 'react';
import { useCbam } from '../context/CbamContext';
import { Bell, Send, UserCheck, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activePersona,
    setIsAuthModalOpen,
    unreadNotificationsCount,
    setDispatchModalBuyer,
    buyers,
  } = useCbam();

  const handleQuickDispatch = () => {
    // Pick the first buyer that is ready or in need of dispatch
    const pendingBuyer = buyers.find((b) => b.status === 'ready' || b.status === 'revision_requested') || buyers[0];
    setDispatchModalBuyer(pendingBuyer);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap"
        >
          CBAM Exporter Tracker
        </button>
        <span className="hidden sm:inline-flex items-center text-xs text-slate-400 font-mono">
          System of Record
        </span>
      </div>

      {/* Zone 2: Clean 4-6 text navigation links */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`hover:text-white transition-colors whitespace-nowrap ${
            currentView === 'dashboard' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentView('buyers')}
          className={`hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            currentView === 'buyers' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5' : ''
          }`}
        >
          Buyers
          <span className="text-[10px] text-emerald-400 font-mono">
            ({buyers.length})
          </span>
        </button>
        <button
          onClick={() => setCurrentView('catalog')}
          className={`hover:text-white transition-colors whitespace-nowrap ${
            currentView === 'catalog' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5' : ''
          }`}
        >
          Catalog
        </button>
        <button
          onClick={() => setCurrentView('emissions')}
          className={`hover:text-white transition-colors whitespace-nowrap ${
            currentView === 'emissions' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5' : ''
          }`}
        >
          Emissions
        </button>
        <button
          onClick={() => setCurrentView('vault')}
          className={`hover:text-white transition-colors whitespace-nowrap ${
            currentView === 'vault' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5' : ''
          }`}
        >
          Vault
        </button>
        <button
          onClick={() => setCurrentView('reports')}
          className={`hover:text-white transition-colors whitespace-nowrap ${
            currentView === 'reports' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5' : ''
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setCurrentView('simulator')}
          className={`hover:text-white transition-colors whitespace-nowrap ${
            currentView === 'simulator' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5' : ''
          }`}
        >
          Simulator
        </button>
      </nav>

      {/* Zone 3: Primary actions & User profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView('notifications')}
          className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Notification Center"
          aria-label="Notification Center"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </button>

        <button
          onClick={handleQuickDispatch}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm whitespace-nowrap"
        >
          <Send className="w-3.5 h-3.5" />
          Dispatch Package
        </button>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors text-left"
          title="Switch User Persona & Installation"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
            {activePersona.avatarText}
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-medium text-slate-200 leading-none truncate max-w-[120px]">
              {activePersona.name}
            </div>
            <div className="text-[10px] text-slate-400 leading-none mt-1 truncate max-w-[120px]">
              {activePersona.badge}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
