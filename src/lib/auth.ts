import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SESSION_SECRET = process.env.SESSION_SECRET || 'deliveryiq_secret_salt_2026_super_secure';
export const COOKIE_NAME = 'deliveryiq_session';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
  } catch {
    return false;
  }
}

export interface SessionData {
  userId: number | string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

export function createSessionToken(user: { id: number | string; email: string; name: string; role: string }): string {
  const data: SessionData = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };

  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    if (signature !== expectedSig) return null;

    const data: SessionData = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (Date.now() > data.exp) return null;

    return data;
  } catch {
    return null;
  }
}

export async function getSessionUser(req?: NextRequest): Promise<SessionData | null> {
  let token = '';

  if (req) {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = req.cookies.get(COOKIE_NAME)?.value || '';
    }
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value || '';
    } catch {
      // not in a server component context
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}
