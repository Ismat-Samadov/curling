import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function setAuthCookie(userId: number) {
  const cookieStore = await cookies();
  // In production, you should use a proper JWT or session token
  // For now, we'll use a simple cookie with the user ID
  cookieStore.set('user_id', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getAuthUser(): Promise<number | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id');
  return userId ? parseInt(userId.value) : null;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
}
