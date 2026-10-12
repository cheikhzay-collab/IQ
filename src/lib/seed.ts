// src/lib/seed.ts - Seed realistic delivery data for Moroccan e-commerce
import { dbQueryOne, dbExecute } from './db';

export async function seedDatabaseIfEmpty() {
  const row = await dbQueryOne<any>('SELECT COUNT(*) as c FROM orders');
  const count = Number(row?.c || 0);
  if (count > 0) return;
  await forceSeedDatabase();
}

export async function forceSeedDatabase() {
  await dbExecute('DELETE FROM events');
  await dbExecute('DELETE FROM messages');
  await dbExecute('DELETE FROM alerts');
  await dbExecute('DELETE FROM orders');

  const initialOrders = [
    {
      id: 'ord_101',
      tracking: 'SD-CAS-94021',
      client_name: 'كريم التازي',
      client_phone: '+212661849201',
      city: 'الدار البيضاء',
      status: 'Livré',
      previous_status: 'En cours de livraison',
      attempt_count: 1,
      last_updated: '2026-10-12 16:30:00',
      risk_level: 'low',
      notes: 'تم التسليم بنجاح في المعاريف، استلم الزبون ودفع 450 درهم نقداً.',
    },
    {
      id: 'ord_102',
      tracking: 'SD-RAB-83192',
      client_name: 'سلمى الإدريسي',
      client_phone: '+212662910384',
      city: 'الرباط',
      status: 'Livré',
      previous_status: 'En cours de livraison',
      attempt_count: 1,
      last_updated: '2026-10-12 15:45:00',
      risk_level: 'low',
      notes: 'تم التسليم بحي أكدال، الزبونة راضية جداً.',
    },
    {
      id: 'ord_103',
      tracking: 'SD-CAS-71934',
      client_name: 'عمر البقالي',
      client_phone: '+212670192837',
      city: 'الدار البيضاء',
      status: 'Reporté',
      previous_status: 'En cours de livraison',
      attempt_count: 2,
      last_updated: '2026-10-12 14:15:00',
      risk_level: 'high',
      notes: 'الزبون مسافر اليوم وطلب تأجيل التسليم ليوم الأربعاء بعد 5 مساءً.',
    },
    {
      id: 'ord_104',
      tracking: 'SD-TNG-50192',
      client_name: 'فاطمة الزهراء العلمي',
      client_phone: '+212664829103',
      city: 'طنجة',
      status: 'Refusé',
      previous_status: 'En cours de livraison',
      attempt_count: 3,
      last_updated: '2026-10-12 13:20:00',
      risk_level: 'critical',
      notes: 'رفضت الاستلام، تدعي أن الطلب تأخر كثيراً ولم تعد بحاجة للمنتج.',
    },
    {
      id: 'ord_105',
      tracking: 'SD-MRK-61820',
      client_name: 'ياسين المرابط',
      client_phone: '+212661092834',
      city: 'مراكش',
      status: 'Livré',
      previous_status: 'En cours de livraison',
      attempt_count: 1,
      last_updated: '2026-10-12 12:50:00',
      risk_level: 'low',
      notes: 'تسليم سلس في جليز، دفع 320 درهم.',
    },
    {
      id: 'ord_106',
      tracking: 'SD-FES-33821',
      client_name: 'نادية الشرايبي',
      client_phone: '+212663984120',
      city: 'فاس',
      status: 'Reporté',
      previous_status: 'En cours de livraison',
      attempt_count: 1,
      last_updated: '2026-10-12 11:10:00',
      risk_level: 'medium',
      notes: 'الهاتف مغلق أثناء محاولة التسليم الأولى، تمت إعادة الجدولة.',
    },
    {
      id: 'ord_107',
      tracking: 'SD-AGD-44912',
      client_name: 'مهدي أيت بنعلي',
      client_phone: '+212665123984',
      city: 'أكادير',
      status: 'En cours de livraison',
      previous_status: 'En attente',
      attempt_count: 0,
      last_updated: '2026-10-12 10:00:00',
      risk_level: 'low',
      notes: 'الموزع خرج في اتجاه بنسركاو.',
    },
    {
      id: 'ord_108',
      tracking: 'SD-OUJ-19283',
      client_name: 'خديجة بنجلون',
      client_phone: '+212661847291',
      city: 'وجدة',
      status: 'En cours de livraison',
      previous_status: 'En attente',
      attempt_count: 0,
      last_updated: '2026-10-12 09:30:00',
      risk_level: 'low',
      notes: 'في الطريق للتسليم بوسط المدينة.',
    },
    {
      id: 'ord_109',
      tracking: 'SD-KEN-88210',
      client_name: 'حمزة الوردي',
      client_phone: '+212660192847',
      city: 'القنيطرة',
      status: 'En attente',
      previous_status: '',
      attempt_count: 0,
      last_updated: '2026-10-12 08:15:00',
      risk_level: 'low',
      notes: 'طلب جديد تم استقباله عبر Sendit، في انتظار خروج الموزع.',
    },
    {
      id: 'ord_110',
      tracking: 'SD-RAB-66291',
      client_name: 'هدى الصقلي',
      client_phone: '+212662019283',
      city: 'الرباط',
      status: 'Reporté',
      previous_status: 'En cours de livraison',
      attempt_count: 2,
      last_updated: '2026-10-11 16:40:00',
      risk_level: 'high',
      notes: 'تأجيل بسبب عدم تواجد الزبونة في المنزل (حي حسان).',
    },
    {
      id: 'ord_111',
      tracking: 'SD-MRK-99120',
      client_name: 'بدر الزيات',
      client_phone: '+212664910293',
      city: 'مراكش',
      status: 'Livré',
      previous_status: 'En cours de livraison',
      attempt_count: 2,
      last_updated: '2026-10-11 15:20:00',
      risk_level: 'low',
      notes: 'تم التسليم بعد رسالة واتساب استرجاعية ناجحة!',
    },
    {
      id: 'ord_112',
      tracking: 'SD-CAS-11209',
      client_name: 'زينب المنصوري',
      client_phone: '+212661902847',
      city: 'الدار البيضاء',
      status: 'Refusé',
      previous_status: 'En cours de livraison',
      attempt_count: 2,
      last_updated: '2026-10-11 14:00:00',
      risk_level: 'critical',
      notes: 'الزبونة فتحت الطرد وقالت إن المقاس غير مناسب ورفضت الدفع.',
    },
  ];

  for (const o of initialOrders) {
    await dbExecute(`
      INSERT INTO orders (id, tracking, client_name, client_phone, city, status, previous_status, attempt_count, last_updated, risk_level, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [o.id, o.tracking, o.client_name, o.client_phone, o.city, o.status, o.previous_status, o.attempt_count, o.last_updated, o.risk_level, o.notes]);
  }

  // Seed Alerts
  const initialAlerts = [
    {
      order_id: 'ord_104',
      tracking: 'SD-TNG-50192',
      alert_type: 'risk',
      priority: 'critical',
      message: '🚨 طرد مرفوض في طنجة من فاطمة الزهراء العلمي (3 محاولات) - يتطلب تدخلاً فورياً عبر الواتساب!',
      is_read: 0,
      created_at: '2026-10-12 13:25:00',
    },
    {
      order_id: 'ord_112',
      tracking: 'SD-CAS-11209',
      alert_type: 'risk',
      priority: 'critical',
      message: '🚨 طرد مرفوض في كازا (المقاس غير مناسب) - فرصة للاستبدال عبر خدمة العملاء.',
      is_read: 0,
      created_at: '2026-10-11 14:05:00',
    },
    {
      order_id: 'ord_103',
      tracking: 'SD-CAS-71934',
      alert_type: 'risk',
      priority: 'high',
      message: '⚠️ طرد مؤجل للمرة الثانية في الدار البيضاء (عمر البقالي) - موعد التسليم الأربعاء.',
      is_read: 0,
      created_at: '2026-10-12 14:16:00',
    },
    {
      order_id: 'ord_110',
      tracking: 'SD-RAB-66291',
      alert_type: 'risk',
      priority: 'high',
      message: '⚠️ طرد مؤجل مرتين في الرباط (هدى الصقلي) - تم اقتراح خصم 10% عبر الواتساب.',
      is_read: 1,
      created_at: '2026-10-11 16:45:00',
    },
  ];

  for (const a of initialAlerts) {
    await dbExecute(`
      INSERT INTO alerts (order_id, tracking, alert_type, priority, message, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [a.order_id, a.tracking, a.alert_type, a.priority, a.message, a.is_read, a.created_at]);
  }

  // Seed WhatsApp Messages
  const initialMessages = [
    {
      order_id: 'ord_103',
      client_phone: '+212670192837',
      message_text: 'السلام عليكم سي عمر 📦 معكم فريق التوصيل بخصوص طلبيتكم SD-CAS-71934. توصلنا بطلب تأجيل الموعد ليوم الأربعاء بعد 5 مساءً. واش كتاكد لينا هاد التوقيت باش نوجدو الموزع؟ شكراً بزاف!',
      language: 'ar',
      status: 'pending',
      created_at: '2026-10-12 14:18:00',
    },
    {
      order_id: 'ord_104',
      client_phone: '+212664829103',
      message_text: 'أهلاً لالة فاطمة الزهراء 🌸 لاحظنا أنكِ رفضتِ استلام طردك SD-TNG-50192. واش كان شي مشكل فالمقاس أو اللون؟ نقدرو نبدلوه ليك مجاناً وبدون أي مصاريف إضافية! كيف كتفضلي؟',
      language: 'ar',
      status: 'pending',
      created_at: '2026-10-12 13:22:00',
    },
    {
      order_id: 'ord_111',
      client_phone: '+212664910293',
      message_text: 'السلام عليكم سي بدر، بخصوص طردكم في مراكش، الموزع غيكون عندك اليوم بين 14:00 و 16:00 كما اتفقنا. شكراً لصبركم 🚀',
      language: 'ar',
      status: 'sent',
      whatsapp_message_id: 'wamid_HBgLMjEyNjY0OTEwMjkz',
      sent_at: '2026-10-11 11:30:00',
      created_at: '2026-10-11 11:25:00',
    },
  ];

  for (const m of initialMessages) {
    await dbExecute(`
      INSERT INTO messages (order_id, client_phone, message_text, language, status, whatsapp_message_id, sent_at, created_at, generated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ai')
    `, [m.order_id, m.client_phone, m.message_text, m.language, m.status, (m as any).whatsapp_message_id || null, (m as any).sent_at || null, m.created_at]);
  }
}
