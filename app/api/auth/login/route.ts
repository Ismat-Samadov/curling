import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { verifyPassword, setAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-poçt və şifrə tələb olunur' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'E-poçt və ya şifrə yanlışdır' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user[0].passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'E-poçt və ya şifrə yanlışdır' },
        { status: 401 }
      );
    }

    // Set auth cookie
    await setAuthCookie(user[0].id);

    return NextResponse.json({
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Giriş zamanı xəta baş verdi' },
      { status: 500 }
    );
  }
}
