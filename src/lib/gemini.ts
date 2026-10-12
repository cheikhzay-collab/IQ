// lib/gemini.ts - Google Gemini AI integration
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface MessageContext {
  clientName: string;
  clientPhone: string;
  orderTracking: string;
  status: string;
  city: string;
  attemptCount: number;
  language: 'ar' | 'fr';
}

const STATUS_LABELS: Record<string, { ar: string; fr: string }> = {
  'Livré': { ar: 'تم التسليم', fr: 'Livré' },
  'Reporté': { ar: 'مؤجّل', fr: 'Reporté' },
  'Refusé': { ar: 'مرفوض', fr: 'Refusé' },
  'En attente': { ar: 'في الانتظار', fr: 'En attente' },
  'En cours de livraison': { ar: 'قيد التوصيل', fr: 'En cours de livraison' },
  'Annulé': { ar: 'ملغى', fr: 'Annulé' },
  'Retourné': { ar: 'مُعاد', fr: 'Retourné' },
};

export async function generateWhatsAppMessage(ctx: MessageContext): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const statusLabel = STATUS_LABELS[ctx.status]?.[ctx.language] || ctx.status;

  const prompt = ctx.language === 'ar'
    ? `أنت مساعد لشركة توصيل مغربية. اكتب رسالة واتساب قصيرة وودية ومهنية باللغة العربية (الدارجة المغربية) للزبون التالي:
      - الاسم: ${ctx.clientName}
      - رقم التتبع: ${ctx.orderTracking}
      - الحالة الجديدة: ${statusLabel}
      - المدينة: ${ctx.city}
      - عدد محاولات التوصيل: ${ctx.attemptCount}
      
      قواعد:
      - استخدم الدارجة المغربية البسيطة
      - لا تتجاوز 3 جمل
      - أضف emoji مناسباً
      - إذا كان الطلب مرفوضاً أو مؤجلاً، اقترح إعادة التوصيل
      - كن إيجابياً ومحترماً
      - لا تضع مقدمة، ابدأ مباشرة بالرسالة`
    : `Tu es un assistant pour une société de livraison marocaine. Écris un message WhatsApp court, amical et professionnel en français pour ce client:
      - Nom: ${ctx.clientName}
      - Numéro de suivi: ${ctx.orderTracking}
      - Nouveau statut: ${statusLabel}
      - Ville: ${ctx.city}
      - Tentatives de livraison: ${ctx.attemptCount}
      
      Règles:
      - Maximum 3 phrases
      - Ajoute un emoji approprié
      - Si refusé ou reporté, propose de reprogrammer la livraison
      - Sois positif et professionnel
      - Commence directement le message sans introduction`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini error:', error);
    return ctx.language === 'ar'
      ? `السلام عليكم ${ctx.clientName}، طلبكم رقم ${ctx.orderTracking} حالياً: ${statusLabel}. شكراً لثقتكم 📦`
      : `Bonjour ${ctx.clientName}, votre colis ${ctx.orderTracking} est actuellement: ${statusLabel}. Merci de votre confiance 📦`;
  }
}

export async function analyzeRiskLevel(order: {
  status: string;
  attemptCount: number;
  city: string;
}): Promise<'low' | 'medium' | 'high' | 'critical'> {
  if (order.attemptCount >= 3 || order.status === 'Retourné') return 'critical';
  if (order.attemptCount === 2 || order.status === 'Refusé') return 'high';
  if (order.attemptCount === 1 || order.status === 'Reporté') return 'medium';
  return 'low';
}

export async function generateAnalyticsSummary(stats: {
  total: number;
  delivered: number;
  refused: number;
  postponed: number;
  cityBreakdown: Record<string, number>;
  language: 'ar' | 'fr';
}): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const rate = stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0;

  const prompt = stats.language === 'ar'
    ? `أنت محلل لوجستي. بناءً على هذه الإحصائيات الأسبوعية، قدّم تحليلاً قصيراً (4-5 جمل) بالعربية مع توصيات عملية:
      - إجمالي الطلبات: ${stats.total}
      - مُسلَّمة: ${stats.delivered} (${rate}%)
      - مرفوضة: ${stats.refused}
      - مؤجلة: ${stats.postponed}
      - المدن الأكثر إشكالية: ${JSON.stringify(stats.cityBreakdown)}
      
      قدّم: تحليل الأداء + أسباب محتملة للإخفاق + 3 توصيات عملية لرفع نسبة التسليم.`
    : `Tu es un analyste logistique. Sur la base de ces statistiques hebdomadaires, fournis une analyse courte (4-5 phrases) en français avec des recommandations pratiques:
      - Total colis: ${stats.total}
      - Livrés: ${stats.delivered} (${rate}%)
      - Refusés: ${stats.refused}
      - Reportés: ${stats.postponed}
      - Villes problématiques: ${JSON.stringify(stats.cityBreakdown)}
      
      Fournis: analyse des performances + causes probables d'échec + 3 recommandations pratiques pour améliorer le taux de livraison.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return stats.language === 'ar'
      ? `نسبة التسليم الحالية: ${rate}%. يُنصح بمتابعة الطلبات المؤجلة وتواصل أكثر مع الزبائن.`
      : `Taux de livraison actuel: ${rate}%. Il est recommandé de suivre les colis reportés et d'améliorer la communication client.`;
  }
}

export async function chatWithAI(question: string, context: string, language: 'ar' | 'fr'): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemPrompt = language === 'ar'
    ? `أنت مساعد ذكي لمنصة إدارة توصيل مغربية. لديك إمكانية الوصول لبيانات الطلبات التالية:\n${context}\n\nأجب بالعربية بشكل موجز ومفيد.`
    : `Tu es un assistant intelligent pour une plateforme de gestion de livraison marocaine. Tu as accès aux données suivantes:\n${context}\n\nRéponds en français de manière concise et utile.`;

  try {
    const result = await model.generateContent(`${systemPrompt}\n\nQuestion: ${question}`);
    return result.response.text().trim();
  } catch {
    return language === 'ar' ? 'عذراً، حدث خطأ. حاول مرة أخرى.' : 'Désolé, une erreur s\'est produite. Réessayez.';
  }
}
