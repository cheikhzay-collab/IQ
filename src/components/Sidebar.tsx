'use client';
import React from 'react';
import type { Lang, Page } from '@/app/page';
import {
  LayoutDashboard, Package, Bell, MessageSquare,
  Bot, Settings, Zap, Sparkles, TrendingUp
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (p: Page) => void;
  lang: Lang;
  isOpen: boolean;
  unreadAlerts: number;
}

const t = {
  ar: {
    brand: 'DeliveryIQ',
    badge: 'Pro AI',
    subtitle: 'إدارة التوصيل ورفع التسليم',
    dashboard: 'لوحة التحكم',
    orders: 'الطلبات والطرود',
    alerts: 'مركز التنبيهات',
    messages: 'رسائل واتساب',
    ai: 'مساعد Gemini AI',
    settings: 'الربط والإعدادات',
    poweredTitle: 'ذكاء اصطناعي متكامل',
    poweredDesc: 'Gemini 1.5 + WhatsApp Meta',
  },
  fr: {
    brand: 'DeliveryIQ',
    badge: 'Pro AI',
    subtitle: 'Optimisation de Livraison',
    dashboard: 'Tableau de bord',
    orders: 'Gestion des colis',
    alerts: 'Alertes & Risques',
    messages: 'Messages WhatsApp',
    ai: 'Assistant Gemini AI',
    settings: 'Intégrations & Config',
    poweredTitle: 'IA Multimodale Intégrée',
    poweredDesc: 'Gemini 1.5 + WhatsApp Meta',
  },
};

const navItems: { id: Page; icon: React.ElementType; labelKey: keyof typeof t.ar; countBadge?: boolean }[] = [
  { id: 'dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { id: 'orders', icon: Package, labelKey: 'orders' },
  { id: 'alerts', icon: Bell, labelKey: 'alerts', countBadge: true },
  { id: 'messages', icon: MessageSquare, labelKey: 'messages' },
  { id: 'ai', icon: Bot, labelKey: 'ai' },
  { id: 'settings', icon: Settings, labelKey: 'settings' },
];

export default function Sidebar({ currentPage, setCurrentPage, lang, isOpen, unreadAlerts }: SidebarProps) {
  const tr = t[lang];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className="hidden lg:flex flex-col flex-shrink-0 h-screen w-64 bg-[#0a0f1d] border-inline-end border-slate-800/80 overflow-hidden select-none z-20"
        style={{
          borderInlineEnd: '1px solid rgba(30, 41, 59, 0.8)',
        }}
      >
        <SidebarContent 
          tr={tr} 
          navItems={navItems} 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          unreadAlerts={unreadAlerts} 
        />
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setCurrentPage(currentPage)}
          />
          <aside 
            className="relative z-51 flex flex-col w-72 max-w-[85vw] h-screen bg-[#0a0f1d] border-inline-end border-slate-800 shadow-2xl overflow-hidden"
          >
            <SidebarContent 
              tr={tr} 
              navItems={navItems} 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              unreadAlerts={unreadAlerts} 
            />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarContent({ tr, navItems, currentPage, setCurrentPage, unreadAlerts }: any) {
  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-900/40 relative">
              <Zap size={22} className="text-white fill-white/20" />
              <div className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-[#0a0f1d]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg text-white tracking-tight">{tr.brand}</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {tr.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                {tr.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3.5 space-y-1.5 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, labelKey, countBadge }: any) => {
            const isActive = currentPage === id;
            const showBadge = countBadge && unreadAlerts > 0;

            return (
              <button
                key={id}
                onClick={() => setCurrentPage(id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-start group ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600/25 to-indigo-600/15 text-white border border-purple-500/35 shadow-sm shadow-purple-900/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-purple-600 text-white' : 'text-slate-400 group-hover:text-purple-300 group-hover:bg-slate-800'
                }`}>
                  <Icon size={17} />
                </div>
                <span className="flex-1 font-semibold text-xs tracking-wide">{tr[labelKey]}</span>
                {showBadge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full shadow-sm animate-pulse">
                    {unreadAlerts}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/20">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-950/40 to-slate-900/60 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} className="text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h4 className="text-xs font-bold text-purple-200">{tr.poweredTitle}</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {tr.poweredDesc}
          </p>
          <div className="mt-2.5 pt-2 border-t border-purple-500/15 flex items-center justify-between text-[10px] text-slate-400">
            <span>Sendit Webhook</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
              API V2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
