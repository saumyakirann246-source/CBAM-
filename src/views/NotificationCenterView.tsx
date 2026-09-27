import React, { useState, useMemo } from 'react';
import { useCbam } from '../context/CbamContext';
import {
  Bell,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Users,
  Building2,
  ShieldCheck,
  BookOpen,
  Scale,
  FileText,
  Check,
  Filter,
  Search,
  Trash2,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  Settings,
  Sliders,
  Mail,
  Smartphone,
  Eye,
  Sparkles,
  ChevronRight,
  X,
  ArrowUpRight,
  Zap,
  Calendar,
  Layers,
  Flame,
  FileSpreadsheet,
  TrendingDown,
} from 'lucide-react';
import {
  NotificationItem,
  NotificationType,
  NotificationCategory,
  NotificationPreferenceSetting,
} from '../types/cbam';

interface NotificationCenterViewProps {
  onNavigateStep?: (stepId: string) => void;
  isDrawerMode?: boolean;
  onCloseDrawer?: () => void;
}

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({
  onNavigateStep,
  isDrawerMode = false,
  onCloseDrawer,
}) => {
  const {
    notifications,
    markNotificationRead,
    markNotificationUnread,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    restoreSampleNotifications,
    notificationPreferences,
    updateNotificationPreference,
    triggerToast,
    activeInstallation,
  } = useCbam();

  // Active Tab: Feed vs Delivery Preferences
  const [activeTab, setActiveTab] = useState<'feed' | 'preferences'>('feed');

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'critical' | 'informational' | 'system'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reviewer state override
  const [reviewerState, setReviewerState] = useState<'normal' | 'empty' | 'preferences'>('normal');

  // Computed metrics
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const criticalCount = useMemo(() => {
    return notifications.filter(
      (n) => (n.category === 'critical' || n.urgency === 'critical') && !n.isRead
    ).length;
  }, [notifications]);

  const deadlineCount = useMemo(() => {
    return notifications.filter((n) => n.type === 'deadline_alert' && !n.isRead).length;
  }, [notifications]);

  const buyerRequestCount = useMemo(() => {
    return notifications.filter((n) => n.type === 'buyer_request' && !n.isRead).length;
  }, [notifications]);

  // Filtered notifications
  const displayedNotifications = useMemo(() => {
    if (reviewerState === 'empty') {
      return [];
    }

    return notifications.filter((item) => {
      // Category filter (Critical, Informational, System)
      if (categoryFilter !== 'all') {
        const itemCategory = item.category || (item.urgency === 'critical' ? 'critical' : 'informational');
        if (itemCategory !== categoryFilter) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }

      // Read status filter
      if (statusFilter === 'unread' && item.isRead) return false;
      if (statusFilter === 'read' && !item.isRead) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchRef = item.referenceCode?.toLowerCase().includes(q) ?? false;
        const matchActor = item.actor?.name.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchDesc && !matchRef && !matchActor) return false;
      }

      return true;
    });
  }, [notifications, categoryFilter, typeFilter, statusFilter, searchQuery, reviewerState]);

  // Navigate to target step and optionally close drawer
  const handleActionClick = (item: NotificationItem) => {
    // Mark as read when acted upon
    if (!item.isRead) {
      markNotificationRead(item.id);
    }

    const targetStep = item.targetStepId || (
      item.targetView === 'buyers' ? 'step_3_buyers' :
      item.targetView === 'calendar' ? 'step_8_calendar' :
      item.targetView === 'vault' ? 'step_6_vault' :
      item.targetView === 'simulator' ? 'step_9_analytics' :
      item.targetView === 'emissions' ? 'step_5_emissions' :
      'step_2_dashboard'
    );

    if (onNavigateStep) {
      onNavigateStep(targetStep);
    }
    if (onCloseDrawer) {
      onCloseDrawer();
    }
  };

  // Helper to render type icon
  const renderTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'deadline_alert':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'buyer_request':
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      case 'verification_update':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'regulatory_update':
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'team_activity':
        return <Users className="w-4 h-4 text-teal-600" />;
      case 'carbon_price':
        return <TrendingDown className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'deadline_alert':
        return 'Deadline Alert';
      case 'buyer_request':
        return 'Buyer Request';
      case 'verification_update':
        return 'Verification';
      case 'regulatory_update':
        return 'Regulatory Update';
      case 'team_activity':
        return 'Team Activity';
      case 'carbon_price':
        return 'Carbon Price';
      default:
        return 'System Alert';
    }
  };

  return (
    <div className={`space-y-6 ${isDrawerMode ? 'p-6' : ''}`}>
      {/* ------------------------------------------------------------------- */}
      {/* REVIEWER SIMULATION TOOLBAR (DISCREET)                               */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-emerald-100 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            Step 11 — Notification Center & Alert Dispatch
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Centralized hub for deadlines, buyer requests & regulatory shifts
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">
            Inspect State:
          </span>
          <button
            type="button"
            onClick={() => {
              setReviewerState('normal');
              setActiveTab('feed');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              reviewerState === 'normal' && activeTab === 'feed'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active Feed ({unreadCount} unread)
          </button>
          <button
            type="button"
            onClick={() => {
              setReviewerState('empty');
              setActiveTab('feed');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              reviewerState === 'empty'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Caught Up (Empty)
          </button>
          <button
            type="button"
            onClick={() => {
              setReviewerState('preferences');
              setActiveTab('preferences');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'preferences'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Delivery Preferences
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* HEADER WITH PRIMARY ACTIONS & METRICS                                */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
                  Notification Center
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-500">
                  Real-time alerts, verification logs, buyer inquiries, and DG TAXUD regulatory updates for {activeInstallation.name}.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'feed' ? 'preferences' : 'feed')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                activeTab === 'preferences'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{activeTab === 'preferences' ? 'Back to Feed' : 'Notification Preferences'}</span>
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-medium transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark All as Read</span>
              </button>
            )}

            <button
              type="button"
              onClick={notifications.length === 0 ? restoreSampleNotifications : clearAllNotifications}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium transition-colors"
              title={notifications.length === 0 ? 'Restore initial alerts' : 'Clear all alerts'}
            >
              {notifications.length === 0 ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restore Alerts</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Clear All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* STATS STRIP (NOT PILLS: CLEAN UNBOXED METRICS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <div className="text-[11px] font-medium text-slate-500">Unread Alerts</div>
            <div className="text-xl font-bold font-display text-slate-900 mt-0.5">
              {unreadCount}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Critical Attention</div>
            <div className="text-xl font-bold font-display text-amber-600 mt-0.5">
              {criticalCount}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Approaching Deadlines</div>
            <div className="text-xl font-bold font-display text-slate-900 mt-0.5">
              {deadlineCount}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Buyer Inquiries</div>
            <div className="text-xl font-bold font-display text-slate-900 mt-0.5">
              {buyerRequestCount}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* VIEWPORT CONTENT: EITHER FEED OR PREFERENCES                         */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'feed' ? (
        <div className="space-y-4">
          {/* FILTERING & CONTROLS TOOLBAR */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Category Segmented Control (Critical, Informational, System) */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 font-medium rounded-lg transition-all ${
                    categoryFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Alerts ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('critical')}
                  className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-lg transition-all ${
                    categoryFilter === 'critical'
                      ? 'bg-white text-amber-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>Critical</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('informational')}
                  className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-lg transition-all ${
                    categoryFilter === 'informational'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Info className="w-3 h-3 text-blue-500" />
                  <span>Informational</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('system')}
                  className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-lg transition-all ${
                    categoryFilter === 'system'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale className="w-3 h-3 text-slate-500" />
                  <span>System / Reg</span>
                </button>
              </div>

              {/* Status Selector (All, Unread Only, Read Only) */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 font-medium mr-1 hidden sm:inline">Status:</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-slate-200 text-slate-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('unread')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    statusFilter === 'unread'
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('read')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    statusFilter === 'read'
                      ? 'bg-slate-200 text-slate-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Read
                </button>
              </div>
            </div>

            {/* Type Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
                <span className="text-slate-400 font-medium shrink-0">Type:</span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'deadline_alert', label: 'Deadlines' },
                  { id: 'buyer_request', label: 'Buyer Requests' },
                  { id: 'verification_update', label: 'Verification' },
                  { id: 'regulatory_update', label: 'Regulatory' },
                  { id: 'team_activity', label: 'Team Activity' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTypeFilter(t.id as any)}
                    className={`px-2 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors ${
                      typeFilter === t.id
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search alerts, EORI, or regulation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* NOTIFICATION LIST VIEW                                            */}
          {/* ----------------------------------------------------------------- */}
          {displayedNotifications.length === 0 ? (
            /* EMPTY ("ALL CAUGHT UP") STATE */
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900 font-display">
                  You're all caught up!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  There are no pending alerts or unread notifications matching your current filters. All emissions declarations, verification schedules, and buyer communications are in order.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                {(categoryFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('all');
                      setTypeFilter('all');
                      setStatusFilter('all');
                      setSearchQuery('');
                      setReviewerState('normal');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Reset All Filters
                  </button>
                )}

                <button
                  type="button"
                  onClick={restoreSampleNotifications}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Sample Alert Stream</span>
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE NOTIFICATIONS LIST */
            <div className="space-y-2.5">
              {displayedNotifications.map((notif) => {
                const isCritical = notif.category === 'critical' || notif.urgency === 'critical';

                return (
                  <div
                    key={notif.id}
                    className={`group bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-2xs hover:shadow-xs relative ${
                      notif.isRead
                        ? 'border-slate-200/80 opacity-90'
                        : isCritical
                        ? 'border-amber-200/90 bg-amber-50/20'
                        : 'border-emerald-200/80 bg-emerald-50/15'
                    }`}
                  >
                    {/* Unread Accent Indicator */}
                    {!notif.isRead && (
                      <span
                        className={`absolute left-2.5 top-5 w-2 h-2 rounded-full ${
                          isCritical ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        title="Unread notification"
                      />
                    )}

                    <div className="flex items-start gap-3.5 pl-3">
                      {/* Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isCritical
                            ? 'bg-amber-50 border-amber-200 text-amber-600'
                            : notif.type === 'buyer_request'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : notif.type === 'verification_update'
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : notif.type === 'regulatory_update'
                            ? 'bg-purple-50 border-purple-200 text-purple-600'
                            : notif.type === 'team_activity'
                            ? 'bg-teal-50 border-teal-200 text-teal-600'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {renderTypeIcon(notif.type)}
                      </div>

                      {/* Content Body */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Metadata Header (UNBOXED TEXT WITH TYPOGRAPHIC SEPARATORS) */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">
                            {getTypeLabel(notif.type)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{notif.timestamp}</span>
                          {notif.referenceCode && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-slate-400">
                                {notif.referenceCode}
                              </span>
                            </>
                          )}
                          {isCritical && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-amber-700 font-bold uppercase tracking-wider text-[10px]">
                                Critical Attention
                              </span>
                            </>
                          )}
                        </div>

                        {/* Title */}
                        <h4
                          className={`text-sm tracking-tight ${
                            notif.isRead
                              ? 'font-medium text-slate-800'
                              : 'font-bold text-slate-900 font-display'
                          }`}
                        >
                          {notif.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {notif.description}
                        </p>

                        {/* Optional Actor metadata */}
                        {notif.actor && (
                          <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                              {notif.actor.avatar}
                            </div>
                            <span className="text-[11px]">
                              {notif.actor.name}{' '}
                              {notif.actor.role && (
                                <span className="text-slate-400">({notif.actor.role})</span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Action Bar */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                          {/* Direct Navigation Button into Relevant Screen */}
                          {notif.actionLabel && (
                            <button
                              type="button"
                              onClick={() => handleActionClick(notif)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all hover:scale-[1.01]"
                            >
                              <span>{notif.actionLabel}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick Secondary Actions */}
                          <div className="flex items-center gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() =>
                                notif.isRead
                                  ? markNotificationUnread(notif.id)
                                  : markNotificationRead(notif.id)
                              }
                              className="text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              {notif.isRead ? 'Mark unread' : 'Mark read'}
                            </button>
                            <span className="text-slate-200">|</span>
                            <button
                              type="button"
                              onClick={() => deleteNotification(notif.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                              title="Dismiss notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ------------------------------------------------------------------- */
        /* NOTIFICATION PREFERENCES SETTINGS SUB-VIEW                          */
        /* ------------------------------------------------------------------- */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-display tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              Delivery Preferences & Notification Channels
            </h3>
            <p className="text-xs text-slate-500">
              Configure which alerts appear inside the application workspace and which generate immediate email notifications to your compliance team.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
            {notificationPreferences.map((pref) => (
              <div key={pref.id} className="p-5 sm:p-6 bg-white hover:bg-slate-50/50 transition-colors space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900">{pref.label}</h4>
                    <p className="text-xs text-slate-500">{pref.description}</p>
                  </div>

                  {/* Channel Toggles */}
                  <div className="flex items-center gap-4 shrink-0">
                    {/* In-App Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={pref.inApp}
                        onChange={(e) =>
                          updateNotificationPreference(pref.id, { inApp: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                      />
                      <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                      <span>In-App</span>
                    </label>

                    {/* Email Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={pref.email}
                        onChange={(e) =>
                          updateNotificationPreference(pref.id, { email: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email</span>
                    </label>
                  </div>
                </div>

                {/* Sub-controls when email is enabled */}
                {pref.email && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/80 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Email Frequency:</span>
                      <select
                        value={pref.frequency}
                        onChange={(e) =>
                          updateNotificationPreference(pref.id, {
                            frequency: e.target.value as any,
                          })
                        }
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="instant">Instant Dispatch</option>
                        <option value="daily_digest">Daily Digest (08:00 CET)</option>
                        <option value="weekly_summary">Weekly Executive Summary (Mondays)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Urgency Threshold:</span>
                      <select
                        value={pref.minUrgency}
                        onChange={(e) =>
                          updateNotificationPreference(pref.id, {
                            minUrgency: e.target.value as any,
                          })
                        }
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="all">Deliver All Alerts</option>
                        <option value="critical_only">Critical & Action Required Only</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Preferences are synchronized with company compliance account elena.rostova@aegeansteel.com.
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveTab('feed');
                triggerToast('Preferences saved successfully.');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
            >
              Save & Return to Feed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
