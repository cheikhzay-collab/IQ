'use client';
import React, { useState, useEffect, useCallback } from 'react';
import type { Lang } from '@/app/page';
import { Bell, CheckCheck, AlertTriangle, Info, RefreshCw } from 'lucide-react';

interface Props { lang: Lang; onAlertsRead: () => void; }

const t = {
  ar: {
    title: 'مركز التنبيهات',
    markAll: 'تحديد الكل كمقروء',
    noAlerts: 'لا توجد تنبيهات',
    unread: 'غير مقروء',
    read: 'مقروء',
    critical: 'حرج',
    high: 'عالي',
    medium: 'متوسط',
    refresh: 'تحديث',
  },
  fr: {
    title: 'Centre d\'alertes',
    markAll: 'Tout marquer comme lu',
    noAlerts: 'Aucune alerte',
    unread: 'Non lu',
    read: 'Lu',
    critical: 'Critique',
    high: 'Élevé',
    medium: 'Moyen',
    refresh: 'Actualiser',
  },
};

const PRIORITY_STYLES: Record<string, { border: string; icon: string; bg: string }> = {
  critical: { border: 'border-red-500/50', icon: 'text-red-400', bg: 'bg-red-500/10' },
  high: { border: 'border-orange-500/40', icon: 'text-orange-400', bg: 'bg-orange-500/10' },
  medium: { border: 'border-amber-500/30', icon: 'text-amber-400', bg: 'bg-amber-500/5' },
  low: { border: 'border-blue-500/20', icon: 'text-blue-400', bg: '' },
};

export default function AlertsPanel({ lang, onAlertsRead }: Props) {
  const tr = t[lang];
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      setAlerts(data.alerts || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const markAsRead = async (alertId?: number) => {
    await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertId ? { alertId } : { markAll: true }),
    });
    fetchAlerts();
    onAlertsRead();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-MA', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
        <RefreshCw className="animate-spin" size={18} /> {tr.refresh}...
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Bell size={18} className="text-amber-400" />
          </div>
          <div>
            <h2 className="font-bold text-white">{tr.title}</h2>
            {unreadCount > 0 && (
              <span className="text-xs text-amber-400">{unreadCount} {tr.unread}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAlerts} className="btn-secondary text-sm py-1.5">
            <RefreshCw size={14} />
          </button>
          {unreadCount > 0 && (
            <button onClick={() => markAsRead()} className="btn-secondary text-sm py-1.5">
              <CheckCheck size={14} />
              <span className="hidden sm:inline">{tr.markAll}</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-2">
          <Info size={36} className="text-gray-700" />
          <span>{tr.noAlerts}</span>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert: any) => {
            const style = PRIORITY_STYLES[alert.priority] || PRIORITY_STYLES.low;
            const isUnread = !alert.is_read;
            return (
              <div
                key={alert.id}
                className={`card border ${style.border} ${style.bg} ${isUnread ? 'shadow-lg' : 'opacity-70'} transition-all`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} className={`mt-0.5 flex-shrink-0 ${style.icon}`} />
                    <div>
                      <p className={`text-sm font-medium ${isUnread ? 'text-white' : 'text-gray-400'}`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {alert.tracking && (
                          <span className="text-xs font-mono text-cyan-400">{alert.tracking}</span>
                        )}
                        <span className="text-xs text-gray-500">{formatDate(alert.created_at)}</span>
                        <span className={`badge ${
                          alert.priority === 'critical' ? 'badge-danger' :
                          alert.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold' :
                          'badge-warning'
                        }`}>
                          {tr[alert.priority as keyof typeof tr] || alert.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isUnread && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
