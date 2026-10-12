// app/api/analytics/route.ts - Dashboard stats
import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, dbQueryOne } from '@/lib/db';
import { generateAnalyticsSummary } from '@/lib/gemini';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = (searchParams.get('lang') || 'ar') as 'ar' | 'fr';

  // Status counts
  const statusStats = await dbQuery<{ status: string; count: number }>(`
    SELECT status, COUNT(*) as count FROM orders GROUP BY status
  `);

  const statsMap: Record<string, number> = {};
  statusStats.forEach(s => { statsMap[s.status] = Number(s.count); });

  const totalRow = await dbQueryOne<any>('SELECT COUNT(*) as c FROM orders');
  const total = Number(totalRow?.c || 0);
  const delivered = statsMap['Livré'] || 0;
  const refused = statsMap['Refusé'] || 0;
  const postponed = statsMap['Reporté'] || 0;
  const inProgress = statsMap['En cours de livraison'] || 0;
  const waiting = statsMap['En attente'] || 0;

  // Risk level counts
  const riskStats = await dbQuery<{ risk_level: string; count: number }>(`
    SELECT risk_level, COUNT(*) as count FROM orders GROUP BY risk_level
  `);

  const riskMap: Record<string, number> = {};
  riskStats.forEach(r => { riskMap[r.risk_level] = Number(r.count); });

  // City breakdown
  const cityStats = await dbQuery<{ city: string; count: number }>(`
    SELECT city, COUNT(*) as count FROM orders WHERE city IS NOT NULL AND city != '' GROUP BY city ORDER BY count DESC LIMIT 10
  `);

  // Daily trend (last 7 days)
  let trend: any[] = [];
  try {
    trend = await dbQuery(`
      SELECT DATE(last_updated) as date, COUNT(*) as total,
        SUM(CASE WHEN status = 'Livré' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'Refusé' THEN 1 ELSE 0 END) as refused
      FROM orders
      GROUP BY DATE(last_updated)
      ORDER BY date ASC
      LIMIT 7
    `);
  } catch {
    trend = [];
  }

  // Recent alerts
  const recentAlerts = await dbQuery(`
    SELECT * FROM alerts ORDER BY created_at DESC LIMIT 10
  `);

  // WhatsApp stats
  const waStats = await dbQuery<{ status: string; count: number }>(`
    SELECT status, COUNT(*) as count FROM messages GROUP BY status
  `);
  const waMap: Record<string, number> = {};
  waStats.forEach(w => { waMap[w.status] = Number(w.count); });

  // AI summary
  const aiSummary = total > 0 ? await generateAnalyticsSummary({
    total, delivered, refused, postponed,
    cityBreakdown: Object.fromEntries(cityStats.map(c => [c.city, Number(c.count)])),
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
