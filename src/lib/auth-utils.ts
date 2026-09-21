import 'server-only';
import { hash, compare } from 'bcryptjs';
import crypto from 'crypto';

function getSecret(): string {
  return process.env['JWT_SECRET'] || process.env['NEXTAUTH_SECRET'] || 'fallback-secret-change-me';
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

function base64url(str: string | Buffer): string {
  const buf = typeof str === 'string' ? Buffer.from(str) : str;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function createToken(payload: { userId: string; email: string }): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  // Set expiry to 7 days from now
  const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
  const jwtPayload = { ...payload, exp };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(jwtPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  const signature = crypto.createHmac('sha256', getSecret()).update(signatureInput).digest();
  const encodedSignature = base64url(signature);

  return `${signatureInput}.${encodedSignature}`;
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    
    const signature = crypto.createHmac('sha256', getSecret()).update(signatureInput).digest();
    const expectedSignature = base64url(signature);
    
    if (encodedSignature !== expectedSignature) {
      return null;
    }
    
    const payloadBuffer = Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    const payload = JSON.parse(payloadBuffer.toString('utf-8'));
    
    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/ipotrack-token=([^;]+)/);
  return match ? match[1] : null;
}
