import React, { useState } from 'react';
import {
  LayoutDashboard,
  Home,
  Users,
  Layers,
  Flame,
  Building2,
  Bell,
  Menu,
  X,
  TrendingDown,
  Sparkles,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  LogOut,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  CalendarDays,
  Settings,
} from 'lucide-react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { useCbam } from '../context/CbamContext';
import { NotificationSlidePanel } from './NotificationSlidePanel';
import { AddProductModal } from './AddProductModal';
import { AddBuyerModal } from './AddBuyerModal';
import { DispatchModal } from './DispatchModal';

interface AppLayoutProps {
  activeStep: string;
  onNavigateStep: (stepId: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeStep,
  onNavigateStep,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const { currentUser, logout } = useFirebaseAuth();
  const { unreadNotificationsCount } = useCbam();

  const activePlant = {
    name: 'Aegean Rolling Mill #04',
    location: 'Aliağa, İzmir',
    country: 'TR',
  };

  const navItems = [
    {
      id: 'step_2_dashboard',
      label: 'Home',
      shortLabel: 'Home',
      icon: Home,
      badge: undefined,
    },
    {
      id: 'step_4_catalog',
      label: 'Products',
      shortLabel: 'Products',
      icon: Layers,
      badge: '4',
    },
    {
      id: 'step_3_buyers',
      label: 'Buyers',
      shortLabel: 'Buyers',
      icon: Users,
      badge: '6',
    },
    {
      id: 'step_8_calendar',
      label: 'Calendar',
      shortLabel: 'Calendar',
      icon: CalendarDays,
      badge: undefined,
    },
    {
      id: 'step_10_settings',
      label: 'Settings',
      shortLabel: 'Settings',
      icon: Settings,
      badge: undefined,
    },
  ];

  const handleNavClick = (id: string) => {
    onNavigateStep(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-slate-900 flex antialiased font-sans">
      {/* ------------------------------------------------------------------- */}
      {/* 1. MOBILE BACKDROP & DRAWER                                         */}
      {/* ------------------------------------------------------------------- */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden transition-opacity"
        />
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 2. PERSISTENT DESKTOP SIDEBAR + MOBILE SLIDE-OVER DRAWER             */}
      {/* ------------------------------------------------------------------- */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-emerald-100/80 flex flex-col z-50 transition-transform duration-250 ease-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-emerald-100/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-emerald-500/25">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display text-base font-bold text-slate-900 tracking-tight leading-none">
                CBAM Exporter
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live 2026 Ready
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-emerald-50 rounded-lg lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Facility Pill Card with Emerald Accents */}
        <div className="p-4 m-4 bg-gradient-to-b from-white to-emerald-50/40 border border-emerald-100/90 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70">
              Active Facility
            </span>
            <button
              type="button"
              onClick={() => handleNavClick('step_1_auth')}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Switch
            </button>
          </div>
          <div className="font-display text-xs font-bold text-slate-900 mt-1.5 truncate">
            {activePlant.name}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activePlant.location}</span>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspaces
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeStep === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50/90 text-emerald-900 font-bold border border-emerald-200/90 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Cheerful Motivation / Carbon Savings Card */}
        <div className="p-4 m-4 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200/80 rounded-2xl space-y-2 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-display">Savings Highlight</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Actual emissions beat EU defaults by <strong className="text-emerald-700 font-bold">65%</strong>, protecting <strong className="text-slate-900 font-semibold">€418,500</strong> in buyer margins.
          </p>
        </div>

        {/* Footer Account Status */}
        <div className="p-4 border-t border-emerald-100/60 flex items-center justify-between text-xs bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0 shadow-2xs font-display">
              {currentUser?.email ? currentUser.email.slice(0, 2).toUpperCase() : 'ER'}
            </div>
            <div className="min-w-0 truncate">
              <div className="font-bold text-slate-800 truncate text-[11px]">
                {currentUser?.displayName || 'Dr. Elena Rostova'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.email || 'Compliance Officer'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavClick('step_1_auth')}
            title="Switch plant or sign out"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------------- */}
      {/* 3. MAIN APPLICATION VIEWPORT                                        */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
          {/* Left: Mobile hamburger & breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile menu"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-emerald-50 rounded-xl lg:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                CBAM Exporter
              </span>
              <span className="text-xs text-emerald-300 hidden sm:inline">/</span>
              <span className="font-display text-sm sm:text-base font-bold text-slate-900">
                {navItems.find((n) => n.id === activeStep)?.label || 'Overview'}
              </span>
            </div>
          </div>

          {/* Right: Live Market & User Menu */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Live EU ETS Ticker */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/90 border border-emerald-200/90 rounded-xl text-xs font-bold text-emerald-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-emerald-600 hidden sm:inline">EU ETS:</span>
              <span className="font-mono tabular-nums">€75.36/t</span>
            </div>

            {/* Division Switcher Button */}
            <button
              type="button"
              onClick={() => handleNavClick('step_1_auth')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[140px]">{activePlant.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Notification Bell Button with Live Unread Badge */}
            <button
              type="button"
              onClick={() => setIsNotificationDrawerOpen(true)}
              aria-label="Open notifications panel"
              title="Compliance Notifications & Deadlines"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-2xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-100 hover:ring-emerald-300 transition-all font-display"
              >
                {currentUser?.email ? currentUser.email.slice(0, 2).toUpperCase() : 'ER'}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {currentUser?.displayName || 'Dr. Elena Rostova'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {currentUser?.email || 'elena.rostova@aegeansteel.com'}
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleNavClick('step_1_auth');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-xl font-medium"
                    >
                      Switch Division / Plant
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsProfileOpen(false);
                        await logout();
                        handleNavClick('step_1_auth');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Child Content Viewport (Generous 8px-based rhythm) */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 sm:pb-16 space-y-8">
          {children}
        </main>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. MOBILE BOTTOM NAVIGATION BAR (< 640px)                            */}
      {/* ------------------------------------------------------------------- */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100/90 px-3 py-2 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeStep === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.shortLabel}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => handleNavClick('step_1_auth')}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Building2 className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Plant</span>
        </button>
      </nav>

      {/* Slide-In Notification Drawer (Opened via Bell Icon) */}
      <NotificationSlidePanel
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onNavigateStep={handleNavClick}
      />

      {/* Global Interactive Modals */}
      <AddProductModal />
      <AddBuyerModal />
      <DispatchModal />
    </div>
  );
};
