import { NextRequest, NextResponse } from 'next/server';
import { dbQueryOne } from '@/lib/db';
import { verifyPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await dbQueryOne<any>('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    if (!user) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const token = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء تسجيل الدخول' }, { status: 500 });
  }
}
