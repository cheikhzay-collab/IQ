'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import OrdersList from '@/components/OrdersList';
import AlertsPanel from '@/components/AlertsPanel';
import MessagesPanel from '@/components/MessagesPanel';
import AIChat from '@/components/AIChat';
import SettingsPanel from '@/components/SettingsPanel';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import WebhookSimulatorModal from '@/components/WebhookSimulatorModal';
import { Loader2 } from 'lucide-react';

export type Lang = 'ar' | 'fr';
export type Page = 'dashboard' | 'orders' | 'alerts' | 'messages' | 'ai' | 'settings';

export default function HomePage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [lang, setLang] = useState<Lang>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Sync document HTML dir attribute on language change
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Load and apply theme
  useEffect(() => {
    const savedTheme = (localStorage.getItem('deliveryiq_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('deliveryiq_theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  // Auth Verification
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.replace('/login');
          return;
        }
        const data = await res.json();
        if (isMounted) {
          setUser(data.user);
          setAuthLoading(false);
        }
      } catch (err) {
        router.replace('/login');
      }
    }
    checkAuth();
    return () => { isMounted = false; };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    router.replace('/login');
  };

  const fetchUnreadAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts?unread=true');
      const data = await res.json();
      setUnreadAlerts(data.unreadCount || 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    fetchUnreadAlerts();
    const interval = setInterval(fetchUnreadAlerts, 20000);
    return () => clearInterval(interval);
  }, [authLoading, fetchUnreadAlerts]);

  const handleResetData = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      fetchUnreadAlerts();
      window.location.reload();
    } catch { /* ignore */ }
  };

  if (authLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#070b14] text-slate-200">
        <Loader2 size={36} className="text-purple-500 animate-spin mb-3" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">
          جاري التحقق من الصلاحيات...
        </p>
      </div>
    );
  }

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
          theme={theme}
          onToggleTheme={toggleTheme}
          user={user}
          onLogout={handleLogout}
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

