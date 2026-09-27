import React from 'react';
import { useCbam, ViewType } from '../context/CbamContext';
import {
  LayoutDashboard,
  Users,
  Layers,
  Flame,
  ShieldCheck,
  FileSpreadsheet,
  CalendarDays,
  SlidersHorizontal,
  Building2,
  Bell,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  stepNumber: string;
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeInstallation,
    setActiveInstallation,
    selectedQuarter,
    setSelectedQuarter,
    unreadNotificationsCount,
    buyers,
  } = useCbam();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      stepNumber: '02',
    },
    {
      id: 'buyers',
      label: 'Buyer Relationships',
      icon: Users,
      badge: `${buyers.length} EU Buyers`,
      stepNumber: '03',
    },
    {
      id: 'catalog',
      label: 'Product & Routes',
      icon: Layers,
      stepNumber: '04',
    },
    {
      id: 'emissions',
      label: 'Emissions Accounting',
      icon: Flame,
      stepNumber: '05',
    },
    {
      id: 'vault',
      label: 'Verification Vault',
      icon: ShieldCheck,
      stepNumber: '06',
    },
    {
      id: 'reports',
      label: 'Report Generator',
      icon: FileSpreadsheet,
      stepNumber: '07',
    },
    {
      id: 'calendar',
      label: 'Compliance Calendar',
      icon: CalendarDays,
      stepNumber: '08',
    },
    {
      id: 'simulator',
      label: 'What-If Simulator',
      icon: SlidersHorizontal,
      stepNumber: '09',
    },
    {
      id: 'team',
      label: 'Divisions & Team',
      icon: Building2,
      stepNumber: '10',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : undefined,
      stepNumber: '11',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Quarter & Installation Context */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div>
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            Reporting Period
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
            {['Q2 2026', 'Q3 2026', 'Q4 2026'].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedQuarter === q
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            Active Installation
          </div>
          <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {activeInstallation.name}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              {activeInstallation.unLocode} · {activeInstallation.city}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          System Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                    isActive
                      ? 'bg-emerald-500/30 text-emerald-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Compliance Trust Status footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>EU CBAM 2026 Regs</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          ISO 14064-3 verified calculation engine conforming to Annex IV (Implementing Regulation 2023/1773).
        </div>
      </div>
    </aside>
  );
};
