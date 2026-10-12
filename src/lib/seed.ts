// src/lib/seed.ts - Seed realistic delivery data for Moroccan e-commerce
import { getDb } from './db';

export function seedDatabaseIfEmpty() {
  const db = getDb();
  const count = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as any)?.c || 0;
  if (count > 0) return; // already seeded
  forceSeedDatabase();
}

export function forceSeedDatabase() {
  const db = getDb();

  // Clear existing
  db.exec(`
    DELETE FROM events;
    DELETE FROM messages;
    DELETE FROM alerts;
    DELETE FROM orders;
  `);

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
      attempt_count: 2,
      last_updated: '2026-10-12 13:20:00',
      risk_level: 'high',
      notes: 'الزبونة ادعت أنها لم تطلب هذا المنتج أو المقاس غير مناسب. تحتاج رسالة استرجاع.',
    },
    {
      id: 'ord_105',
      tracking: 'SD-MRK-44912',
      client_name: 'المهدي بناني',
      client_phone: '+212661092834',
      city: 'مراكش',
      status: 'En cours de livraison',
      previous_status: 'En attente',
      attempt_count: 0,
      last_updated: '2026-10-12 12:00:00',
      risk_level: 'low',
      notes: 'مع الموزع رشيد في جليز، التسليم متوقع قبل الساعة 18:00.',
    },
    {
      id: 'ord_106',
      tracking: 'SD-FES-33821',
      client_name: 'نادية السملالي',
      client_phone: '+212663984120',
      city: 'فاس',
      status: 'Reporté',
      previous_status: 'En cours de livraison',
      attempt_count: 3,
      last_updated: '2026-10-12 11:10:00',
      risk_level: 'critical',
      notes: 'محاولة ثالثة فاشلة، الهاتف يرن دون إجابة، عنوان حي النرجس غير دقيق.',
    },
    {
      id: 'ord_107',
      tracking: 'SD-AGD-22019',
      client_name: 'رشيد المنصوري',
      client_phone: '+212665129384',
      city: 'أكادير',
      status: 'Livré',
      previous_status: 'En cours de livraison',
      attempt_count: 1,
      last_updated: '2026-10-12 10:45:00',
      risk_level: 'low',
      notes: 'تسليم سريع في تالبرجت، تم استلام المبلغ 320 درهم.',
    },
    {
      id: 'ord_108',
      tracking: 'SD-KNT-19284',
      client_name: 'حنان الوزاني',
      client_phone: '+212666839201',
      city: 'القنيطرة',
      status: 'En cours de livraison',
      previous_status: 'En attente',
      attempt_count: 0,
      last_updated: '2026-10-12 09:30:00',
      risk_level: 'low',
      notes: 'الموزع متوجه للعنوان وسط المدينة.',
    },
    {
      id: 'ord_109',
      tracking: 'SD-CAS-90182',
      client_name: 'حمزة الفاسي',
      client_phone: '+212671928374',
      city: 'الدار البيضاء',
      status: 'Livré',
      previous_status: 'En cours de livraison',
      attempt_count: 1,
      last_updated: '2026-10-11 18:10:00',
      risk_level: 'low',
      notes: 'تسليم في عين الذئاب، الزبون أكد استلام الطرد كاملاً.',
    },
    {
      id: 'ord_110',
      tracking: 'SD-RAB-66291',
      client_name: 'هدى الصنهاجي',
      client_phone: '+212662019283',
      city: 'الرباط',
      status: 'Refusé',
      previous_status: 'Reporté',
      attempt_count: 2,
      last_updated: '2026-10-11 16:40:00',
      risk_level: 'high',
      notes: 'رفضت الاستلام بسبب التأخر ليومين عن الموعد الأصلي.',
    },
    {
      id: 'ord_111',
      tracking: 'SD-MRK-55102',
      client_name: 'بدر الخمليشي',
      client_phone: '+212664910293',
      city: 'مراكش',
      status: 'Livré',
      previous_status: 'Reporté',
      attempt_count: 2,
      last_updated: '2026-10-11 15:20:00',
      risk_level: 'low',
      notes: 'تم استرجاع الزبون عبر رسالة واتساب وأكد موعداً جديداً وتم التسليم بنجاح!',
    },
    {
      id: 'ord_112',
      tracking: 'SD-TNG-44291',
      client_name: 'مريم الودغيري',
      client_phone: '+212663102938',
      city: 'طنجة',
      status: 'Livré',
      previous_status: 'En cours de livraison',
      attempt_count: 1,
      last_updated: '2026-10-11 14:00:00',
      risk_level: 'low',
      notes: 'تسليم سلس في مالاباطا.',
    },
    {
      id: 'ord_113',
      tracking: 'SD-OFR-33019',
      client_name: 'ياسين الورديغي',
      client_phone: '+212665928301',
      city: 'وجدة',
      status: 'Retourné',
      previous_status: 'Refusé',
      attempt_count: 4,
      last_updated: '2026-10-11 11:00:00',
      risk_level: 'critical',
      notes: 'تم إرجاع الطرد إلى المستودع الرئيسي بعد 4 محاولات تواصل فاشلة.',
    },
    {
      id: 'ord_114',
      tracking: 'SD-CAS-88192',
      client_name: 'سعاد المرابط',
      client_phone: '+212672019283',
      city: 'الدار البيضاء',
      status: 'Livré',
      previous_status: 'En cours de livraison',
      attempt_count: 1,
      last_updated: '2026-10-10 17:30:00',
      risk_level: 'low',
      notes: 'سيدي معروف، تم التسليم في مقر العمل.',
    },
    {
      id: 'ord_115',
      tracking: 'SD-FES-77281',
      client_name: 'طارق الزواوي',
      client_phone: '+212661829301',
      city: 'فاس',
      status: 'Livré',
      previous_status: 'En cours de livraison',
      attempt_count: 1,
      last_updated: '2026-10-10 16:15:00',
      risk_level: 'low',
      notes: 'طريق إيموزار، تسليم سريع ودفع 590 درهم.',
    },
    {
      id: 'ord_116',
      tracking: 'SD-AGD-66192',
      client_name: 'ابتسام بن جلون',
      client_phone: '+212663019284',
      city: 'أكادير',
      status: 'Reporté',
      previous_status: 'En attente',
      attempt_count: 1,
      last_updated: '2026-10-10 14:50:00',
      risk_level: 'medium',
      notes: 'الزبونة طلبت التسليم بعد نهاية عطلة نهاية الأسبوع.',
    },
    {
      id: 'ord_117',
      tracking: 'SD-CAS-55291',
      client_name: 'أنس الشرقاوي',
      client_phone: '+212670918273',
      city: 'الدار البيضاء',
      status: 'En cours de livraison',
      previous_status: 'En attente',
      attempt_count: 0,
      last_updated: '2026-10-10 13:00:00',
      risk_level: 'low',
      notes: 'حي كاليفورنيا، في انتظار وصول الموزع.',
    },
    {
      id: 'ord_118',
      tracking: 'SD-RAB-44182',
      client_name: 'خديجة السوسي',
      client_phone: '+212664019283',
      city: 'الرباط',
      status: 'Livré',
      previous_status: 'En cours de livraison',
      attempt_count: 1,
      last_updated: '2026-10-09 18:00:00',
      risk_level: 'low',
      notes: 'حي الرياض، تسليم ممتاز.',
    },
    {
      id: 'ord_119',
      tracking: 'SD-TET-33192',
      client_name: 'عادل البرنوصي',
      client_phone: '+212666102938',
      city: 'تطوان',
      status: 'Livré',
      previous_status: 'En cours de livraison',
      attempt_count: 1,
      last_updated: '2026-10-09 15:30:00',
      risk_level: 'low',
      notes: 'وسط تطوان، تم التسليم.',
    },
    {
      id: 'ord_120',
      tracking: 'SD-CAS-22190',
      client_name: 'ليلى بنسودة',
      client_phone: '+212671029384',
      city: 'الدار البيضاء',
      status: 'En attente',
      previous_status: '',
      attempt_count: 0,
      last_updated: '2026-10-09 12:00:00',
      risk_level: 'low',
      notes: 'طلب جديد تم استقباله عبر Sendit، في انتظار خروج الموزع.',
    },
  ];

  const insertOrder = db.prepare(`
    INSERT INTO orders (id, tracking, client_name, client_phone, city, status, previous_status, attempt_count, last_updated, risk_level, notes)
    VALUES (@id, @tracking, @client_name, @client_phone, @city, @status, @previous_status, @attempt_count, @last_updated, @risk_level, @notes)
  `);

  const insertEvent = db.prepare(`
    INSERT INTO events (order_id, tracking, event_type, old_status, new_status, raw_payload, received_at)
    VALUES (?, ?, 'status_update', ?, ?, ?, ?)
  `);

  for (const o of initialOrders) {
    insertOrder.run(o);
    insertEvent.run(o.id, o.tracking, o.previous_status, o.status, JSON.stringify(o), o.last_updated);
  }

  // Seed Alerts
  const initialAlerts = [
    {
      order_id: 'ord_106',
      tracking: 'SD-FES-33821',
      alert_type: 'risk',
      priority: 'critical',
      message: '🚨 تنبيه حرج: الطرد SD-FES-33821 بلغ 3 محاولات فاشلة للزبونة نادية السملالي بفاس - مطلوب إرسال رسالة واتساب عاجلة قبل الإرجاع!',
      is_read: 0,
      created_at: '2026-10-12 11:15:00',
    },
    {
      order_id: 'ord_104',
      tracking: 'SD-TNG-50192',
      alert_type: 'risk',
      priority: 'high',
      message: '⚠️ تنبيه رفض: تم رفض استلام الطرد SD-TNG-50192 من فاطمة الزهراء العلمي بطنجة. نسبة استرجاع مقترحة 65% عبر Gemini AI.',
      is_read: 0,
      created_at: '2026-10-12 13:25:00',
    },
    {
      order_id: 'ord_103',
      tracking: 'SD-CAS-71934',
      alert_type: 'risk',
      priority: 'high',
      message: '⏰ تنبيه تأجيل متكرر: الزبون عمر البقالي (الدار البيضاء) طلب التأجيل لمرة ثانية. موعد متوقع: الأربعاء 17:00.',
      is_read: 0,
      created_at: '2026-10-12 14:20:00',
    },
    {
      order_id: 'ord_110',
      tracking: 'SD-RAB-66291',
      alert_type: 'risk',
      priority: 'medium',
      message: '📦 محاولة استرجاع: هدى الصنهاجي (الرباط) رفضت الطرد بسبب تأخير الشحن. تم إرسال اعتذار وخصم 10%.',
      is_read: 1,
      created_at: '2026-10-11 16:45:00',
    },
    {
      order_id: 'ord_113',
      tracking: 'SD-OFR-33019',
      alert_type: 'risk',
      priority: 'critical',
      message: '❌ طرد مُعاد للمستودع: ياسين الورديغي (وجدة) لم يستجب لـ 4 اتصالات هاتفية.',
      is_read: 1,
      created_at: '2026-10-11 11:05:00',
    },
  ];

  const insertAlert = db.prepare(`
    INSERT INTO alerts (order_id, tracking, alert_type, priority, message, is_read, created_at)
    VALUES (@order_id, @tracking, @alert_type, @priority, @message, @is_read, @created_at)
  `);

  for (const a of initialAlerts) {
    insertAlert.run(a);
  }

  // Seed WhatsApp Messages
  const initialMessages = [
    {
      order_id: 'ord_103',
      client_phone: '+212670192837',
      message_text: 'السلام عليكم سي عمر 📦 معكم فريق التوصيل بخصوص طلبيتكم SD-CAS-71934. توصلنا بطلب تأجيل الموعد ليوم الأربعاء بعد 5 مساءً. واش كتاكد لينا هاد التوقيت باش نوجدو الموزع؟ شكراً بزاف!',
      language: 'ar',
      status: 'pending',
      sent_at: null,
      created_at: '2026-10-12 14:18:00',
      generated_by: 'ai',
    },
    {
      order_id: 'ord_104',
      client_phone: '+212664829103',
      message_text: 'أهلاً لالة فاطمة الزهراء 🌸 لاحظنا أنكِ رفضتِ استلام طردك SD-TNG-50192. واش كان شي مشكل فالمقاس أو اللون؟ نقدرو نبدلوه ليك مجاناً وبدون أي مصاريف إضافية! كيف كتفضلي؟',
      language: 'ar',
      status: 'pending',
      sent_at: null,
      created_at: '2026-10-12 13:22:00',
      generated_by: 'ai',
    },
    {
      order_id: 'ord_106',
      client_phone: '+212663984120',
      message_text: 'السلام عليكم لالة نادية، الموزع حاول الاتصال بك بخصوص طردك SD-FES-33821 ولكن الخط مشغول. عافاك واش نقدرو نحددو وقت مناسب للتسليم في فاس اليوم؟',
      language: 'ar',
      status: 'pending',
      sent_at: null,
      created_at: '2026-10-12 11:12:00',
      generated_by: 'ai',
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
      generated_by: 'ai',
    },
    {
      order_id: 'ord_101',
      client_phone: '+212661849201',
      message_text: 'السلام عليكم سي كريم 📦 كنشكروك على استلام طلبيتك SD-CAS-94021 وكنتمنى تنال إعجابك! إذا كان عندك أي استفسار فريقنا في الخدمة ديماً.',
      language: 'ar',
      status: 'sent',
      whatsapp_message_id: 'wamid_HBgLMjEyNjYxODQ5MjAx',
      sent_at: '2026-10-12 16:35:00',
      created_at: '2026-10-12 16:32:00',
      generated_by: 'ai',
    },
    {
      order_id: 'ord_110',
      client_phone: '+212662019283',
      message_text: 'Bonjour Mme Houda, nous sommes désolés pour le retard sur votre commande SD-RAB-66291. Nous vous offrons -10% immédiat et une livraison prioritaire aujourd\'hui.',
      language: 'fr',
      status: 'sent',
      whatsapp_message_id: 'wamid_HBgLMjEyNjYyMDE5Mjgz',
      sent_at: '2026-10-11 16:50:00',
      created_at: '2026-10-11 16:42:00',
      generated_by: 'ai',
    },
  ];

  const insertMessage = db.prepare(`
    INSERT INTO messages (order_id, client_phone, message_text, language, status, whatsapp_message_id, sent_at, created_at, generated_by)
    VALUES (@order_id, @client_phone, @message_text, @language, @status, @whatsapp_message_id, @sent_at, @created_at, @generated_by)
  `);

  for (const m of initialMessages) {
    insertMessage.run({
      order_id: m.order_id,
      client_phone: m.client_phone,
      message_text: m.message_text,
      language: m.language,
      status: m.status,
      whatsapp_message_id: (m as any).whatsapp_message_id ?? null,
      sent_at: (m as any).sent_at ?? null,
      created_at: m.created_at,
      generated_by: m.generated_by,
    });
  }
}
