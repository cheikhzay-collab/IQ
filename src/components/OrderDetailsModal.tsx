'use client';
import React, { useState } from 'react';
import type { Lang } from '@/app/page';
import { 
  X, Phone, MapPin, Calendar, Clock, AlertTriangle, 
  Bot, Send, CheckCircle2, History, MessageSquare, RefreshCw
} from 'lucide-react';

interface Props {
  order: any;
  onClose: () => void;
  lang: Lang;
  onOrderUpdated?: () => void;
}

export default function OrderDetailsModal({ order, onClose, lang, onOrderUpdated }: Props) {
  const isAr = lang === 'ar';
  const [aiMessage, setAiMessage] = useState(order?.notes || '');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!order) return null;

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', orderId: order.id, language: lang }),
      });
      const data = await res.json();
      if (data.message) {
        setAiMessage(data.message);
      }
    } catch { /* ignore */ }
    setGenerating(false);
  };

  const handleSendWA = async () => {
    if (!aiMessage) return;
    setSending(true);
    try {
      const createRes = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', orderId: order.id, language: lang, messageText: aiMessage }),
      });
      const { messageId } = await createRes.json();

      const sendRes = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', messageId, messageText: aiMessage }),
      });
      const data = await sendRes.json();
      if (data.success) {
        setSentSuccess(true);
        if (onOrderUpdated) onOrderUpdated();
        setTimeout(() => setSentSuccess(false), 3000);
      }
    } catch { /* ignore */ }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-up">
      <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">{order.tracking}</h3>
                <span className={`badge ${
                  order.status === 'Livré' ? 'badge-success' :
                  order.status === 'Refusé' ? 'badge-danger' :
                  order.status === 'Reporté' ? 'badge-warning' :
                  'badge-info'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr ? 'الزبون:' : 'Client:'} <span className="text-slate-200 font-medium">{order.client_name}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">{isAr ? 'المدينة' : 'Ville'}</span>
              <span className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                <MapPin size={14} className="text-purple-400" />
                {order.city}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">{isAr ? 'الهاتف' : 'Téléphone'}</span>
              <span className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                <Phone size={14} className="text-emerald-400" />
                {order.client_phone}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">{isAr ? 'المحاولات' : 'Tentatives'}</span>
              <span className="font-semibold text-amber-400 text-sm flex items-center gap-1.5">
                <History size={14} />
                {order.attempt_count} {isAr ? 'محاولات' : 'fois'}
              </span>
            </div>
          </div>

          {/* Risk Level Banner */}
          <div className={`p-3 rounded-xl flex items-center justify-between border ${
            order.risk_level === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
            order.risk_level === 'high' ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' :
            order.risk_level === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
            'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span className="text-xs font-semibold">
                {isAr ? 'مستوى خطورة عدم التسليم:' : 'Risque de non-livraison:'} {order.risk_level?.toUpperCase()}
              </span>
            </div>
            <span className="text-xs opacity-80">
              {order.risk_level === 'critical' ? (isAr ? 'يتطلب تدخلاً فورياً' : 'Action urgente') :
               order.risk_level === 'high' ? (isAr ? 'متابعة قريبة' : 'Suivi proche') :
               (isAr ? 'حالة مستقرة' : 'Stable')}
            </span>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="p-3.5 rounded-xl bg-slate-900/30 border border-slate-800/80">
              <h4 className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-purple-400" />
                {isAr ? 'ملاحظات الموزع / السجل:' : 'Notes de livraison:'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">{order.notes}</p>
            </div>
          )}

          {/* WhatsApp / Gemini AI Interaction */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-purple-400" />
                <h4 className="text-xs font-bold text-purple-200">
                  {isAr ? 'رسالة واتساب مخصصة (مدعومة بـ Gemini)' : 'Message WhatsApp IA (Gemini)'}
                </h4>
              </div>
              <button 
                onClick={handleGenerateAI}
                disabled={generating}
                className="text-xs px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 flex items-center gap-1 transition"
              >
                {generating ? <RefreshCw size={11} className="animate-spin" /> : <Bot size={11} />}
                {isAr ? 'توليد بالذكاء الاصطناعي' : 'Générer avec IA'}
              </button>
            </div>

            <textarea
              className="input text-xs resize-none h-24 text-slate-200 leading-relaxed"
              value={aiMessage}
              onChange={e => setAiMessage(e.target.value)}
              placeholder={isAr ? 'اكتب رسالة أو اضغط على توليد بالذكاء الاصطناعي...' : 'Écrivez ou générez avec Gemini...'}
            />

            <div className="flex items-center justify-between pt-1">
              {sentSuccess ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> {isAr ? 'تم إرسال الرسالة للزبون بنجاح!' : 'Message envoyé avec succès!'}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  {isAr ? 'يتم الإرسال عبر Meta WhatsApp Cloud API' : 'Envoi via Meta WhatsApp API'}
                </span>
              )}

              <button
                onClick={handleSendWA}
                disabled={sending || !aiMessage}
                className="btn-success text-xs py-1.5 px-3.5"
              >
                {sending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                <span>{isAr ? 'إرسال عبر WhatsApp' : 'Envoyer WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-end flex-shrink-0">
          <button onClick={onClose} className="btn-secondary text-xs">
            {isAr ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
}
