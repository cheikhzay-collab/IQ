'use client';
import React, { useState, useEffect, useCallback } from 'react';
import type { Lang } from '@/app/page';
import { MessageSquare, Send, Clock, CheckCircle, XCircle, RefreshCw, Bot } from 'lucide-react';

interface Props { lang: Lang; }

const t = {
  ar: {
    title: 'رسائل واتساب',
    pending: 'في الانتظار',
    sent: 'مُرسلة',
    failed: 'فاشلة',
    all: 'الكل',
    noMessages: 'لا توجد رسائل',
    send: 'إرسال',
    sending: 'جاري الإرسال...',
    client: 'الزبون',
    message: 'الرسالة',
    time: 'الوقت',
    status: 'الحالة',
    generatedBy: 'أُنشئت بـ',
    refresh: 'تحديث',
  },
  fr: {
    title: 'Messages WhatsApp',
    pending: 'En attente',
    sent: 'Envoyés',
    failed: 'Échoués',
    all: 'Tous',
    noMessages: 'Aucun message',
    send: 'Envoyer',
    sending: 'Envoi...',
    client: 'Client',
    message: 'Message',
    time: 'Heure',
    status: 'Statut',
    generatedBy: 'Généré par',
    refresh: 'Actualiser',
  },
};

export default function MessagesPanel({ lang }: Props) {
  const tr = t[lang];
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<number | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    try {
      const res = await fetch(`/api/messages${params}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleSend = async (msg: any) => {
    setSendingId(msg.id);
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', messageId: msg.id }),
    });
    setSendingId(null);
    fetchMessages();
  };

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleString(lang === 'ar' ? 'ar-MA' : 'fr-MA', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    }) : '—';

  const tabs = [
    { value: '', label: tr.all },
    { value: 'pending', label: tr.pending },
    { value: 'sent', label: tr.sent },
    { value: 'failed', label: tr.failed },
  ];

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <MessageSquare size={18} className="text-green-400" />
            </div>
            <h2 className="font-bold text-white">{tr.title}</h2>
          </div>
          <button onClick={fetchMessages} className="btn-secondary text-sm py-1.5">
            <RefreshCw size={14} />
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                filter === tab.value
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
          <RefreshCw className="animate-spin" size={18} />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-2">
          <MessageSquare size={36} className="text-gray-700" />
          <span>{tr.noMessages}</span>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg: any) => (
            <div key={msg.id} className="card hover:border-green-500/20 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {msg.status === 'sent' ? <CheckCircle size={18} className="text-green-400 mt-0.5" /> :
                   msg.status === 'failed' ? <XCircle size={18} className="text-red-400 mt-0.5" /> :
                   <Clock size={18} className="text-amber-400 mt-0.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-gray-200 text-sm">{msg.client_name || msg.client_phone}</span>
                    {msg.tracking && <span className="font-mono text-xs text-cyan-400">{msg.tracking}</span>}
                    {msg.generated_by === 'ai' && (
                      <span className="badge badge-purple flex items-center gap-1"><Bot size={10} /> AI</span>
                    )}
                    <span className={`badge ${
                      msg.status === 'sent' ? 'badge-success' :
                      msg.status === 'failed' ? 'badge-danger' : 'badge-warning'
                    }`}>{tr[msg.status as keyof typeof tr] || msg.status}</span>
                  </div>

                  {/* Message text */}
                  <div className="bg-gray-800/60 rounded-xl p-3 text-sm text-gray-300 leading-relaxed border border-gray-700/50">
                    {msg.message_text}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{formatDate(msg.sent_at || msg.created_at)}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span dir="ltr">{msg.client_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Send button for pending */}
                {msg.status === 'pending' && (
                  <button
                    onClick={() => handleSend(msg)}
                    disabled={sendingId === msg.id}
                    className="btn-success text-sm py-2 flex-shrink-0"
                  >
                    {sendingId === msg.id ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    {sendingId === msg.id ? tr.sending : tr.send}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
