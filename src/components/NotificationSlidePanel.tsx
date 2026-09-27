import React, { useState, useMemo } from 'react';
import { useCbam } from '../context/CbamContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Building2,
  ShieldCheck,
  BookOpen,
  Scale,
  Users,
  TrendingDown,
  Check,
  Trash2,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  Sliders,
  X,
  Maximize2,
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../types/cbam';

interface NotificationSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateStep: (stepId: string) => void;
}

export const NotificationSlidePanel: React.FC<NotificationSlidePanelProps> = ({
  isOpen,
  onClose,
  onNavigateStep,
}) => {
  const {
    notifications,
    markNotificationRead,
    markNotificationUnread,
    markAllNotificationsRead,
    deleteNotification,
    restoreSampleNotifications,
    notificationPreferences,
    updateNotificationPreference,
    triggerToast,
  } = useCbam();

  const [filterMode, setFilterMode] = useState<'all' | 'critical' | 'buyers' | 'deadlines'>('all');
  const [showPreferences, setShowPreferences] = useState(false);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (filterMode === 'critical') {
        return item.category === 'critical' || item.urgency === 'critical';
      }
      if (filterMode === 'buyers') {
        return item.type === 'buyer_request';
      }
      if (filterMode === 'deadlines') {
        return item.type === 'deadline_alert';
      }
      return true;
    });
  }, [notifications, filterMode]);

  if (!isOpen) return null;

  const handleActionClick = (item: NotificationItem) => {
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

    onNavigateStep(targetStep);
    onClose();
  };

  const renderIcon = (type: NotificationType) => {
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 animate-in slide-in-from-right duration-250 ease-out">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onNavigateStep('step_11_notifications');
                onClose();
              }}
              title="Open full-page command center"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close notification panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-header Controls */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
          {/* Quick Filter tabs */}
          <div className="flex items-center gap-1 text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setShowPreferences(false);
                setFilterMode('all');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                !showPreferences && filterMode === 'all'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPreferences(false);
                setFilterMode('critical');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                !showPreferences && filterMode === 'critical'
                  ? 'bg-amber-100 text-amber-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>Critical</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPreferences(false);
                setFilterMode('buyers');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                !showPreferences && filterMode === 'buyers'
                  ? 'bg-emerald-100 text-emerald-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Buyers
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPreferences(false);
                setFilterMode('deadlines');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                !showPreferences && filterMode === 'deadlines'
                  ? 'bg-slate-200 text-slate-800 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Deadlines
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && !showPreferences && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPreferences(!showPreferences)}
              title="Notification channels & delivery"
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                showPreferences
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {showPreferences ? (
            /* PREFERENCES IN DRAWER */
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Delivery Channels
                </h3>
                <p className="text-xs text-slate-500">
                  Choose which compliance alerts generate email alerts or remain in-app.
                </p>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {notificationPreferences.map((pref) => (
                  <div key={pref.id} className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-bold text-slate-800">{pref.label}</div>
                      <div className="flex items-center gap-3 text-xs">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pref.inApp}
                            onChange={(e) =>
                              updateNotificationPreference(pref.id, { inApp: e.target.checked })
                            }
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-[11px] text-slate-600">In-App</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pref.email}
                            onChange={(e) =>
                              updateNotificationPreference(pref.id, { email: e.target.checked })
                            }
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-[11px] text-slate-600">Email</span>
                        </label>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {pref.description}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPreferences(false);
                  triggerToast('Preferences saved.');
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Done
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            /* EMPTY ("ALL CAUGHT UP") DRAWER STATE */
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  You're all caught up!
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  No alerts currently match this view. All reporting deadlines and buyer requests are satisfied.
                </p>
              </div>
              <button
                type="button"
                onClick={restoreSampleNotifications}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Restore Sample Alerts</span>
              </button>
            </div>
          ) : (
            /* LIST OF CARDS IN DRAWER */
            <div className="space-y-2.5">
              {filteredNotifications.map((notif) => {
                const isCritical = notif.category === 'critical' || notif.urgency === 'critical';

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                      notif.isRead
                        ? 'border-slate-200/80 bg-white opacity-85'
                        : isCritical
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-emerald-200/90 bg-emerald-50/20'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">{renderIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {notif.timestamp}
                          </span>
                          {!notif.isRead && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isCritical ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                          )}
                        </div>

                        <div
                          className={`mt-0.5 leading-snug ${
                            notif.isRead
                              ? 'text-slate-800 font-medium'
                              : 'text-slate-900 font-bold'
                          }`}
                        >
                          {notif.title}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">
                      {notif.description}
                    </p>

                    <div className="pl-6 pt-1 flex items-center justify-between gap-2">
                      {notif.actionLabel ? (
                        <button
                          type="button"
                          onClick={() => handleActionClick(notif)}
                          className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 text-[11px] hover:underline"
                        >
                          <span>{notif.actionLabel}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            notif.isRead
                              ? markNotificationUnread(notif.id)
                              : markNotificationRead(notif.id)
                          }
                          className="text-[10px] text-slate-400 hover:text-slate-700 font-medium"
                        >
                          {notif.isRead ? 'Mark unread' : 'Mark read'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteNotification(notif.id)}
                          className="text-slate-300 hover:text-red-500"
                          title="Dismiss"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onNavigateStep('step_11_notifications');
              onClose();
            }}
            className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold shadow-2xs transition-colors text-center"
          >
            View Full Notification Hub (Step 11)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
