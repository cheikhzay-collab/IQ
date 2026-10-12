// app/api/webhook/sendit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbQueryOne, dbExecute } from '@/lib/db';
import { generateWhatsAppMessage, analyzeRiskLevel } from '@/lib/gemini';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSig = 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const secretRow = await dbQueryOne<any>("SELECT `value` FROM settings WHERE `key` = 'sendit_webhook_secret'");
  const webhookSecret = process.env.SENDIT_WEBHOOK_SECRET || secretRow?.value;
  const signature = req.headers.get('x-webhook-signature') || req.headers.get('x-sendit-signature') || req.headers.get('x-signature') || '';

  // Verify signature if secret is set and signature header is present
  if (webhookSecret && signature) {
    try {
      if (!verifySignature(rawBody, signature, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } catch (e) {
      console.warn('Signature verification skipped due to format difference:', e);
    }
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    // Extract order info from all Sendit & standard webhook formats
    const orderId = String(payload.colis_id || payload.id || payload.tracking || payload.barcode || `order_${Date.now()}`);
    const tracking = String(payload.tracking || payload.barcode || payload.code_suivi || orderId);
    const clientName = payload.client_name || payload.destinataire || payload.customer_name || payload.nom || 'Client';
    const clientPhone = payload.client_phone || payload.telephone || payload.phone || payload.tel || '';
    const city = payload.city || payload.ville || payload.destination || '';
    const newStatus = payload.status || payload.statut || payload.etat || payload.delivery_status || 'Inconnu';
    const previousStatus = payload.previous_status || payload.ancien_statut || '';

    // Get existing order
    const existing = await dbQueryOne<any>('SELECT * FROM orders WHERE id = ? OR tracking = ?', [orderId, tracking]);
    const attemptCount = (existing?.attempt_count || 0) + (
      ['Reporté', 'Refusé', 'Absence'].includes(newStatus) ? 1 : 0
    );

    // Determine risk level
    const riskLevel = await analyzeRiskLevel({ status: newStatus, attemptCount, city });
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (existing) {
      await dbExecute(`
        UPDATE orders SET
          tracking = ?, client_name = ?, client_phone = ?, city = ?, status = ?,
          previous_status = ?, attempt_count = ?, last_updated = ?, risk_level = ?
        WHERE id = ?
      `, [tracking, clientName, clientPhone, city, newStatus, previousStatus, attemptCount, nowIso, riskLevel, existing.id]);
    } else {
      await dbExecute(`
        INSERT INTO orders (id, tracking, client_name, client_phone, city, status, previous_status, attempt_count, last_updated, risk_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [orderId, tracking, clientName, clientPhone, city, newStatus, previousStatus, attemptCount, nowIso, riskLevel]);
    }

    // Log event
    await dbExecute(`
      INSERT INTO events (order_id, tracking, event_type, old_status, new_status, raw_payload)
      VALUES (?, ?, 'status_update', ?, ?, ?)
    `, [orderId, tracking, previousStatus, newStatus, rawBody]);

    // Create alert for critical/high risk
    if (['critical', 'high'].includes(riskLevel)) {
      const alertMsg = riskLevel === 'critical'
        ? `⚠️ طلب ${tracking} وصل للمستوى الحرج (${attemptCount} محاولات) - ${clientName} - ${city}`
        : `🔶 طلب ${tracking} مرفوض من ${clientName} في ${city}`;

      await dbExecute(`
        INSERT INTO alerts (order_id, tracking, alert_type, priority, message)
        VALUES (?, ?, 'risk', ?, ?)
      `, [orderId, tracking, riskLevel, alertMsg]);
    }

    // Auto-send WhatsApp for critical orders or specific statuses
    const autoSendStatuses = ['Reporté', 'Refusé', 'En cours de livraison'];
    const langRow = await dbQueryOne<any>("SELECT `value` FROM settings WHERE `key` = 'default_language'");
    const defaultLang = langRow?.value || 'ar';

    if (clientPhone && autoSendStatuses.includes(newStatus)) {
      const message = await generateWhatsAppMessage({
        clientName,
        clientPhone,
        orderTracking: tracking,
        status: newStatus,
        city,
        attemptCount,
        language: defaultLang as 'ar' | 'fr',
      });

      const autoSendRow = await dbQueryOne<any>("SELECT `value` FROM settings WHERE `key` = 'auto_send_whatsapp'");
      const autoSend = autoSendRow?.value === 'true';

      const insertRes = await dbExecute(`
        INSERT INTO messages (order_id, client_phone, message_text, language, status, generated_by)
        VALUES (?, ?, ?, ?, ?, 'ai')
      `, [orderId, clientPhone, message, defaultLang, autoSend ? 'sending' : 'pending']);

      const msgId = insertRes.insertId;

      if (autoSend && msgId) {
        const result = await sendWhatsAppMessage({ to: clientPhone, message, orderTracking: tracking });
        await dbExecute(
          'UPDATE messages SET status = ?, whatsapp_message_id = ?, sent_at = ? WHERE id = ?',
          [result.success ? 'sent' : 'failed', result.messageId || null, nowIso, msgId]
        );
      }
    }

    return NextResponse.json({ success: true, orderId, riskLevel });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }
}

// Sendit may send a GET to verify the webhook endpoint
export async function GET() {
  return NextResponse.json({ status: 'DeliveryIQ webhook active', timestamp: new Date().toISOString() });
}
