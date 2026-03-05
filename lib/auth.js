import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createSession(userData) {
  const token = await new SignJWT(userData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token');

  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    if (payload.role === 'admin') {
      return payload;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token');

  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    return payload;
  } catch (error) {
    return false;
  }
}