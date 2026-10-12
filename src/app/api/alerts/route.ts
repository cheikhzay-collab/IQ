// app/api/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get('unread') === 'true';

  let query = 'SELECT * FROM alerts';
  if (unreadOnly) query += ' WHERE is_read = 0';
  query += ' ORDER BY created_at DESC LIMIT 50';

  const alerts = db.prepare(query).all();
  const unreadCount = (db.prepare('SELECT COUNT(*) as c FROM alerts WHERE is_read = 0').get() as any).c;

  return NextResponse.json({ alerts, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { alertId, markAll } = body;

  if (markAll) {
    db.prepare('UPDATE alerts SET is_read = 1').run();
  } else if (alertId) {
    db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ?').run(alertId);
  }

  return NextResponse.json({ success: true });
}
