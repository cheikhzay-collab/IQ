// app/api/orders/route.ts - Get all orders with filters
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);

  const status = searchParams.get('status');
  const city = searchParams.get('city');
  const risk = searchParams.get('risk');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = 'SELECT * FROM orders WHERE 1=1';
  const params: any[] = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  if (city) { query += ' AND city = ?'; params.push(city); }
  if (risk) { query += ' AND risk_level = ?'; params.push(risk); }
  if (search) {
    query += ' AND (client_name LIKE ? OR tracking LIKE ? OR client_phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY last_updated DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const orders = db.prepare(query).all(...params);
  const total = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;

  return NextResponse.json({ orders, total });
}
