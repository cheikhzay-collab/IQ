'use client';
import React, { useState } from 'react';
import type { Lang } from '@/app/page';
import { Zap, Send, X, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  onSuccess?: () => void;
}

export default function WebhookSimulatorModal({ isOpen, onClose, lang, onSuccess }: Props) {
  const [tracking, setTracking] = useState('SD-CAS-' + Math.floor(10000 + Math.random() * 90000));
  const [clientName, setClientName] = useState('حمزة البورقادي');
  const [clientPhone, setClientPhone] = useState('+212661234567');
  const [city, setCity] = useState('الدار البيضاء');
  const [status, setStatus] = useState('Reporté');
  const [attempts, setAttempts] = useState('2');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setLoading(true);
    setResult(null);

    const payload = {
      colis_id: tracking.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      tracking: tracking,
      client_name: clientName,
      client_phone: clientPhone,
      city: city,
      status: status,
      previous_status: 'En cours de livraison',
      attempt_count: parseInt(attempts) || 1,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/webhook/sendit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-up">
      <div className="bg-[#0e1626] border border-purple-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isAr ? 'محاكاة وصول Webhook من Sendit' : 'Simulateur Webhook Sendit'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'اختبر رد فعل المنصة والذكاء الاصطناعي وتوليد رسائل الواتساب' : 'Testez les alertes et messages IA en temps réel'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                {isAr ? 'رقم التتبع' : 'Tracking N°'}
              </label>
              <input 
                className="input text-sm" 
                value={tracking} 
                onChange={e => setTracking(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                {isAr ? 'اسم الزبون' : 'Nom Client'}
              </label>
              <input 
                className="input text-sm" 
                value={clientName} 
                onChange={e => setClientName(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                {isAr ? 'رقم الهاتف (WhatsApp)' : 'Téléphone'}
              </label>
              <input 
                className="input text-sm" 
                value={clientPhone} 
                onChange={e => setClientPhone(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                {isAr ? 'المدينة' : 'Ville'}
              </label>
              <select 
                className="input text-sm" 
                value={city} 
                onChange={e => setCity(e.target.value)}
              >
                <option value="الدار البيضاء">الدار البيضاء (Casablanca)</option>
                <option value="الرباط">الرباط (Rabat)</option>
                <option value="مراكش">مراكش (Marrakech)</option>
                <option value="طنجة">طنجة (Tanger)</option>
                <option value="فاس">فاس (Fès)</option>
                <option value="أكادير">أكادير (Agadir)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                {isAr ? 'الحالة الجديدة' : 'Nouveau Statut'}
              </label>
              <select 
                className="input text-sm" 
                value={status} 
                onChange={e => setStatus(e.target.value)}
              >
                <option value="Reporté">Reporté (مؤجّل)</option>
                <option value="Refusé">Refusé (مرفوض)</option>
                <option value="En cours de livraison">En cours (قيد التوصيل)</option>
                <option value="Livré">Livré (تم التسليم)</option>
                <option value="Retourné">Retourné (مُعاد)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                {isAr ? 'عدد المحاولات' : 'Tentatives'}
              </label>
              <select 
                className="input text-sm" 
                value={attempts} 
                onChange={e => setAttempts(e.target.value)}
              >
                <option value="1">1 محاولة</option>
                <option value="2">2 محاولات (High Risk)</option>
                <option value="3">3 محاولات (Critical)</option>
              </select>
            </div>
          </div>

          {result && (
            <div className={`p-3.5 rounded-xl text-xs space-y-1.5 ${result.error ? 'bg-red-500/10 border border-red-500/30 text-red-300' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'}`}>
              <div className="flex items-center gap-2 font-bold">
                {result.error ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
                <span>{result.error ? (isAr ? 'خطأ في المعالجة' : 'Erreur') : (isAr ? 'تم استقبال ومعالجة الـ Webhook بنجاح!' : 'Webhook traité avec succès!')}</span>
              </div>
              {!result.error && (
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <p>• {isAr ? 'مستوى الخطورة المحسوب:' : 'Niveau de risque:'} <span className="font-bold text-amber-400">{result.riskLevel}</span></p>
                  <p>• {isAr ? 'حالة رسالة الواتساب:' : 'Statut WhatsApp:'} <span className="font-bold text-emerald-400">{result.messageStatus}</span></p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/30 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary text-xs">
            {isAr ? 'إغلاق' : 'Fermer'}
          </button>
          <button 
            onClick={handleSimulate} 
            disabled={loading} 
            className="btn-primary text-xs"
          >
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            <span>{isAr ? 'إرسال الـ Webhook الآن' : 'Envoyer le Webhook'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
