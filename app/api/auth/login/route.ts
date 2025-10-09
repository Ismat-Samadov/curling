import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { verifyPassword, generateToken } from '@/lib/auth';
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

    // Generate JWT token
    const token = generateToken(user[0].id, user[0].email);

    // Create response with cookie
    const response = NextResponse.json({
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
      },
    });

    // Set auth token cookie on response
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Giriş zamanı xəta baş verdi' },
      { status: 500 }
    );
  }
}
