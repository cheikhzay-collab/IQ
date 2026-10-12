'use client';
import React, { useState } from 'react';
import { Menu, Globe, Bell, Zap, RefreshCw, Database } from 'lucide-react';
import type { Lang, Page } from '@/app/page';

interface TopBarProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  currentPage: Page;
  setSidebarOpen: (v: boolean) => void;
  unreadAlerts: number;
  setCurrentPage: (p: Page) => void;
  onOpenSimulator: () => void;
  onResetData: () => void;
}

const pageTitles: Record<string, { ar: string; fr: string; subtitle: { ar: string; fr: string } }> = {
  dashboard: { 
    ar: 'لوحة التحكم والتحليلات', 
    fr: 'Tableau de bord & Analyses',
    subtitle: { ar: 'متابعة مؤشرات التسليم والأداء اللوجستي الفوري', fr: 'Indicateurs de livraison et performance logistique en temps réel' }
  },
  orders: { 
    ar: 'إدارة وتتبع الطلبات', 
    fr: 'Gestion & Suivi des Colis',
    subtitle: { ar: 'كافة الطرود المستلمة عبر Sendit مع تصنيف الخطورة وتدخلات الواتساب', fr: 'Tous les colis reçus via Sendit avec analyse de risque et actions WhatsApp' }
  },
  alerts: { 
    ar: 'مركز التنبيهات الذكية', 
    fr: 'Centre d\'Alertes Intelligentes',
    subtitle: { ar: 'إشعارات حرجة حول الطرود المهددة بالإرجاع أو الرفض', fr: 'Notifications critiques sur les colis menacés de retour ou refus' }
  },
  messages: { 
    ar: 'سجل رسائل WhatsApp', 
    fr: 'Historique des Messages WhatsApp',
    subtitle: { ar: 'الرسائل المرسلة والمولدة بالذكاء الاصطناعي لاسترجاع الزبائن', fr: 'Messages envoyés et générés par l\'IA pour récupérer les clients' }
  },
  ai: { 
    ar: 'المساعد اللوجستي Gemini AI', 
    fr: 'Assistant Logistique Gemini AI',
    subtitle: { ar: 'محادثة ذكية للاستفسار عن البيانات واقتراح خطط رفع نسبة التسليم', fr: 'Chat IA pour analyser les données et améliorer le taux de livraison' }
  },
  settings: { 
    ar: 'الإعدادات والربط التقني', 
    fr: 'Paramètres & Intégrations',
    subtitle: { ar: 'إعداد Webhook Sendit ومفاتيح Gemini و Meta WhatsApp Cloud API', fr: 'Configuration Webhook Sendit, clés Gemini et WhatsApp API' }
  },
};

export default function TopBar({ 
  lang, setLang, currentPage, setSidebarOpen, unreadAlerts, 
  setCurrentPage, onOpenSimulator, onResetData 
}: TopBarProps) {
  const isAr = lang === 'ar';
  const pageInfo = pageTitles[currentPage] || pageTitles.dashboard;
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    await onResetData();
    setTimeout(() => setResetting(false), 800);
  };

  const now = new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <header className="flex items-center justify-between px-5 py-3.5 bg-[#090e1a]/90 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 flex-shrink-0 transition-all">
      {/* Left / Start: Mobile Menu Toggle + Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 transition text-slate-300"
          title="Menu"
        >
          <Menu size={19} />
        </button>
        <div className="min-w-0">
          <h2 className="font-bold text-white text-base md:text-lg leading-tight truncate">
            {pageInfo[lang]}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block truncate max-w-md">
            {pageInfo.subtitle[lang]}
          </p>
        </div>
      </div>

      {/* Right / End: Actions */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Webhook Simulator Button */}
        <button
          onClick={onOpenSimulator}
          className="btn-primary text-xs py-1.5 px-3 rounded-xl shadow-purple-900/30 font-medium"
          title={isAr ? 'محاكاة وصول Webhook' : 'Simuler un Webhook'}
        >
          <Zap size={14} className="text-yellow-300" />
          <span className="hidden md:inline">{isAr ? 'محاكاة Webhook' : 'Simuler Webhook'}</span>
        </button>

        {/* Reset Demo Data */}
        <button
          onClick={handleReset}
          disabled={resetting}
          className="btn-secondary text-xs py-1.5 px-2.5 rounded-xl text-slate-300 hover:text-white"
          title={isAr ? 'إعادة ضبط البيانات التجريبية' : 'Réinitialiser Données Démo'}
        >
          <RefreshCw size={13} className={resetting ? 'animate-spin' : ''} />
          <span className="hidden xl:inline">{isAr ? 'بيانات تجريبية' : 'Démo'}</span>
        </button>

        {/* Alerts Bell */}
        <button
          onClick={() => setCurrentPage('alerts')}
          className="relative p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition text-slate-300 hover:text-white"
          title={isAr ? 'التنبيهات' : 'Alertes'}
        >
          <Bell size={18} />
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -end-1 min-w-4 h-4 px-1 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadAlerts}
            </span>
          )}
        </button>

        {/* Language switch */}
        <button
          onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/70 text-xs font-semibold text-slate-200 transition"
        >
          <Globe size={13} className="text-purple-400" />
          <span>{lang === 'ar' ? 'Français' : 'العربية'}</span>
        </button>

        {/* Live System Status Dot */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-semibold">
            {isAr ? 'Webhook نشط' : 'Webhook Actif'}
          </span>
        </div>
      </div>
    </header>
  );
}
