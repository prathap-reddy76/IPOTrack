import 'server-only';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function getSecret(): string {
  return process.env['JWT_SECRET'] || process.env['NEXTAUTH_SECRET'] || 'fallback-secret-change-me';
}

export async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('ipotrack-token')?.value;
  
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify signature
    const signature = crypto.createHmac('sha256', getSecret())
                            .update(`${headerB64}.${payloadB64}`)
                            .digest('base64url');
                            
    if (signature !== signatureB64) {
      return null;
    }

    // Decode payload
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return (payload.userId as string) || (payload.id as string) || null;
  } catch {
    return null;
  }
}
