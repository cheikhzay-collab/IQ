'use client';
import React, { useState, useEffect } from 'react';
import type { Lang } from '@/app/page';
import { 
  Settings, Save, Eye, EyeOff, Key, Phone, Bot, Bell, CheckCircle, 
  Copy, ShieldCheck, Zap, AlertCircle, RefreshCw, ExternalLink
} from 'lucide-react';

interface Props { lang: Lang; }

const t = {
  ar: {
    title: 'الإعدادات والربط التقني',
    senditSection: '📦 ربط منصة التوصيل Sendit (Accès Développeur)',
    senditDesc: 'تم إعداد المفاتيح الخاصة بحساب Sendit الخاص بك (GAMA)',
    libelle: 'اسم الحساب (Libellé)',
    publicKey: 'المفتاح العام (Clé publique)',
    privateKey: 'المفتاح الخاص (Clé privé / Secret)',
    webhookUrl: 'رابط استلام الـ Webhook الفوري',
    webhookUrlDesc: 'انسخ هذا الرابط وضعه في إعدادات Webhook داخل حساب Sendit',
    webhookStatus: 'حالة الربط',
    webhookStatusReady: 'المفاتيح مفعلة والمنصة جاهزة لاستقبال الطرود',
    testWebhook: 'إرسال اختبار فوري للربط',
    testingWebhook: 'جارٍ الاختبار...',
    testSuccess: '✅ تم استلام الـ Webhook وتحديث الطرود بنجاح!',
    aiSection: '🤖 إعدادات الذكاء الاصطناعي (Google Gemini)',
    geminiKey: 'مفتاح Gemini API',
    waSection: '📱 إعدادات WhatsApp Cloud API',
    phoneNumberId: 'Phone Number ID',
    accessToken: 'Access Token',
    verifyToken: 'Verify Token',
    autoSend: 'إرسال تلقائي لرسائل WhatsApp بالـ AI',
    autoSendDesc: 'إرسال فوري لاسترجاع الزبائن عند تأجيل أو رفض الطرد',
    defaultLang: 'اللغة الافتراضية للرسائل',
    save: 'حفظ الإعدادات',
    saved: '✅ تم حفظ جميع الإعدادات بنجاح',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    show: 'عرض المفاتيح',
    hide: 'إخفاء المفاتيح',
    alertsSection: '🔔 تنبيهات الخطورة اللوجستية',
    criticalThreshold: 'عدد المحاولات الفاشلة لإطلاق تنبيه حرج',
    notesSection: '📝 تعليمات ربط Sendit Webhook',
    notesText: `1. توجه إلى لوحة تحكم Sendit (app.sendit.ma) > Paramètres > Webhooks.
2. ضع رابط Webhook الخاص بك أعلاه.
3. عند تحديث حالة أي طرد (Livré, Reporté, Refusé, En cours)، ستستقبل المنصة الإشعار فورياً وتقوم بتحليله عبر الذكاء الاصطناعي.
4. إذا كنت تعمل محلياً (Localhost)، استخدم أداة مثل Ngrok أو Cloudflare Tunnel لتمرير رابط عام لـ Sendit.`,
  },
  fr: {
    title: 'Paramètres & Intégrations',
    senditSection: '📦 Intégration Sendit (Accès Développeur)',
    senditDesc: 'Configuration de vos accès API développeur Sendit (GAMA)',
    libelle: 'Libellé du compte',
    publicKey: 'Clé publique',
    privateKey: 'Clé privé (Secret)',
    webhookUrl: 'URL Webhook de Réception Instantanée',
    webhookUrlDesc: 'Copiez cette URL et collez-la dans les paramètres Webhook de Sendit',
    webhookStatus: 'Statut de l\'intégration',
    webhookStatusReady: 'Clés configurées, prêt à recevoir les colis Sendit',
    testWebhook: 'Tester la liaison Webhook',
    testingWebhook: 'Test en cours...',
    testSuccess: '✅ Webhook testé et validé avec succès!',
    aiSection: '🤖 Paramètres Intelligence Artificielle (Gemini)',
    geminiKey: 'Clé API Gemini',
    waSection: '📱 Configuration WhatsApp Cloud API',
    phoneNumberId: 'Phone Number ID',
    accessToken: 'Access Token',
    verifyToken: 'Verify Token',
    autoSend: 'Envoi automatique WhatsApp par l\'IA',
    autoSendDesc: 'Envoi automatique pour récupérer les colis reportés ou refusés',
    defaultLang: 'Langue par défaut des messages',
    save: 'Enregistrer les paramètres',
    saved: '✅ Paramètres enregistrés avec succès',
    copy: 'Copier',
    copied: 'Copié!',
    show: 'Afficher les clés',
    hide: 'Masquer les clés',
    alertsSection: '🔔 Alertes Logistiques',
    criticalThreshold: 'Tentatives pour alerte critique',
    notesSection: '📝 Guide de liaison Sendit Webhook',
    notesText: `1. Accédez à app.sendit.ma > Paramètres > Webhooks.
2. Renseignez l'URL Webhook ci-dessus.
3. Dès qu'un colis change de statut (Livré, Reporté, Refusé, En cours), DeliveryIQ met à jour le tableau de bord et active l'IA.
4. En local, utilisez un tunnel public comme Ngrok pour que Sendit puisse envoyer les requêtes.`,
  },
};

export default function SettingsPanel({ lang }: Props) {
  const tr = t[lang];
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTokens, setShowTokens] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    senditLibelle: 'GAMA',
    senditPublicKey: '3d4232babb11df9a39165b4fcaf88057',
    senditPrivateKey: 'RzRVrol6hv3OHMmcaYDPzBI2KianmSZQ',
    webhookSecret: 'RzRVrol6hv3OHMmcaYDPzBI2KianmSZQ',
    geminiKey: '',
    waPhoneId: '',
    waToken: '',
    waVerifyToken: 'deliveryiq_verify_2024',
    autoSend: false,
    defaultLang: lang,
    criticalThreshold: '3',
  });

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhook/sendit`
    : 'https://your-domain.com/api/webhook/sendit';

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings(prev => ({
            ...prev,
            ...data,
            senditLibelle: data.senditLibelle || 'GAMA',
            senditPublicKey: data.senditPublicKey || '3d4232babb11df9a39165b4fcaf88057',
            senditPrivateKey: data.senditPrivateKey || 'RzRVrol6hv3OHMmcaYDPzBI2KianmSZQ',
            webhookSecret: data.webhookSecret || 'RzRVrol6hv3OHMmcaYDPzBI2KianmSZQ',
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestWebhook = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const testPayload = {
        colis_id: `SD-${Math.floor(100000 + Math.random() * 900000)}`,
        tracking: `TRK-GAMA-${Math.floor(1000 + Math.random() * 9000)}`,
        client_name: 'أحمد الإدريسي (تجربة Sendit)',
        client_phone: '0661234567',
        city: 'الدار البيضاء',
        status: 'Reporté',
        previous_status: 'En cours de livraison',
        note: 'تم تأجيل التوصيل بطلب من الزبون إلى الغد',
      };

      const res = await fetch('/api/webhook/sendit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sendit-key': settings.senditPublicKey,
        },
        body: JSON.stringify(testPayload),
      });

      if (res.ok) {
        setTestResult(tr.testSuccess);
      } else {
        setTestResult('Erreur: ' + res.status);
      }
    } catch (err: any) {
      setTestResult('Erreur: ' + err.message);
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  const Field = ({ label, value, onChange, type = 'text', hint = '', canCopy = false, copyId = '' }: any) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-semibold text-slate-300">{label}</label>
        {canCopy && (
          <button 
            type="button" 
            onClick={() => handleCopy(value, copyId)} 
            className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
          >
            {copiedKey === copyId ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copiedKey === copyId ? tr.copied : tr.copy}
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type={type === 'password' ? (showTokens ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input text-xs font-mono"
          dir="ltr"
        />
      </div>
      {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl animate-fade-up pb-12">
      {/* Sendit Integration Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/50 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-900/30">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">{tr.senditSection}</h3>
              <span className="badge badge-success text-[10px] font-bold">
                {settings.senditLibelle}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{tr.webhookStatusReady}</p>
          </div>
        </div>
        <button
          onClick={() => setShowTokens(!showTokens)}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 self-end sm:self-auto"
        >
          {showTokens ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{showTokens ? tr.hide : tr.show}</span>
        </button>
      </div>

      {/* Sendit Credentials Box */}
      <div className="card space-y-4 border-slate-800 bg-[#0d1322]/80">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Key size={16} className="text-cyan-400" />
            <span>بيانات الربط مع Sendit (API Credentials)</span>
          </h4>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
            Compte Actif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={tr.libelle}
            value={settings.senditLibelle}
            onChange={(v: string) => setSettings(s => ({ ...s, senditLibelle: v }))}
            canCopy={true}
            copyId="libelle"
          />

          <Field
            label={tr.publicKey}
            value={settings.senditPublicKey}
            onChange={(v: string) => setSettings(s => ({ ...s, senditPublicKey: v }))}
            canCopy={true}
            copyId="pub"
          />
        </div>

        <Field
          label={tr.privateKey}
          value={settings.senditPrivateKey}
          onChange={(v: string) => setSettings(s => ({ ...s, senditPrivateKey: v, webhookSecret: v }))}
          type="password"
          canCopy={true}
          copyId="priv"
          hint="تُستخدم للتحقق من مصادقة الـ Webhooks والتواصل المشفر مع خوادم Sendit"
        />

        {/* Webhook Endpoint Box */}
        <div className="pt-2 border-t border-slate-800/60">
          <label className="block text-xs font-semibold text-slate-300 mb-1">{tr.webhookUrl}</label>
          <p className="text-[11px] text-slate-400 mb-2">{tr.webhookUrlDesc}</p>
          <div className="flex gap-2">
            <input 
              value={webhookUrl} 
              readOnly 
              className="input text-xs font-mono flex-1 bg-slate-950/70 border-slate-700 text-purple-300" 
              dir="ltr" 
            />
            <button 
              onClick={() => handleCopy(webhookUrl, 'webhookUrl')} 
              className="btn-primary text-xs py-2 px-3 flex-shrink-0"
            >
              {copiedKey === 'webhookUrl' ? <CheckCircle size={14} className="text-white" /> : <Copy size={14} />}
              {copiedKey === 'webhookUrl' ? tr.copied : tr.copy}
            </button>
          </div>
        </div>

        {/* Test Webhook Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-purple-950/20 p-3 rounded-xl border border-purple-500/20">
          <div>
            <p className="text-xs font-bold text-purple-200">اختبار استقبال الـ Webhook</p>
            <p className="text-[11px] text-slate-400">إرسال محاكاة طرد لتجربة التحديث التلقائي والذكاء الاصطناعي</p>
          </div>
          <button
            onClick={handleTestWebhook}
            disabled={testing}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-purple-300 border-purple-500/30 hover:bg-purple-900/40"
          >
            {testing ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} className="text-yellow-400" />}
            <span>{testing ? tr.testingWebhook : tr.testWebhook}</span>
          </button>
        </div>

        {testResult && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fade-up">
            {testResult}
          </div>
        )}
      </div>

      {/* AI Section */}
      <div className="card space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Bot size={16} className="text-purple-400" />
          {tr.aiSection}
        </h3>
        <Field
          label={tr.geminiKey}
          value={settings.geminiKey}
          onChange={(v: string) => setSettings(s => ({ ...s, geminiKey: v }))}
          type="password"
          hint="مفتاح الذكاء الاصطناعي المجاني لتحليل مؤشرات الطرود وتوليد رسائل الواتساب الذكية (aistudio.google.com)"
        />
      </div>

      {/* WhatsApp Section */}
      <div className="card space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Phone size={16} className="text-green-400" />
          {tr.waSection}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={tr.phoneNumberId}
            value={settings.waPhoneId}
            onChange={(v: string) => setSettings(s => ({ ...s, waPhoneId: v }))}
            type="password"
            hint="معرف هاتف واتساب على منصة Meta"
          />
          <Field
            label={tr.accessToken}
            value={settings.waToken}
            onChange={(v: string) => setSettings(s => ({ ...s, waToken: v }))}
            type="password"
            hint="رمز الوصول الدائم (System User Token)"
          />
        </div>

        {/* Auto send toggle */}
        <div className="flex items-center justify-between p-3.5 bg-slate-900/70 rounded-xl border border-slate-800">
          <div>
            <p className="text-xs font-bold text-slate-200">{tr.autoSend}</p>
            <p className="text-[11px] text-slate-400">{tr.autoSendDesc}</p>
          </div>
          <button
            type="button"
            onClick={() => setSettings(s => ({ ...s, autoSend: !s.autoSend }))}
            className={`w-11 h-6 rounded-full transition-all relative ${settings.autoSend ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.autoSend ? 'start-6' : 'start-1'}`} />
          </button>
        </div>
      </div>

      {/* Instructions / Notes */}
      <div className="card border-purple-500/25 bg-gradient-to-br from-purple-950/20 to-slate-900/40">
        <h4 className="font-bold text-purple-300 mb-2 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="text-purple-400" />
          {tr.notesSection}
        </h4>
        <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
          {tr.notesText}
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-fade-up">
            <CheckCircle size={15} />
            {tr.saved}
          </span>
        )}
        <button onClick={handleSave} className="btn-primary px-7 py-2.5 text-xs font-bold shadow-lg shadow-purple-900/40">
          <Save size={15} />
          <span>{tr.save}</span>
        </button>
      </div>
    </div>
  );
}
