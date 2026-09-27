import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Users,
  ShieldCheck,
  Layers,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Building2,
  CalendarDays,
  FileText,
  AlertCircle,
  ExternalLink,
  Plus,
  Check,
  Activity,
  Globe,
  BarChart3,
} from 'lucide-react';
import { useCbam } from '../../context/CbamContext';
import { AnalyticsWhatIfView } from '../AnalyticsWhatIfView';

interface ExecutiveDashboardProps {
  onNavigateStep?: (step: string) => void;
  onOpenDivisionSelector?: () => void;
  isSingleDivisionOrg?: boolean;
}

interface ActionItem {
  id: string;
  title: string;
  category: 'deadline' | 'buyer_request' | 'incomplete_product' | 'overdue_task';
  categoryLabel: string;
  urgency: 'critical' | 'urgent' | 'warning' | 'info';
  urgencyLabel: string;
  dueDate: string;
  daysRemaining: number;
  description: string;
  actionLabel: string;
  targetStep: string;
  referenceCode?: string;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardProps> = ({
  onNavigateStep,
  onOpenDivisionSelector,
  isSingleDivisionOrg = false,
}) => {
  const {
    activeInstallation,
    totalEmbeddedEmissions_tCO2e,
    unreadNotificationsCount,
    notifications,
    setIsAddProductOpen,
    setIsAddBuyerOpen,
  } = useCbam();

  // Reviewer state switcher: 'active' vs 'new_workspace'
  const [workspaceMode, setWorkspaceMode] = useState<'active' | 'new_workspace'>('active');
  const [isInsightsExpanded, setIsInsightsExpanded] = useState<boolean>(false);
  const [isHealthExpanded, setIsHealthExpanded] = useState<boolean>(false);
  const [isPortfolioExpanded, setIsPortfolioExpanded] = useState<boolean>(false);
  const [isActivityExpanded, setIsActivityExpanded] = useState<boolean>(false);

  // Live ETS Spot Benchmark
  const liveEtsPrice = 75.36; // €/tonne
  const emissionsYtd = 123669.1;
  const ytdTrendPercent = -8.4;
  const estimatedExposure = 232972;

  // Compliance Breakdown Data
  const complianceBreakdown = [
    { label: 'Submitted & Verified', count: 9, percentage: 56, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
    { label: 'Under Importer Review', count: 4, percentage: 25, color: 'bg-blue-500', textColor: 'text-blue-700' },
    { label: 'Awaiting Data Entry', count: 2, percentage: 13, color: 'bg-amber-500', textColor: 'text-amber-700' },
    { label: 'Action Required', count: 1, percentage: 6, color: 'bg-red-500', textColor: 'text-red-700' },
  ];

  // Top Products Portfolio Snapshot
  const portfolioProducts = [
    {
      id: 'p-1',
      name: 'Hot-Rolled Steel Coils (S235JR)',
      cnCode: '7208 39 00',
      route: 'EAF Melt Shop + 85% Scrap',
      actualSEE: 0.655,
      defaultBenchmark: 1.89,
      exportTons: 42500,
      savingsEur: 395000,
    },
    {
      id: 'p-2',
      name: 'Concrete Reinforcing Rebar (B500B)',
      cnCode: '7214 20 00',
      route: 'EAF Melt Shop + Slit Rolling',
      actualSEE: 0.555,
      defaultBenchmark: 1.74,
      exportTons: 28400,
      savingsEur: 252000,
    },
    {
      id: 'p-3',
      name: 'Aluminium Extrusion Billets (6063)',
      cnCode: '7601 20 20',
      route: 'Secondary Re-melting (45% Scrap)',
      actualSEE: 2.81,
      defaultBenchmark: 6.94,
      exportTons: 14200,
      savingsEur: 586000,
    },
  ];

  // Buyer Activity Feed
  const recentActivities = [
    {
      id: 'a-1',
      buyer: 'ArcelorMittal Europe S.A.',
      country: 'LU',
      action: 'Requested Q3 XML data package',
      detail: '36,200t Hot-Rolled Coils via Port of Nemrut',
      timestamp: '2h ago',
    },
    {
      id: 'a-2',
      buyer: 'ThyssenKrupp Materials Services GmbH',
      country: 'DE',
      action: 'Verified & Accepted declaration package',
      detail: 'Ref: TK-CBAM-ACK-2026-Q3-0918',
      timestamp: 'Yesterday',
    },
    {
      id: 'a-3',
      buyer: 'Klöckner & Co SE',
      country: 'DE',
      action: 'Nexigen® API Data Synced',
      detail: '19,800t Q3 provisional emissions certified',
      timestamp: '2 days ago',
    },
  ];

  // Single Merged Priority Action List
  const actionItems: ActionItem[] = useMemo(() => [
    {
      id: 'act-01',
      title: 'ArcelorMittal Europe: Q3 CBAM Data Package Requested',
      category: 'buyer_request',
      categoryLabel: 'Buyer Request',
      urgency: 'critical',
      urgencyLabel: 'Critical Attention',
      dueDate: 'Oct 15, 2026',
      daysRemaining: 18,
      description: 'Sophie Dupont requested official EU CBAM Communication Sheet Annex IV for 36,200t Hot-Rolled Coils shipped via Port of Nemrut.',
      actionLabel: 'Fulfill Request',
      targetStep: 'step_3_buyers',
      referenceCode: 'REQ-ARCELOR-2026Q3',
    },
    {
      id: 'act-02',
      title: 'Q3 2026 Emissions Data Freeze in 4 Days',
      category: 'deadline',
      categoryLabel: 'Statutory Deadline',
      urgency: 'critical',
      urgencyLabel: '4 Days Left',
      dueDate: 'Oct 01, 2026',
      daysRemaining: 4,
      description: 'Direct natural gas telemetry and electricity meter billing must be locked prior to accredited verification statement sign-off.',
      actionLabel: 'Review in Calendar',
      targetStep: 'step_8_calendar',
      referenceCode: 'STAT-Q3-FREEZE',
    },
    {
      id: 'act-03',
      title: 'TÜV SÜD Periodic Meter Sampling & Calibration Audit',
      category: 'deadline',
      categoryLabel: 'Accredited Audit',
      urgency: 'urgent',
      urgencyLabel: 'Scheduled in 8 Days',
      dueDate: 'Oct 05, 2026',
      daysRemaining: 8,
      description: 'Lead auditor Klaus Weber will inspect continuous stack monitoring analyzers on Line #2 and natural gas chromatography logs.',
      actionLabel: 'View Documents in Products',
      targetStep: 'step_4_catalog',
      referenceCode: 'AUD-TUV-Q3',
    },
    {
      id: 'act-04',
      title: 'Wire Rod (SAE 1008): Missing Production Route Telemetry',
      category: 'incomplete_product',
      categoryLabel: 'Product Catalog',
      urgency: 'warning',
      urgencyLabel: 'Action Required',
      dueDate: 'Oct 10, 2026',
      daysRemaining: 13,
      description: 'Catalog entry for WR-SAE1008-5.5MM is currently falling back to EU default values. Entering actual EAF melt shop data saves estimated €48,200.',
      actionLabel: 'Enter Production Data',
      targetStep: 'step_4_catalog',
      referenceCode: 'CN 7213 91 10',
    },
    {
      id: 'act-05',
      title: 'Task: Reconcile BOTAŞ Pipeline Gas NCV & Carbon Content',
      category: 'overdue_task',
      categoryLabel: 'Compliance Task',
      urgency: 'warning',
      urgencyLabel: 'Assigned to You',
      dueDate: 'Sep 30, 2026',
      daysRemaining: 3,
      description: 'Collect laboratory gas chromatography assays for Plant #2 rolling reheat furnace to replace national default emission factor.',
      actionLabel: 'Open in Calendar',
      targetStep: 'step_8_calendar',
      referenceCode: 'TSK-GAS-Q3',
    },
  ], []);

  // Single Merged Count of Items Needing Attention
  const itemsNeedingAttentionCount = actionItems.length;

  const handleAction = (item: ActionItem) => {
    if (onNavigateStep) {
      onNavigateStep(item.targetStep);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* ------------------------------------------------------------------- */}
      {/* REVIEWER DISCREET TOOLBAR                                           */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-emerald-100 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            Home Overview — Lean Information Architecture
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            3 hero numbers, 1 prioritized action list, expandable insights
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">
            Inspect State:
          </span>
          <button
            type="button"
            onClick={() => setWorkspaceMode('active')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              workspaceMode === 'active'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active Operations ({itemsNeedingAttentionCount} actions)
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('new_workspace')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              workspaceMode === 'new_workspace'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Brand-New Workspace (Checklist)
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* BRAND-NEW WORKSPACE ONBOARDING CHECKLIST                             */}
      {/* ------------------------------------------------------------------- */}
      {workspaceMode === 'new_workspace' ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Welcome to {activeInstallation.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Get CBAM-Compliant in 3 Steps
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your division workspace is ready. Complete these 3 baseline steps to begin generating verified EU CBAM communication sheets and protecting your EU export quota.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Add Product */}
            <div className="p-6 rounded-2xl border border-emerald-100 bg-emerald-50/20 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-base flex items-center justify-center font-display">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Add Your First Product
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Classify your exported goods under official CN codes (72xx, 73xx, 76xx) and map production routes (e.g. EAF vs BF-BOF).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <span>Add Product</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 2: Add EU Buyer */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-4 hover:border-emerald-200 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-base flex items-center justify-center font-display">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Add Your First EU Buyer
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Register EU counterparty companies, EORI declarant IDs, and preferred declaration communication formats (XML, Excel).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBuyerOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
              >
                <span>Add EU Buyer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 3: Enter Production Data */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-4 hover:border-emerald-200 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-base flex items-center justify-center font-display">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Enter Production Data
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Log quarterly natural gas, fuel oil, and electricity bills to replace costly default values with verified actual emissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateStep && onNavigateStep('step_4_catalog')}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
              >
                <span>Enter Production Data</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ----------------------------------------------------------------- */}
          {/* THREE HERO NUMBERS ONLY (LEAN & SCANNED IN UNDER 30 SECONDS)       */}
          {/* ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hero Metric 1: Total Embedded Emissions YTD */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Embedded Emissions YTD</span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>{ytdTrendPercent}% vs PY</span>
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight tabular-nums">
                  {emissionsYtd.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                </span>
                <span className="text-xs font-semibold text-slate-500">tCO₂e</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Verified Scope 1 direct & Scope 2 indirect across 4 active product lines.
              </p>
            </div>

            {/* Hero Metric 2: Estimated Cost Exposure */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Estimated Cost Exposure</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  ETS: €{liveEtsPrice.toFixed(2)}/t
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold font-display text-amber-600 tracking-tight tabular-nums">
                  €{estimatedExposure.toLocaleString('en-US')}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                2026 phase-out liability rate (2.5%). Actual data saves ~€418k vs EU default values.
              </p>
            </div>

            {/* Hero Metric 3: Items Needing Attention (Single Merged Count) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Items Needing Attention</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight tabular-nums">
                  {itemsNeedingAttentionCount}
                </span>
                <span className="text-xs font-semibold text-slate-500">actions ranked</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Merged count of overdue tasks, approaching deadlines, and buyer data requests.
              </p>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* ONE PRIORITIZED ACTION LIST (RANKED BY URGENCY)                   */}
          {/* ----------------------------------------------------------------- */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Prioritized Actions</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                    {itemsNeedingAttentionCount} pending
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Single ranked queue of statutory deadlines, buyer requests, and incomplete records.
                </p>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Ranked by regulatory impact & deadline urgency
              </div>
            </div>

            {/* The Ranked List */}
            <div className="divide-y divide-slate-100">
              {actionItems.map((item, idx) => {
                const isCritical = item.urgency === 'critical';
                const isUrgent = item.urgency === 'urgent';

                return (
                  <div
                    key={item.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50/50 -mx-2 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Numeric Rank */}
                      <span className="text-xs font-mono font-bold text-slate-400 mt-1 w-4 shrink-0">
                        {idx + 1}.
                      </span>

                      {/* Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isCritical
                            ? 'bg-amber-50 border-amber-200 text-amber-600'
                            : isUrgent
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {item.category === 'buyer_request' ? (
                          <Building2 className="w-4 h-4" />
                        ) : item.category === 'deadline' ? (
                          <Clock className="w-4 h-4" />
                        ) : item.category === 'incomplete_product' ? (
                          <Layers className="w-4 h-4" />
                        ) : (
                          <CalendarDays className="w-4 h-4" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span
                            className={`font-semibold uppercase tracking-wider text-[10px] ${
                              isCritical ? 'text-amber-700' : 'text-slate-600'
                            }`}
                          >
                            {item.urgencyLabel}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-500 font-medium">{item.categoryLabel}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-400 font-mono">{item.dueDate}</span>
                          {item.referenceCode && (
                            <>
                              <span aria-hidden="true" className="text-slate-300">·</span>
                              <span className="text-slate-400 font-mono">{item.referenceCode}</span>
                            </>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 pl-7 sm:pl-0">
                      <button
                        type="button"
                        onClick={() => handleAction(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-2xs hover:scale-[1.01]"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* EXPANDABLE QUICK-ACCESS OPERATIONS HUBS (ALL FEATURES INTACT)     */}
          {/* ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Compliance Health Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900 font-display">Compliance Health</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHealthExpanded(!isHealthExpanded)}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline"
                >
                  {isHealthExpanded ? 'Hide' : 'Details'}
                </button>
              </div>

              {/* Stacked percentage bar */}
              <div className="space-y-1.5">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  {complianceBreakdown.map((c) => (
                    <div key={c.label} className={`h-full ${c.color}`} style={{ width: `${c.percentage}%` }} />
                  ))}
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>81% Submitted / In Review</span>
                  <span className="font-bold text-slate-800">16 declarations</span>
                </div>
              </div>

              {isHealthExpanded && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs animate-in fade-in duration-100">
                  {complianceBreakdown.map((c) => (
                    <div key={c.label} className="flex justify-between text-[11px]">
                      <span className="text-slate-600">{c.label}:</span>
                      <strong className={c.textColor}>{c.count} ({c.percentage}%)</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Top Products Portfolio Snapshot */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900 font-display">Portfolio Snapshot</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPortfolioExpanded(!isPortfolioExpanded)}
                  className="text-[11px] font-semibold text-indigo-700 hover:underline"
                >
                  {isPortfolioExpanded ? 'Hide' : 'Top Goods'}
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Actual SEE Savings:</span>
                  <span className="font-bold text-emerald-700">~€1.23M vs EU default</span>
                </div>
                <div className="text-[11px] text-slate-400">Average actual SEE: 0.655 tCO₂e/t vs 1.89 benchmark</div>
              </div>

              {isPortfolioExpanded && (
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs animate-in fade-in duration-100">
                  {portfolioProducts.map((p) => (
                    <div key={p.id} className="p-2 bg-slate-50 rounded-xl space-y-0.5">
                      <div className="font-bold text-slate-900 text-[11px]">{p.name}</div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Actual: {p.actualSEE} t/t</span>
                        <span className="text-emerald-700 font-bold">Save €{p.savingsEur.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Buyer Activity Stream */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900 font-display">Buyer Activity Feed</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                  className="text-[11px] font-semibold text-blue-700 hover:underline"
                >
                  {isActivityExpanded ? 'Hide' : 'Recent 3'}
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Active EU Relationships:</span>
                  <span className="font-bold text-slate-800">6 Importers</span>
                </div>
                <div className="text-[11px] text-slate-400">Latest: ArcelorMittal Q3 XML requested</div>
              </div>

              {isActivityExpanded && (
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs animate-in fade-in duration-100">
                  {recentActivities.map((a) => (
                    <div key={a.id} className="p-2 bg-slate-50 rounded-xl space-y-0.5 text-[11px]">
                      <div className="font-semibold text-slate-900">{a.buyer} ({a.country})</div>
                      <div className="text-slate-500 text-[10px]">{a.action} · {a.timestamp}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* COLLAPSED "INSIGHTS" SECTION AT THE BOTTOM                          */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Strategic Carbon Planning
              </div>
              <h3 className="text-base font-bold font-display text-slate-900">
                View analytics & what-if simulator
              </h3>
              <p className="text-xs text-slate-500">
                Model ETS price surges, route transitions (EAF vs DRI), and rising 2026–2034 phase-out liability curves
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              {isInsightsExpanded ? 'Hide simulator' : 'Expand simulator'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              {isInsightsExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </button>

        {isInsightsExpanded && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/30">
            <AnalyticsWhatIfView onNavigateStep={onNavigateStep} isEmbedded={true} />
          </div>
        )}
      </div>
    </div>
  );
};
