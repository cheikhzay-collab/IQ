'use client';
import React, { useState, useEffect } from 'react';
import type { Lang } from '@/app/page';
import {
  Package, CheckCircle2, XCircle, Clock, Truck,
  AlertTriangle, MessageSquare, TrendingUp, Sparkles, RefreshCw,
  ArrowUpRight, Target, ShieldAlert, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface Props { 
  lang: Lang;
  onNavigateToOrders?: () => void;
  onOpenOrder?: (order: any) => void;
}

const t = {
  ar: {
    deliveryRate: 'نسبة التسليم الإجمالية',
    deliveryGoal: 'الهدف المطلوب: 85%',
    total: 'إجمالي الطلبات',
    delivered: 'تم التسليم',
    refused: 'مرفوضة',
    postponed: 'مؤجّلة',
    inProgress: 'قيد التوصيل',
    critical: 'حرجة تتطلب تدخلاً',
    waRecovered: 'رسائل WhatsApp منقذة',
    trend: 'تطور التوصيل اليومي (آخر 7 أيام)',
    cities: 'أداء المدن في التوصيل',
    statusBreakdown: 'توزيع حالات الطرود',
    aiInsight: 'تحليل وتوصيات Gemini AI الذكية',
    aiInsightDesc: 'خوارزميات الذكاء الاصطناعي لرفع نسبة التسليم واسترجاع الطرود المرفوضة والمؤجلة',
    urgentOrders: 'الطرود الأكثر إلحاحاً (فرص استرجاع عاجلة)',
    client: 'الزبون',
    city: 'المدينة',
    attempts: 'المحاولات',
    action: 'إجراء سريع',
    contactWA: 'تواصل فوري',
    viewAll: 'عرض جميع الطلبات',
    refresh: 'تحديث المؤشرات',
    loading: 'جاري تحميل لوحة التحكم...',
    noData: 'لا توجد بيانات كافية حالياً',
  },
  fr: {
    deliveryRate: 'Taux de Livraison Global',
    deliveryGoal: 'Objectif: 85%',
    total: 'Total Colis',
    delivered: 'Livrés avec succès',
    refused: 'Refusés',
    postponed: 'Reportés',
    inProgress: 'En cours de livraison',
    critical: 'Critiques à traiter',
    waRecovered: 'Messages WhatsApp de récupération',
    trend: 'Évolution journalière (7 derniers jours)',
    cities: 'Performance par Ville',
    statusBreakdown: 'Répartition des statuts',
    aiInsight: 'Analyse & Recommandations Gemini AI',
    aiInsightDesc: 'Intelligence Artificielle pour maximiser la délivrabilité et récupérer les refus',
    urgentOrders: 'Colis Urgents (Opportunités de Récupération)',
    client: 'Client',
    city: 'Ville',
    attempts: 'Tentatives',
    action: 'Action rapide',
    contactWA: 'WhatsApp Direct',
    viewAll: 'Voir tous les colis',
    refresh: 'Actualiser',
    loading: 'Chargement des données...',
    noData: 'Aucune donnée disponible',
  },
};

const STATUS_COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6'];

export default function Dashboard({ lang, onNavigateToOrders, onOpenOrder }: Props) {
  const tr = t[lang];
  const isAr = lang === 'ar';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingAI, setRefreshingAI] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?lang=${lang}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lang]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
          <RefreshCw className="animate-spin" size={22} />
        </div>
        <p className="text-sm font-semibold text-slate-400">{tr.loading}</p>
      </div>
    );
  }

  const s = data?.summary || {};
  const rate = s.deliveryRate || 0;
  const criticalCount = data?.risk?.critical || 0;
  const highRiskCount = data?.risk?.high || 0;

  const pieData = [
    { name: tr.delivered, value: s.delivered || 0, color: '#10b981' },
    { name: tr.refused, value: s.refused || 0, color: '#f43f5e' },
    { name: tr.postponed, value: s.postponed || 0, color: '#f59e0b' },
    { name: tr.inProgress, value: s.inProgress || 0, color: '#06b6d4' },
  ].filter(d => d.value > 0);

  const cityData = (data?.cities || []).slice(0, 5);
  const maxCityCount = Math.max(...cityData.map((c: any) => c.count), 1);

  return (
    <div className="space-y-6 animate-fade-up max-w-[1700px] mx-auto pb-10">
      {/* Top Banner KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Delivery Rate Card */}
        <div className="sm:col-span-2 lg:col-span-1 stat-card bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/30 border-purple-500/30 glow-purple">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-300">{tr.deliveryRate}</span>
            <div className="p-1 rounded-lg bg-purple-500/20 text-purple-300">
              <TrendingUp size={16} />
            </div>
          </div>
          
          <div className="flex items-baseline gap-3 my-1">
            <span className="text-4xl lg:text-5xl font-black text-white tracking-tight">{rate}%</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight size={14} /> +4.2%
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>{isAr ? 'التقدم نحو الهدف' : 'Progression'}</span>
              <span className="font-semibold text-purple-300">{tr.deliveryGoal}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(rate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Delivered Card */}
        <StatCard
          icon={CheckCircle2}
          label={tr.delivered}
          value={s.delivered || 0}
          color="text-emerald-400"
          bg="bg-emerald-500/15"
          border="border-emerald-500/25"
          sub={`${s.total ? Math.round((s.delivered / s.total) * 100) : 0}% ${isAr ? 'من المجموع' : 'du total'}`}
        />

        {/* In Progress Card */}
        <StatCard
          icon={Truck}
          label={tr.inProgress}
          value={s.inProgress || 0}
          color="text-cyan-400"
          bg="bg-cyan-500/15"
          border="border-cyan-500/25"
          sub={isAr ? 'جاري توزيعها اليوم' : 'En distribution aujourd\'hui'}
        />

        {/* Postponed / Needs Action */}
        <StatCard
          icon={Clock}
          label={tr.postponed}
          value={s.postponed || 0}
          color="text-amber-400"
          bg="bg-amber-500/15"
          border="border-amber-500/25"
          sub={isAr ? 'فرص استرجاع بالواتساب' : 'À récupérer par WhatsApp'}
        />
      </div>

      {/* Second Row: Refused, Critical, WhatsApp Sent, Total */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MiniStatCard
          icon={XCircle}
          label={tr.refused}
          value={s.refused || 0}
          color="text-rose-400"
          badge="High Priority"
        />
        <MiniStatCard
          icon={AlertTriangle}
          label={tr.critical}
          value={criticalCount}
          color="text-red-400"
          badge={criticalCount > 0 ? 'Urgent' : 'OK'}
          isPulsing={criticalCount > 0}
        />
        <MiniStatCard
          icon={MessageSquare}
          label={tr.waRecovered}
          value={data?.whatsapp?.sent || 0}
          color="text-purple-400"
          badge={`${data?.whatsapp?.pending || 0} ${isAr ? 'معلقة' : 'en attente'}`}
        />
        <MiniStatCard
          icon={Package}
          label={tr.total}
          value={s.total || 0}
          color="text-slate-300"
          badge="Sendit API"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 card border-slate-800/90 bg-[#0c1220]/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <TrendingUp size={16} />
              </div>
              <h3 className="font-bold text-white text-sm">{tr.trend}</h3>
            </div>
            <span className="text-[11px] text-slate-400 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
              {isAr ? 'تحديث تلقائي' : 'Temps réel'}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRefused" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0e1626', 
                    border: '1px solid rgba(139, 92, 246, 0.3)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDelivered)" name={tr.delivered} />
                <Area type="monotone" dataKey="refused" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorRefused)" name={tr.refused} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="card border-slate-800/90 bg-[#0c1220]/80 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-sm mb-1">{tr.statusBreakdown}</h3>
            <p className="text-[11px] text-slate-400 mb-3">{isAr ? 'النسبة المئوية لكل حالة' : 'Part par statut'}</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0e1626', 
                      border: '1px solid #334155', 
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '11px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500">{tr.noData}</span>
            )}
          </div>

          {/* Custom Mini Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.name}:</span>
                <span className="font-bold ms-auto text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: AI Insights & Cities Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gemini AI Recommendations (2 cols) */}
        <div className="lg:col-span-2 card bg-gradient-to-br from-purple-950/30 via-[#0e1424] to-slate-900 border-purple-500/35 relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shadow-md">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  {tr.aiInsight}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Gemini 1.5 Flash
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">{tr.aiInsightDesc}</p>
              </div>
            </div>

            <button
              onClick={fetchData}
              className="text-xs py-1.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 transition"
            >
              <RefreshCw size={12} />
              <span>{tr.refresh}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
            {data?.aiInsight || (isAr ? 'جاري استخراج توصيات الذكاء الاصطناعي...' : 'Analyse IA en cours...')}
          </div>

          {/* Quick AI Action Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-purple-500/15">
            <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/15">
              <span className="text-[11px] font-bold text-purple-300 block mb-0.5">
                {isAr ? '1. توقيت الإرسال' : '1. Timing'}
              </span>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'إرسال تأكيد الموعد بين 09:30 و 11:00 يرفع الاستجابة بـ 34%' : 'Confirmer l\'horaire le matin booste la réponse de 34%'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/15">
              <span className="text-[11px] font-bold text-emerald-300 block mb-0.5">
                {isAr ? '2. اللهجة المغربية (الدارجة)' : '2. Message Darija'}
              </span>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'الرسائل بالدارجة اللطيفة خفضت نسبة الرفض النهائي بـ 28%' : 'Les messages en Darija réduisent les refus de 28%'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/15">
              <span className="text-[11px] font-bold text-cyan-300 block mb-0.5">
                {isAr ? '3. التدخل الفوري' : '3. Intervention'}
              </span>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'معالجة الطرد المؤجل خلال أقل من ساعتين تضمن إعادة جدولته' : 'Traiter les reports en moins de 2h garantit la livraison'}
              </p>
            </div>
          </div>
        </div>

        {/* Cities Delivery Breakdown */}
        <div className="card border-slate-800/90 bg-[#0c1220]/80 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-sm mb-1">{tr.cities}</h3>
            <p className="text-[11px] text-slate-400 mb-4">{isAr ? 'حجم الطلبات والنشاط الجغرافي' : 'Répartition géographique'}</p>

            <div className="space-y-3">
              {cityData.map((c: any, i: number) => {
                const pct = Math.round((c.count / maxCityCount) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{c.city}</span>
                      <span className="font-bold text-white">{c.count} {isAr ? 'طلب' : 'colis'}</span>
                    </div>
                    <div className="h-2 bg-slate-800/90 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-700" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>{isAr ? 'أعلى تركيز للطلبات:' : 'Top concentration:'}</span>
            <span className="font-bold text-purple-300">{cityData[0]?.city || 'الدار البيضاء'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg, border, sub }: any) {
  return (
    <div className={`stat-card ${border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        <div className={`w-8 h-8 rounded-xl ${bg} ${color} flex items-center justify-center`}>
          <Icon size={17} />
        </div>
      </div>
      <div className="text-3xl font-black text-white tracking-tight my-1">{value}</div>
      {sub && <p className="text-[11px] text-slate-400 mt-1 truncate">{sub}</p>}
    </div>
  );
}

function MiniStatCard({ icon: Icon, label, value, color, badge, isPulsing }: any) {
  return (
    <div className={`p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 relative overflow-hidden transition-all hover:border-slate-700 ${isPulsing ? 'border-red-500/40' : ''}`}>
      <div className="flex items-center justify-between mb-1.5">
        <Icon size={16} className={color} />
        {badge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            badge === 'Urgent' ? 'bg-red-500/20 text-red-300 animate-pulse' : 'bg-slate-800 text-slate-400'
          }`}>
            {badge}
          </span>
        )}
      </div>
      <div className={`text-2xl font-black ${color} my-0.5`}>{value}</div>
      <p className="text-[11px] text-slate-400 truncate">{label}</p>
    </div>
  );
}
