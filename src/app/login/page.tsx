'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, Lock, Mail, Eye, EyeOff, ShieldCheck, 
  ArrowRight, ArrowLeft, Sun, Moon, Globe, CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'ar' | 'fr'>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Read saved theme
    const savedTheme = localStorage.getItem('deliveryiq_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }

    // Check if already authenticated
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.replace('/');
        }
      })
      .catch(() => {});
  }, [router]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('deliveryiq_theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.classList.toggle('light', next === 'light');
  };

  const handleFillDemo = () => {
    setEmail('admin@deliveryiq.com');
    setPassword('admin123456');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(lang === 'ar' ? 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' : 'Veuillez saisir l\'email et le mot de passe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || (lang === 'ar' ? 'فشل تسجيل الدخول' : 'Échec de connexion'));
      } else {
        router.replace('/');
      }
    } catch {
      setError(lang === 'ar' ? 'تعذر الاتصال بالخادم' : 'Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  const isAr = lang === 'ar';

  return (
    <div 
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-[#070b14] text-slate-100' 
          : 'bg-slate-50 text-slate-800'
      }`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Bar for Switchers */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Zap size={22} className="text-white fill-white/20" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight">DeliveryIQ</h1>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
              {isAr ? 'منصة ذكاء التوصيل' : 'Delivery Intelligence'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700/70 text-amber-400 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-indigo-600 shadow-sm hover:bg-slate-100'
            }`}
            title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الداكن'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Lang Switcher */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700/70 text-slate-200 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-100'
            }`}
          >
            <Globe size={14} className="text-purple-500" />
            <span>{isAr ? 'Français' : 'العربية'}</span>
          </button>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border transition-all shadow-2xl relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#0d1322]/90 border-slate-800/90 shadow-purple-950/20'
            : 'bg-white border-slate-200/80 shadow-slate-200/60'
        }`}>
          {/* Ambient Glow */}
          <div className="absolute -top-24 -end-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -start-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-6 relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30 mb-3">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {isAr ? 'تسجيل دخول المدير' : 'Connexion Administrateur'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {isAr 
                ? 'لوحة إدارة وتتبع الطرود ورفع نسبة التسليم بالـ AI' 
                : 'Portail d\'optimisation logistique et IA multimodale'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 animate-fade-up">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-400">
                {isAr ? 'البريد الإلكتروني' : 'Adresse Email'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@deliveryiq.com"
                  className={`w-full py-2.5 px-3.5 ps-10 rounded-xl text-sm font-medium border outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-900/80 border-slate-700/80 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                  }`}
                  dir="ltr"
                  required
                />
                <Mail size={16} className="absolute start-3 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-400">
                {isAr ? 'كلمة المرور' : 'Mot de passe'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full py-2.5 px-3.5 ps-10 pe-10 rounded-xl text-sm font-medium border outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-900/80 border-slate-700/80 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                  }`}
                  dir="ltr"
                  required
                />
                <Lock size={16} className="absolute start-3 top-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>{isAr ? 'جارٍ التحقق...' : 'Vérification...'}</span>
              ) : (
                <>
                  <span>{isAr ? 'دخول لوحة التحكم' : 'Accéder au Tableau de Bord'}</span>
                  {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Card */}
          <div className={`mt-6 pt-5 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
              theme === 'dark'
                ? 'bg-slate-900/50 border-purple-500/20'
                : 'bg-purple-50/60 border-purple-200/60'
            }`}>
              <div>
                <p className="text-[11px] font-bold text-purple-400">
                  {isAr ? 'بيانات حساب المدير الافتراضي' : 'Identifiants Administrateur'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  admin@deliveryiq.com / admin123456
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition flex items-center gap-1 flex-shrink-0"
              >
                <CheckCircle2 size={13} />
                <span>{isAr ? 'تعبئة سريعة' : 'Remplir'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500">
        DeliveryIQ &copy; {new Date().getFullYear()} — Sendit Webhook & AI Logistic Optimization
      </footer>
    </div>
  );
}
