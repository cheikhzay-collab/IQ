// src/app/api/seed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { forceSeedDatabase } from '@/lib/seed';
import { dbExecute } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'clear') {
      // Clear all dummy records, keep users and settings
      await dbExecute('DELETE FROM events');
      await dbExecute('DELETE FROM messages');
      await dbExecute('DELETE FROM alerts');
      await dbExecute('DELETE FROM orders');
      return NextResponse.json({ 
        success: true, 
        cleared: true, 
        message: 'تم تفريغ جميع البيانات التجريبية بنجاح، المنصة الآن في وضع العمل الفعلي 100%' 
      });
    }

    await forceSeedDatabase();
    return NextResponse.json({ success: true, message: 'Database successfully seeded with sample delivery data!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await dbExecute('DELETE FROM events');
    await dbExecute('DELETE FROM messages');
    await dbExecute('DELETE FROM alerts');
    await dbExecute('DELETE FROM orders');
    return NextResponse.json({ success: true, cleared: true, message: 'Production database clean' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Seed API ready' });
}

