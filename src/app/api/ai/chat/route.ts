// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { chatWithAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  const { question, language } = await req.json();
  const db = getDb();

  // Build context from DB
  const total = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as any).c;
  const statusStats = db.prepare('SELECT status, COUNT(*) as count FROM orders GROUP BY status').all();
  const cityStats = db.prepare('SELECT city, COUNT(*) as count FROM orders WHERE city != \'\' GROUP BY city ORDER BY count DESC LIMIT 5').all();
  const criticalOrders = db.prepare('SELECT tracking, client_name, city, status, attempt_count FROM orders WHERE risk_level IN (\'critical\',\'high\') LIMIT 10').all();
  const unreadAlerts = (db.prepare('SELECT COUNT(*) as c FROM alerts WHERE is_read = 0').get() as any).c;

  const context = JSON.stringify({
    totalOrders: total,
    statusBreakdown: statusStats,
    topCities: cityStats,
    criticalOrders,
    unreadAlerts,
  });

  const answer = await chatWithAI(question, context, language || 'ar');

  return NextResponse.json({ answer });
}
