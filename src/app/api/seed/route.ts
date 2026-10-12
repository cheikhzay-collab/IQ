// src/app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { forceSeedDatabase } from '@/lib/seed';

export async function POST() {
  try {
    forceSeedDatabase();
    return NextResponse.json({ success: true, message: 'Database successfully seeded with realistic sample delivery data!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    forceSeedDatabase();
    return NextResponse.json({ success: true, message: 'Database reset and seeded' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
