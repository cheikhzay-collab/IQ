// src/lib/sendit.ts
import { dbQuery, dbQueryOne, dbRun } from './db';

export interface SenditDistrict {
  id: number;
  name: string;
  name_ar: string;
  price?: number;
  delai?: string;
}

export const MOROCCAN_DISTRICTS: SenditDistrict[] = [
  { id: 1, name: 'Casablanca', name_ar: 'الدار البيضاء', price: 25, delai: '24h' },
  { id: 2, name: 'Rabat', name_ar: 'الرباط', price: 30, delai: '24h' },
  { id: 3, name: 'Marrakech', name_ar: 'مراكش', price: 35, delai: '24-48h' },
  { id: 4, name: 'Tanger', name_ar: 'طنجة', price: 35, delai: '24-48h' },
  { id: 5, name: 'Fès', name_ar: 'فاس', price: 35, delai: '24-48h' },
  { id: 6, name: 'Agadir', name_ar: 'أكادير', price: 40, delai: '48h' },
  { id: 7, name: 'Meknès', name_ar: 'مكناس', price: 35, delai: '24-48h' },
  { id: 8, name: 'Oujda', name_ar: 'وجدة', price: 45, delai: '48h' },
  { id: 9, name: 'Kénitra', name_ar: 'القنيطرة', price: 30, delai: '24h' },
  { id: 10, name: 'Tétouan', name_ar: 'تطوان', price: 35, delai: '48h' },
  { id: 11, name: 'Safi', name_ar: 'آسفي', price: 40, delai: '48h' },
  { id: 12, name: 'Mohammédia', name_ar: 'المحمدية', price: 25, delai: '24h' },
  { id: 13, name: 'El Jadida', name_ar: 'الجديدة', price: 35, delai: '24-48h' },
  { id: 14, name: 'Nador', name_ar: 'الناظور', price: 45, delai: '48h' },
  { id: 15, name: 'Béni Mellal', name_ar: 'بني ملال', price: 40, delai: '48h' },
];

export interface CreateDeliveryParams {
  clientName: string;
  clientPhone: string;
  city: string;
  address: string;
  price: number;
  productNote?: string;
  allowOpen?: boolean;
  canTry?: boolean;
  orderReference?: string;
}

/**
 * Retrieve Sendit API Credentials from settings DB or environment
 */
export async function getSenditCredentials() {
  const settingsRows = await dbQuery<{ key: string; value: string }>('SELECT `key`, `value` FROM settings');
  const map: Record<string, string> = {};
  for (const row of settingsRows) {
    map[row.key] = row.value;
  }

  return {
    libelle: (map['sendit_libelle'] || process.env.SENDIT_LIBELLE || 'GAMA').trim(),
    publicKey: (map['sendit_public_key'] || process.env.SENDIT_PUBLIC_KEY || '').trim(),
    privateKey: (map['sendit_private_key'] || process.env.SENDIT_PRIVATE_KEY || '').trim(),
    apiUrl: 'https://app.sendit.ma/api/v1',
  };
}

// In-memory token cache (valid for ~50 minutes)
let cachedAuth: { token: string; expiresAt: number; keyFingerprint: string } | null = null;

/**
 * Obtain a valid Bearer Token from Sendit API via POST /api/v1/login
 */
export async function getSenditAuthToken(customKeys?: { publicKey?: string; secretKey?: string }): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  const creds = await getSenditCredentials();
  const pub = (customKeys?.publicKey || creds.publicKey || '').trim();
  const sec = (customKeys?.secretKey || creds.privateKey || '').trim();

  if (!pub || !sec) {
    return {
      success: false,
      error: 'مفاتيح Sendit API مفقودة. يرجى إدخال Public Key و Secret Key في شاشة الإعدادات.',
    };
  }

  const fingerprint = `${pub}:${sec}`;
  const now = Date.now();

  if (!customKeys && cachedAuth && cachedAuth.keyFingerprint === fingerprint && cachedAuth.expiresAt > now) {
    return { success: true, token: cachedAuth.token };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${creds.apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        public_key: pub,
        secret_key: sec,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);

    if (res.ok && data?.data?.token) {
      const token = data.data.token as string;
      if (!customKeys) {
        cachedAuth = {
          token,
          expiresAt: now + 50 * 60 * 1000,
          keyFingerprint: fingerprint,
        };
      }
      return { success: true, token };
    }

    const msg = data?.message || `HTTP ${res.status}`;
    return {
      success: false,
      error: `فشل تسجيل الدخول إلى Sendit (${msg}). يرجى التحقق من صحة المفاتيح في حسابك على app.sendit.ma`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `تعذر الاتصال بخادم Sendit: ${err?.message || 'Timeout/Network error'}`,
    };
  }
}

/**
 * Test Sendit API Credentials connectivity
 */
export async function testSenditConnection(keys?: { publicKey?: string; secretKey?: string }) {
  const auth = await getSenditAuthToken(keys);
  if (!auth.success || !auth.token) {
    return {
      success: false,
      error: auth.error || 'فشل الاتصال بـ Sendit',
    };
  }

  return {
    success: true,
    message: 'تم التحقق من بيانات الاتصال بنجاح! الاتصال بـ Sendit نشط ويعمل.',
  };
}

/**
 * Clean Moroccan phone number to standard 10-digit format (06/07)
 */
function sanitizePhoneNumber(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('212') && clean.length === 12) {
    return '0' + clean.slice(3);
  }
  if ((clean.startsWith('6') || clean.startsWith('7')) && clean.length === 9) {
    return '0' + clean;
  }
  return clean;
}

/**
 * Resolve District ID from City name
 */
function resolveDistrictId(cityName: string): number {
  const normalized = (cityName || '').trim().toLowerCase();
  for (const d of MOROCCAN_DISTRICTS) {
    if (d.name.toLowerCase() === normalized || d.name_ar === cityName) {
      return d.id;
    }
  }
  return 1; // Default to Casablanca (1)
}

/**
 * Push a new delivery order to Sendit
 */
export async function pushDeliveryToSendit(params: CreateDeliveryParams) {
  const creds = await getSenditCredentials();
  const auth = await getSenditAuthToken();

  const trackingNumber = params.orderReference || `SND-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
  const districtId = resolveDistrictId(params.city);

  let remoteSuccess = false;
  let remoteData: any = null;
  let remoteError = '';

  if (auth.success && auth.token) {
    try {
      const payload = {
        reference: trackingNumber,
        name: params.clientName,
        phone: sanitizePhoneNumber(params.clientPhone),
        address: params.address || params.city,
        amount: Number(params.price || 0),
        pickup_district_id: 1, // Default pickup district
        district_id: districtId,
        comment: `${params.productNote || 'Colis DeliveryIQ'} ${params.allowOpen ? '[Ouvrir: Oui]' : ''} ${params.canTry ? '[Essai: Oui]' : ''}`.trim(),
        allow_try: params.canTry ? 1 : 0,
        allow_open: params.allowOpen ? 1 : 0,
        products: params.productNote || 'Colis DeliveryIQ',
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${creds.apiUrl}/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const resJson = await res.json().catch(() => null);

      if (res.ok && (resJson?.success || resJson?.data)) {
        remoteData = resJson.data || resJson;
        remoteSuccess = true;
      } else {
        remoteError = resJson?.message || `HTTP ${res.status}`;
      }
    } catch (err: any) {
      remoteError = err?.message || 'Connection error to app.sendit.ma';
    }
  } else {
    remoteError = auth.error || 'Non authentifié';
  }

  // Final tracking code (from remote if returned, else reference)
  const finalTracking = remoteData?.code || remoteData?.tracking_code || remoteData?.code_barre || trackingNumber;
  const initialStatus = 'En attente';
  const now = new Date().toISOString();

  // Save into local database
  await dbRun(
    `INSERT INTO orders 
      (id, tracking, client_name, client_phone, city, address, price, notes, status, attempt_count, risk_level, ai_recommendation, last_updated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
      client_name = VALUES(client_name),
      client_phone = VALUES(client_phone),
      city = VALUES(city),
      price = VALUES(price),
      notes = VALUES(notes),
      last_updated = VALUES(last_updated)`,
    [
      finalTracking,
      finalTracking,
      params.clientName,
      params.clientPhone,
      params.city,
      params.address,
      params.price,
      params.productNote || 'Colis Sendit',
      initialStatus,
      0,
      'low',
      remoteSuccess 
        ? 'تم دفع الشحنة بنجاح إلى منصة Sendit' 
        : `تم الحفظ محلياً (${remoteError})`,
      now
    ]
  );

  // Record initial event
  await dbRun(
    `INSERT INTO events (order_id, tracking, status, reason, note, timestamp)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      finalTracking,
      finalTracking,
      initialStatus,
      'Création Colis Sendit',
      remoteSuccess ? `Poussé avec succès vers Sendit (${creds.libelle})` : `Enregistré localement (Erreur Sendit: ${remoteError})`,
      now
    ]
  );

  return {
    success: remoteSuccess,
    localSaved: true,
    tracking: finalTracking,
    barcode: `*${finalTracking}*`,
    remoteSuccess,
    remoteError,
    order: {
      tracking: finalTracking,
      clientName: params.clientName,
      clientPhone: params.clientPhone,
      city: params.city,
      price: params.price,
      status: initialStatus,
      lastUpdated: now,
    }
  };
}

/**
 * Fetch / Synchronize deliveries from Sendit
 */
export async function syncSenditDeliveries(): Promise<{
  success: boolean;
  syncedCount: number;
  remoteFetched: boolean;
  error?: string;
  message?: string;
  timestamp: string;
}> {
  const creds = await getSenditCredentials();
  const auth = await getSenditAuthToken();

  // If credentials fail or are invalid, return an explicit error! Do NOT fake success!
  if (!auth.success || !auth.token) {
    return {
      success: false,
      syncedCount: 0,
      remoteFetched: false,
      error: auth.error || 'فشل الاتصال بـ Sendit: تأكد من صحة المفاتيح في الإعدادات.',
      timestamp: new Date().toISOString(),
    };
  }

  let liveCount = 0;
  let remoteFetched = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    // Call GET /api/v1/deliveries
    const res = await fetch(`${creds.apiUrl}/deliveries`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const deliveries = Array.isArray(data) ? data : (data.data || []);
      
      if (Array.isArray(deliveries) && deliveries.length > 0) {
        remoteFetched = true;
        for (const d of deliveries) {
          const tracking = d.code || d.code_barre || d.tracking_code || d.order_id || d.reference;
          if (!tracking) continue;

          const status = mapSenditStatus(d.status || d.current_status);
          const attempts = Number(d.attempts || d.attempt_count || 1);
          const riskLevel = computeRiskLevel(status, attempts);

          await dbRun(
            `INSERT INTO orders 
              (id, tracking, client_name, client_phone, city, address, price, notes, status, attempt_count, risk_level, ai_recommendation, last_updated)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
              status = VALUES(status),
              attempt_count = VALUES(attempt_count),
              risk_level = VALUES(risk_level),
              notes = VALUES(notes),
              last_updated = VALUES(last_updated)`,
            [
              tracking,
              tracking,
              d.name || d.client?.name || 'عميل Sendit',
              d.phone || d.client?.phone || '0600000000',
              d.district?.name || d.city || d.client?.city || 'Casablanca',
              d.address || d.client?.address || '',
              Number(d.amount || d.price || d.total || 0),
              d.comment || d.products || 'Colis Sendit API',
              status,
              attempts,
              riskLevel,
              `مزامنة مباشرة من Sendit API (${new Date().toLocaleTimeString('fr-MA')})`,
              new Date().toISOString()
            ]
          );

          await dbRun(
            `INSERT INTO events (order_id, tracking, status, reason, note, timestamp)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              tracking,
              tracking,
              status,
              'Mise à jour Sendit Live API',
              `تم جلب التحديث مباشرة من منصة Sendit (${status})`,
              new Date().toISOString()
            ]
          );
          liveCount++;
        }
      }
    } else {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        syncedCount: 0,
        remoteFetched: false,
        error: `خطأ من Sendit API (${res.status}): ${errText.slice(0, 100)}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (err: any) {
    return {
      success: false,
      syncedCount: 0,
      remoteFetched: false,
      error: `تعذر الاتصال بـ Sendit: ${err?.message || 'Connection error'}`,
      timestamp: new Date().toISOString(),
    };
  }

  // Also query status of any existing pending orders tracked in Sendit
  const existingTracked = await dbQuery<{ id: string; tracking: string }>(
    `SELECT id, tracking FROM orders WHERE tracking IS NOT NULL AND status NOT IN ('Livré', 'Refusé', 'Retourné') LIMIT 15`
  );

  for (const ord of existingTracked) {
    if (!ord.tracking) continue;
    try {
      const singleRes = await fetch(`${creds.apiUrl}/deliveries/${encodeURIComponent(ord.tracking)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
      });
      if (singleRes.ok) {
        const singleData = await singleRes.json();
        const d = singleData.data || singleData;
        if (d && (d.status || d.current_status)) {
          const status = mapSenditStatus(d.status || d.current_status);
          const attempts = Number(d.attempts || 1);
          const riskLevel = computeRiskLevel(status, attempts);

          await dbRun(
            `UPDATE orders 
             SET status = ?, attempt_count = ?, risk_level = ?, last_updated = ?
             WHERE id = ? OR tracking = ?`,
            [status, attempts, riskLevel, new Date().toISOString(), ord.id, ord.tracking]
          );
          liveCount++;
        }
      }
    } catch {
      // Individual check skipped
    }
  }

  return {
    success: true,
    syncedCount: liveCount,
    remoteFetched: true,
    message: liveCount > 0 
      ? `تم جلب وتحديث ${liveCount} طلب بنجاح من حساب Sendit!` 
      : 'تم الاتصال بـ Sendit بنجاح، لا توجد طلبات جديدة حالياً.',
    timestamp: new Date().toISOString(),
  };
}

export function mapSenditStatus(raw: string): string {
  if (!raw) return 'En cours de livraison';
  const l = raw.toLowerCase().trim();
  if (l === 'delivered' || l.includes('livr') || l.includes('payé')) return 'Livré';
  if (l === 'rejected' || l === 'canceled' || l.includes('refus') || l.includes('annul')) return 'Refusé';
  if (l === 'postponed' || l === 'unreachable' || l.includes('report') || l.includes('injoign')) return 'Reporté';
  if (l === 'returned' || l.includes('retour')) return 'Retourné';
  if (l === 'delivering' || l === 'transit' || l === 'distributed' || l.includes('cours') || l.includes('distrib')) return 'En cours de livraison';
  if (l === 'pending' || l === 'to_prepare' || l === 'to_pickup' || l === 'pickedup' || l.includes('ramass') || l.includes('attente')) return 'En attente';
  return 'En cours de livraison';
}

export function computeRiskLevel(status: string, attempts: number): string {
  if (status === 'Refusé' || status === 'Retourné') return 'critical';
  if (status === 'Reporté' || attempts >= 3) return 'high';
  if (attempts === 2) return 'medium';
  if (status === 'Livré') return 'low';
  return 'low';
}
