// src/app/api/sendit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pushDeliveryToSendit, syncSenditDeliveries, MOROCCAN_DISTRICTS } from '@/lib/sendit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (type === 'districts') {
    return NextResponse.json({ districts: MOROCCAN_DISTRICTS });
  }

  return NextResponse.json({
    status: 'Sendit API Ready',
    districtsCount: MOROCCAN_DISTRICTS.length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'push';

    if (action === 'push') {
      const { clientName, clientPhone, city, address, price, productNote, allowOpen, canTry, orderReference } = body;

      if (!clientName || !clientPhone || !city) {
        return NextResponse.json({ error: 'الرجاء إدخال اسم العميل، الهاتف، والمدينة' }, { status: 400 });
      }

      const result = await pushDeliveryToSendit({
        clientName,
        clientPhone,
        city,
        address: address || '',
        price: Number(price || 0),
        productNote,
        allowOpen: !!allowOpen,
        canTry: !!canTry,
        orderReference,
      });

      return NextResponse.json(result);
    }

    if (action === 'sync') {
      const result = await syncSenditDeliveries();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Sendit API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
