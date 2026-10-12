// app/api/analytics/route.ts - Dashboard stats
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateAnalyticsSummary } from '@/lib/gemini';

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const lang = (searchParams.get('lang') || 'ar') as 'ar' | 'fr';

  // Status counts
  const statusStats = db.prepare(`
    SELECT status, COUNT(*) as count FROM orders GROUP BY status
  `).all() as { status: string; count: number }[];

  const statsMap: Record<string, number> = {};
  statusStats.forEach(s => { statsMap[s.status] = s.count; });

  const total = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as any).c;
  const delivered = statsMap['Livré'] || 0;
  const refused = statsMap['Refusé'] || 0;
  const postponed = statsMap['Reporté'] || 0;
  const inProgress = statsMap['En cours de livraison'] || 0;
  const waiting = statsMap['En attente'] || 0;

  // Risk level counts
  const riskStats = db.prepare(`
    SELECT risk_level, COUNT(*) as count FROM orders GROUP BY risk_level
  `).all() as { risk_level: string; count: number }[];

  const riskMap: Record<string, number> = {};
  riskStats.forEach(r => { riskMap[r.risk_level] = r.count; });

  // City breakdown
  const cityStats = db.prepare(`
    SELECT city, COUNT(*) as count FROM orders WHERE city != '' GROUP BY city ORDER BY count DESC LIMIT 10
  `).all() as { city: string; count: number }[];

  // Daily trend (last 7 days)
  const trend = db.prepare(`
    SELECT DATE(last_updated) as date, COUNT(*) as total,
      SUM(CASE WHEN status = 'Livré' THEN 1 ELSE 0 END) as delivered,
      SUM(CASE WHEN status = 'Refusé' THEN 1 ELSE 0 END) as refused
    FROM orders
    WHERE last_updated >= datetime('now', '-7 days')
    GROUP BY DATE(last_updated)
    ORDER BY date ASC
  `).all();

  // Recent alerts
  const recentAlerts = db.prepare(`
    SELECT * FROM alerts ORDER BY created_at DESC LIMIT 10
  `).all();

  // WhatsApp stats
  const waStats = db.prepare(`
    SELECT status, COUNT(*) as count FROM messages GROUP BY status
  `).all() as { status: string; count: number }[];
  const waMap: Record<string, number> = {};
  waStats.forEach(w => { waMap[w.status] = w.count; });

  // AI summary
  const aiSummary = total > 0 ? await generateAnalyticsSummary({
    total, delivered, refused, postponed,
    cityBreakdown: Object.fromEntries(cityStats.map(c => [c.city, c.count])),
    language: lang,
  }) : '';

  const deliveryRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

  return NextResponse.json({
    summary: {
      total, delivered, refused, postponed, inProgress, waiting,
      deliveryRate,
    },
    risk: riskMap,
    cities: cityStats,
    trend,
    alerts: recentAlerts,
    whatsapp: waMap,
    aiInsight: aiSummary,
  });
}
