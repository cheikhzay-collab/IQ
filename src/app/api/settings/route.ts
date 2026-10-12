import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, dbExecute, dbQueryOne } from '@/lib/db';

export async function GET() {
  const rows = await dbQuery<{ key: string; value: string }>('SELECT `key`, `value` FROM settings');
  
  const settingsMap: Record<string, string> = {};
  for (const row of rows) {
    settingsMap[row.key] = row.value;
  }

  return NextResponse.json({
    senditLibelle: settingsMap['sendit_libelle'] || process.env.SENDIT_LIBELLE || 'GAMA',
    senditPublicKey: settingsMap['sendit_public_key'] || process.env.SENDIT_PUBLIC_KEY || '',
    senditPrivateKey: settingsMap['sendit_private_key'] || process.env.SENDIT_PRIVATE_KEY || '',
    webhookSecret: settingsMap['sendit_webhook_secret'] || process.env.SENDIT_WEBHOOK_SECRET || '',
    geminiKey: settingsMap['gemini_api_key'] || process.env.GEMINI_API_KEY || '',
    waPhoneId: settingsMap['whatsapp_phone_number_id'] || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    waToken: settingsMap['whatsapp_access_token'] || process.env.WHATSAPP_ACCESS_TOKEN || '',
    waVerifyToken: settingsMap['whatsapp_verify_token'] || process.env.WHATSAPP_VERIFY_TOKEN || 'deliveryiq_verify_2024',
    autoSend: settingsMap['auto_send_whatsapp'] === 'true',
    defaultLang: settingsMap['default_language'] || 'ar',
    criticalThreshold: settingsMap['critical_threshold'] || '3',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const mapping: Record<string, string | undefined> = {
      'sendit_libelle': body.senditLibelle,
      'sendit_public_key': body.senditPublicKey,
      'sendit_private_key': body.senditPrivateKey,
      'sendit_webhook_secret': body.webhookSecret,
      'gemini_api_key': body.geminiKey,
      'whatsapp_phone_number_id': body.waPhoneId,
      'whatsapp_access_token': body.waToken,
      'whatsapp_verify_token': body.waVerifyToken,
      'auto_send_whatsapp': body.autoSend !== undefined ? String(body.autoSend) : undefined,
      'default_language': body.defaultLang,
      'critical_threshold': body.criticalThreshold,
    };

    for (const [key, val] of Object.entries(mapping)) {
      if (val !== undefined) {
        const existing = await dbQueryOne('SELECT `key` FROM settings WHERE `key` = ?', [key]);
        if (existing) {
          await dbExecute('UPDATE settings SET `value` = ? WHERE `key` = ?', [val, key]);
        } else {
          await dbExecute('INSERT INTO settings (`key`, `value`) VALUES (?, ?)', [key, val]);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error saving settings' }, { status: 500 });
  }
}
