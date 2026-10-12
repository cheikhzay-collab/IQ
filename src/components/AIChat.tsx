'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { Lang } from '@/app/page';
import { Bot, Send, RefreshCw, User, Sparkles } from 'lucide-react';

interface Props { lang: Lang; }
interface Message { role: 'user' | 'ai'; text: string; time: Date; }

const t = {
  ar: {
    title: 'المساعد الذكي',
    subtitle: 'اسألني عن طلباتك وإحصائياتك',
    placeholder: 'اسأل سؤالاً... مثل: كم طلب مرفوض اليوم؟',
    send: 'إرسال',
    thinking: 'يفكر...',
    suggestions: [
      'كم طلب مرفوض اليوم؟',
      'ما هي المدن الأكثر إشكالية؟',
      'أعطني تقريراً عن نسبة التسليم',
      'كم طلب حرج يحتاج تدخل؟',
    ],
    welcome: 'مرحباً! أنا مساعدك الذكي لإدارة التوصيل. يمكنني تحليل بيانات طلباتك والإجابة على أسئلتك. كيف يمكنني مساعدتك؟ 🚀',
  },
  fr: {
    title: 'Assistant IA',
    subtitle: 'Posez des questions sur vos colis et statistiques',
    placeholder: 'Posez une question... ex: Combien de colis refusés aujourd\'hui?',
    send: 'Envoyer',
    thinking: 'En réflexion...',
    suggestions: [
      'Combien de colis refusés aujourd\'hui?',
      'Quelles sont les villes les plus problématiques?',
      'Donne-moi un rapport sur le taux de livraison',
      'Combien de colis critiques nécessitent une intervention?',
    ],
    welcome: 'Bonjour! Je suis votre assistant intelligent pour la gestion de livraison. Je peux analyser vos données et répondre à vos questions. Comment puis-je vous aider? 🚀',
  },
};

export default function AIChat({ lang }: Props) {
  const tr = t[lang];
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: tr.welcome, time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset welcome message when language changes
  useEffect(() => {
    setMessages([{ role: 'ai', text: tr.welcome, time: new Date() }]);
  }, [lang]);

  const sendMessage = async (text?: string) => {
    const question = text || input.trim();
    if (!question || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question, time: new Date() }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, language: lang }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.answer, time: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: lang === 'ar' ? 'عذراً، حدث خطأ. حاول مرة أخرى.' : 'Désolé, une erreur s\'est produite.',
        time: new Date()
      }]);
    }
    setLoading(false);
  };

  const formatTime = (d: Date) => d.toLocaleTimeString(lang === 'ar' ? 'ar-MA' : 'fr-MA', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-up">
      {/* Header */}
      <div className="card mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-900/50">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-white">{tr.title}</h2>
          <p className="text-xs text-gray-400">{tr.subtitle}</p>
        </div>
        <div className="ms-auto flex items-center gap-1.5 px-3 py-1 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">Gemini Pro</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1">
        {/* Suggestions (only at start) */}
        {messages.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tr.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="text-start p-3 rounded-xl bg-gray-800/60 border border-gray-700/50 hover:border-purple-500/40 text-sm text-gray-400 hover:text-gray-200 transition-all flex items-center gap-2"
              >
                <Sparkles size={13} className="text-purple-400 flex-shrink-0" />
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
              <div className="flex items-end gap-2">
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center flex-shrink-0 mb-1">
                    <Bot size={13} className="text-white" />
                  </div>
                )}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-violet-700 text-white rounded-ee-sm'
                    : 'bg-gray-800/80 text-gray-200 border border-gray-700/50 rounded-es-sm'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                    {formatTime(msg.time)}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mb-1">
                    <User size={13} className="text-gray-300" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center">
              <Bot size={13} className="text-white" />
            </div>
            <div className="bg-gray-800/80 border border-gray-700/50 px-4 py-3 rounded-2xl rounded-es-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="card">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={tr.placeholder}
            className="input text-sm flex-1"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="btn-primary flex-shrink-0"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
