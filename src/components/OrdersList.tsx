'use client';
import React, { useState, useEffect, useCallback } from 'react';
import type { Lang } from '@/app/page';
import {
  Search, Filter, Package, AlertTriangle, Phone,
  MessageSquare, RefreshCw, ChevronDown, Send, Bot, Eye,
  MapPin, CheckCircle2, Clock, XCircle, Download, Plus, Zap, AlertCircle
} from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';
import CreateOrderModal from './CreateOrderModal';

interface Props { 
  lang: Lang;
  onOpenSimulator?: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  'Livré': 'badge-success',
  'Refusé': 'badge-danger',
  'Reporté': 'badge-warning',
  'En cours de livraison': 'badge-info',
  'En attente': 'badge-gray',
  'Annulé': 'badge-danger',
  'Retourné': 'badge-purple',
};

const RISK_BADGE: Record<string, { class: string; label: { ar: string; fr: string } }> = {
  critical: { class: 'bg-red-500/20 text-red-400 border border-red-500/40', label: { ar: 'حرج', fr: 'Critique' } },
  high: { class: 'bg-orange-500/20 text-orange-400 border border-orange-500/30', label: { ar: 'مرتفع', fr: 'Élevé' } },
  medium: { class: 'bg-amber-500/20 text-amber-400 border border-amber-500/30', label: { ar: 'متوسط', fr: 'Moyen' } },
  low: { class: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', label: { ar: 'منخفض', fr: 'Faible' } },
};

const t = {
  ar: {
    search: 'بحث برقم التتبع أو اسم الزبون أو الهاتف...',
    filterStatus: 'الحالة',
    filterRisk: 'درجة الخطورة',
    filterCity: 'المدينة',
    all: 'الكل',
    allStatuses: 'جميع الحالات',
    allRisks: 'جميع المستويات',
    tracking: 'رقم التتبع',
    client: 'الزبون',
    phone: 'الهاتف',
    city: 'المدينة',
    status: 'الحالة',
    attempts: 'المحاولات',
    risk: 'الخطورة',
    updated: 'آخر تحديث',
    actions: 'إجراءات',
    sendWA: 'إرسال واتساب',
    generateAI: 'توليد بالـ AI',
    viewDetails: 'عرض التفاصيل',
    noOrders: 'لا توجد طلبات مطابقة للبحث',
    loading: 'جاري تحميل الطلبات...',
    refresh: 'تحديث القائمة',
    exportCSV: 'تصدير CSV',
    simulateOrder: 'محاكاة Webhook',
    pushToSendit: 'دفع شحنة إلى Sendit',
    syncSendit: 'مزامنة حية مع Sendit',
    syncing: 'جاري المزامنة...',
    total: 'إجمالي الطلبات',
    criticalCount: 'طلبات حرجة',
    messageSent: 'تم الإرسال بنجاح',
    messageFailed: 'فشل الإرسال',
  },
  fr: {
    search: 'Rechercher par tracking, nom ou téléphone...',
    filterStatus: 'Statut',
    filterRisk: 'Niveau de risque',
    filterCity: 'Ville',
    all: 'Tous',
    allStatuses: 'Tous les statuts',
    allRisks: 'Tous les risques',
    tracking: 'N° Suivi',
    client: 'Client',
    phone: 'Téléphone',
    city: 'Ville',
    status: 'Statut',
    attempts: 'Tentatives',
    risk: 'Risque',
    updated: 'Dernière mise à jour',
    actions: 'Actions',
    sendWA: 'WhatsApp',
    generateAI: 'Générer avec IA',
    viewDetails: 'Détails',
    noOrders: 'Aucun colis trouvé',
    loading: 'Chargement des colis...',
    refresh: 'Actualiser',
    exportCSV: 'Exporter CSV',
    simulateOrder: 'Simuler Webhook',
    pushToSendit: 'Pousser vers Sendit',
    syncSendit: 'Sync Directe Sendit',
    syncing: 'Synchronisation...',
    total: 'Total Colis',
    criticalCount: 'Colis Critiques',
    messageSent: 'Envoyé avec succès',
    messageFailed: 'Échec d\'envoi',
  },
};

const STATUSES = ['Livré', 'En cours de livraison', 'Reporté', 'Refusé', 'En attente', 'Retourné'];

export default function OrdersList({ lang, onOpenSimulator }: Props) {
  const tr = t[lang];
  const isAr = lang === 'ar';
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Sendit Live Sync state
  const [syncingSendit, setSyncingSendit] = useState(false);
  const [syncToast, setSyncToast] = useState<{ message: string; isError?: boolean } | null>(null);

  // Quick AI generation state
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [aiMessageMap, setAiMessageMap] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendSuccessMap, setSendSuccessMap] = useState<Record<string, boolean>>({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (riskFilter) params.set('risk', riskFilter);
    try {
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, [search, statusFilter, riskFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchOrders, 300);
    return () => clearTimeout(debounce);
  }, [fetchOrders]);

  const handleLiveSync = async () => {
    setSyncingSendit(true);
    try {
      const res = await fetch('/api/sendit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });
      const data = await res.json();
      await fetchOrders();
      if (!data.success) {
        setSyncToast({
          message: data.error || (isAr ? 'فشلت المزامنة مع Sendit' : 'Échec de synchronisation Sendit'),
          isError: true,
        });
        setTimeout(() => setSyncToast(null), 6000);
      } else {
        setSyncToast({
          message: data.message || (isAr 
            ? `تمت المزامنة بنجاح! تم تحديث ${data.syncedCount || 0} شحنة مع Sendit` 
            : `Synchronisation réussie ! ${data.syncedCount || 0} colis mis à jour`),
          isError: false,
        });
        setTimeout(() => setSyncToast(null), 4500);
      }
    } catch (err: any) {
      setSyncToast({
        message: isAr ? 'فشلت المزامنة: تعذر الاتصال بالخادم' : 'Échec de synchronisation avec le serveur',
        isError: true,
      });
      setTimeout(() => setSyncToast(null), 4000);
    }
    setSyncingSendit(false);
  };


  const handleQuickAI = async (order: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setGeneratingId(order.id);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', orderId: order.id, language: lang }),
      });
      const data = await res.json();
      if (data.message) {
        setAiMessageMap(prev => ({ ...prev, [order.id]: data.message }));
      }
    } catch { /* ignore */ }
    setGeneratingId(null);
  };

  const handleQuickSend = async (order: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = aiMessageMap[order.id];
    if (!msg) {
      setSelectedOrder(order);
      return;
    }

    setSendingId(order.id);
    try {
      const createRes = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', orderId: order.id, language: lang, messageText: msg }),
      });
      const { messageId } = await createRes.json();

      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', messageId, messageText: msg }),
      });

      setSendSuccessMap(prev => ({ ...prev, [order.id]: true }));
      setTimeout(() => {
        setSendSuccessMap(prev => {
          const c = { ...prev };
          delete c[order.id];
          return c;
        });
      }, 3000);
    } catch { /* ignore */ }
    setSendingId(null);
  };

  const exportCSV = () => {
    const headers = ['Tracking', 'Client', 'Phone', 'City', 'Status', 'Attempts', 'Risk', 'Date'];
    const rows = orders.map(o => [
      o.tracking,
      `"${o.client_name}"`,
      o.client_phone,
      `"${o.city}"`,
      o.status,
      o.attempt_count,
      o.risk_level,
      o.last_updated
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `deliveryiq_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const criticalOrders = orders.filter(o => o.risk_level === 'critical').length;

  return (
    <div className="space-y-5 animate-fade-up max-w-[1700px] mx-auto pb-10">
      {/* Top Filter & Action Bar */}
      <div className="card bg-[#0c1220]/80 border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tr.search}
              className="input ps-10 text-xs sm:text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Push New Delivery to Sendit */}
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn-primary text-xs py-2 px-3.5 rounded-xl shadow-purple-900/40 font-bold flex items-center gap-1.5"
            >
              <Plus size={15} className="text-white" />
              <span>{tr.pushToSendit}</span>
            </button>

            {/* Live Sync with Sendit */}
            <button
              onClick={handleLiveSync}
              disabled={syncingSendit}
              className="py-2 px-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title={tr.syncSendit}
            >
              <RefreshCw size={14} className={syncingSendit ? 'animate-spin text-cyan-400' : 'text-cyan-400'} />
              <span>{syncingSendit ? tr.syncing : tr.syncSendit}</span>
            </button>

            <button
              onClick={exportCSV}
              className="btn-secondary text-xs py-2 px-3 rounded-xl"
              title={tr.exportCSV}
            >
              <Download size={14} />
              <span className="hidden sm:inline">{tr.exportCSV}</span>
            </button>

            <button
              onClick={fetchOrders}
              className="btn-secondary text-xs py-2 px-3 rounded-xl"
              title={tr.refresh}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Sync Toast Notification */}
        {syncToast && (
          <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between animate-fade-up ${
            syncToast.isError 
              ? 'bg-rose-950/70 border-rose-500/50 text-rose-200 shadow-lg shadow-rose-950/40' 
              : 'bg-gradient-to-r from-cyan-950/70 to-purple-950/70 border-cyan-500/40 text-cyan-200'
          }`}>
            <div className="flex items-center gap-2">
              {syncToast.isError ? (
                <AlertCircle size={16} className="text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
              )}
              <span>{syncToast.message}</span>
            </div>
            <button 
              onClick={() => setSyncToast(null)} 
              className={`text-xs ml-3 ${syncToast.isError ? 'text-rose-400 hover:text-rose-200' : 'text-cyan-400/80 hover:text-cyan-200'}`}
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter size={13} /> {tr.filterStatus}:
          </span>

          <button
            onClick={() => setStatusFilter('')}
            className={`text-xs px-2.5 py-1 rounded-lg transition ${
              statusFilter === '' 
                ? 'bg-purple-600 text-white font-bold' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tr.allStatuses} ({total})
          </button>

          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              className={`text-xs px-2.5 py-1 rounded-lg transition ${
                statusFilter === s 
                  ? 'bg-purple-600 text-white font-bold' 
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}

          {/* Risk Level Filter dropdown */}
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="input text-xs py-1 px-2.5 w-auto ms-auto"
          >
            <option value="">{tr.allRisks}</option>
            <option value="critical">🔴 {isAr ? 'حرج' : 'Critique'}</option>
            <option value="high">🟠 {isAr ? 'مرتفع' : 'Élevé'}</option>
            <option value="medium">🟡 {isAr ? 'متوسط' : 'Moyen'}</option>
            <option value="low">🟢 {isAr ? 'منخفض' : 'Faible'}</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2.5 text-slate-400">
          <RefreshCw className="animate-spin text-purple-400" size={24} />
          <p className="text-sm font-semibold">{tr.loading}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center gap-3.5 bg-[#0d1322]/80 border border-slate-800 rounded-3xl animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
            <Package size={34} />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base md:text-lg">
              {isAr ? 'المنصة جاهزة لاستقبال وإدارة الطرود الفعلية' : 'Plateforme prête pour vos colis réels'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              {isAr 
                ? 'لا توجد طلبات مسجلة حالياً. ستظهر الطرود هنا فور وصولها تلقائياً عبر Webhook Sendit عند أي حركة شحن، أو يمكنك إنشاء ودفع شحنة جديدة مباشرة بنقرة زر.' 
                : 'Aucun colis pour le moment. Les colis apparaîtront automatiquement via le Webhook Sendit ou vous pouvez créer une expédition.'}
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary text-xs py-2.5 px-4 rounded-xl mt-1 font-bold flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>{isAr ? 'دفع شحنة جديدة إلى Sendit الآن' : 'Créer une expédition Sendit maintenant'}</span>
          </button>
        </div>

      ) : (
        <div className="grid grid-cols-1 gap-3">
          {orders.map(order => {
            const riskInfo = RISK_BADGE[order.risk_level] || RISK_BADGE.low;
            const hasAiMsg = !!aiMessageMap[order.id];
            const isSent = !!sendSuccessMap[order.id];

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`card bg-[#0b1120]/80 border transition-all duration-200 cursor-pointer hover:border-purple-500/40 hover:bg-[#0f172a]/90 ${
                  order.risk_level === 'critical' 
                    ? 'border-red-500/40 bg-red-950/10' 
                    : order.risk_level === 'high'
                    ? 'border-orange-500/30'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Tracking & Customer Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-sm text-cyan-400">
                        {order.tracking}
                      </span>
                      <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`}>
                        {order.status}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskInfo.class}`}>
                        {riskInfo.label[lang]}
                      </span>
                      {order.attempt_count > 0 && (
                        <span className="text-[11px] font-semibold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                          {order.attempt_count} {isAr ? 'محاولات' : 'tentatives'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                      <span className="font-semibold text-white">{order.client_name}</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin size={12} className="text-purple-400" />
                        {order.city}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1 font-mono">
                        <Phone size={12} className="text-emerald-400" />
                        {order.client_phone}
                      </span>
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-1">
                        "{order.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {/* Quick AI Message Button */}
                    <button
                      onClick={e => handleQuickAI(order, e)}
                      disabled={generatingId === order.id}
                      className="btn-secondary text-xs py-1.5 px-3 rounded-xl text-purple-300 border-purple-500/30 hover:bg-purple-600/20"
                      title={tr.generateAI}
                    >
                      {generatingId === order.id ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <Bot size={13} />
                      )}
                      <span>{hasAiMsg ? (isAr ? 'رسالة جاهزة' : 'Prêt') : tr.generateAI}</span>
                    </button>

                    {/* Quick WhatsApp Send */}
                    <button
                      onClick={e => handleQuickSend(order, e)}
                      disabled={sendingId === order.id}
                      className={`text-xs py-1.5 px-3 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                        isSent 
                          ? 'bg-emerald-500 text-white' 
                          : 'btn-success'
                      }`}
                    >
                      {sendingId === order.id ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : isSent ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <Send size={13} />
                      )}
                      <span>{isSent ? tr.messageSent : tr.sendWA}</span>
                    </button>

                    {/* View Details modal trigger */}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title={tr.viewDetails}
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </div>

                {/* Inline AI preview if generated */}
                {hasAiMsg && (
                  <div className="mt-3 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2">
                    <Bot size={15} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold text-[10px] text-purple-300 block mb-0.5">
                        {isAr ? 'الرسالة المقترحة من Gemini AI:' : 'Message suggéré par Gemini IA:'}
                      </span>
                      <p className="leading-relaxed">{aiMessageMap[order.id]}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          lang={lang}
          onOrderUpdated={fetchOrders}
        />
      )}

      {/* Push Order to Sendit Modal */}
      <CreateOrderModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        lang={lang}
        onSuccess={() => {
          fetchOrders();
        }}
      />
    </div>
  );
}
