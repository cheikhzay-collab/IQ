// app/api/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, dbQueryOne, dbExecute } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get('unread') === 'true';

  let query = 'SELECT * FROM alerts';
  if (unreadOnly) query += ' WHERE is_read = 0';
  query += ' ORDER BY created_at DESC LIMIT 50';

  const alerts = await dbQuery(query);
  const unreadRow = await dbQueryOne<any>('SELECT COUNT(*) as c FROM alerts WHERE is_read = 0');
  const unreadCount = Number(unreadRow?.c || 0);

  return NextResponse.json({ alerts, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { alertId, markAll } = body;

  if (markAll) {
    await dbExecute('UPDATE alerts SET is_read = 1');
  } else if (alertId) {
    await dbExecute('UPDATE alerts SET is_read = 1 WHERE id = ?', [alertId]);
  }

  return NextResponse.json({ success: true });
}
