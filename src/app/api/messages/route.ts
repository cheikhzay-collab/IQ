// app/api/messages/route.ts - WhatsApp messages management
import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, dbQueryOne, dbExecute } from '@/lib/db';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { generateWhatsAppMessage } from '@/lib/gemini';

// GET - list messages
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');

  let query = 'SELECT m.*, o.tracking, o.client_name, o.city FROM messages m LEFT JOIN orders o ON m.order_id = o.id WHERE 1=1';
  const params: any[] = [];

  if (status) { query += ' AND m.status = ?'; params.push(status); }
  if (orderId) { query += ' AND m.order_id = ?'; params.push(orderId); }

  query += ' ORDER BY m.created_at DESC LIMIT 100';

  const messages = await dbQuery(query, params);
  return NextResponse.json({ messages });
}

// POST - generate or send a message
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, orderId, language, messageText, messageId } = body;

  if (action === 'generate') {
    const order = await dbQueryOne<any>('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const message = await generateWhatsAppMessage({
      clientName: order.client_name,
      clientPhone: order.client_phone,
      orderTracking: order.tracking,
      status: order.status,
      city: order.city,
      attemptCount: order.attempt_count,
      language: language || 'ar',
    });

    return NextResponse.json({ message });
  }

  if (action === 'send') {
    const msg = await dbQueryOne<any>('SELECT m.*, o.tracking FROM messages m LEFT JOIN orders o ON m.order_id = o.id WHERE m.id = ?', [messageId]);
    if (!msg) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

    const finalText = messageText || msg.message_text;
    const result = await sendWhatsAppMessage({
      to: msg.client_phone,
      message: finalText,
      orderTracking: msg.tracking,
    });

    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await dbExecute(
      'UPDATE messages SET status = ?, whatsapp_message_id = ?, sent_at = ?, message_text = ? WHERE id = ?',
      [result.success ? 'sent' : 'failed', result.messageId || null, nowIso, finalText, messageId]
    );

    return NextResponse.json({ success: result.success, error: result.error });
  }

  if (action === 'create') {
    const order = await dbQueryOne<any>('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const insertRes = await dbExecute(`
      INSERT INTO messages (order_id, client_phone, message_text, language, status, generated_by)
      VALUES (?, ?, ?, ?, 'pending', 'manual')
    `, [orderId, order.client_phone, messageText, language || 'ar']);

    return NextResponse.json({ success: true, messageId: insertRes.insertId });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
