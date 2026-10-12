'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from '@/components/Dashboard';
import OrdersList from '@/components/OrdersList';
import AlertsPanel from '@/components/AlertsPanel';
import MessagesPanel from '@/components/MessagesPanel';
import AIChat from '@/components/AIChat';
import SettingsPanel from '@/components/SettingsPanel';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import WebhookSimulatorModal from '@/components/WebhookSimulatorModal';

export type Lang = 'ar' | 'fr';
export type Page = 'dashboard' | 'orders' | 'alerts' | 'messages' | 'ai' | 'settings';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [lang, setLang] = useState<Lang>('ar');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Sync document HTML dir attribute on language change
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const fetchUnreadAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts?unread=true');
      const data = await res.json();
      setUnreadAlerts(data.unreadCount || 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchUnreadAlerts();
    const interval = setInterval(fetchUnreadAlerts, 20000);
    return () => clearInterval(interval);
  }, [fetchUnreadAlerts]);

  const handleResetData = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      fetchUnreadAlerts();
      // force reload component data by toggling state or event
      window.location.reload();
    } catch { /* ignore */ }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': 
        return (
          <Dashboard 
            lang={lang} 
            onNavigateToOrders={() => setCurrentPage('orders')}
          />
        );
      case 'orders': 
        return (
          <OrdersList 
            lang={lang} 
            onOpenSimulator={() => setSimulatorOpen(true)}
          />
        );
      case 'alerts': 
        return (
          <AlertsPanel 
            lang={lang} 
            onAlertsRead={fetchUnreadAlerts} 
          />
        );
      case 'messages': 
        return <MessagesPanel lang={lang} />;
      case 'ai': 
        return <AIChat lang={lang} />;
      case 'settings': 
        return <SettingsPanel lang={lang} />;
      default: 
        return <Dashboard lang={lang} />;
    }
  };

  return (
    <div 
      className="flex flex-row w-screen min-w-full h-screen overflow-hidden bg-[#070b14] text-slate-100"
      style={{
        direction: lang === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {/* Desktop & Mobile Responsive Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={(p) => { setCurrentPage(p); setSidebarOpen(false); }}
        lang={lang}
        isOpen={sidebarOpen}
        unreadAlerts={unreadAlerts}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full h-screen overflow-hidden bg-[#070b14]">
        <TopBar
          lang={lang}
          setLang={setLang}
          currentPage={currentPage}
          setSidebarOpen={setSidebarOpen}
          unreadAlerts={unreadAlerts}
          setCurrentPage={setCurrentPage}
          onOpenSimulator={() => setSimulatorOpen(true)}
          onResetData={handleResetData}
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 w-full">
          {renderPage()}
        </main>
      </div>

      {/* Webhook Simulator Modal */}
      <WebhookSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        lang={lang}
        onSuccess={() => {
          fetchUnreadAlerts();
        }}
      />
    </div>
  );
}
