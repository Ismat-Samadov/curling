import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'E-poçt, şifrə və ad tələb olunur' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifrə ən azı 6 simvol olmalıdır' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Bu e-poçt artıq qeydiyyatdan keçib' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const newUser = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone: phone || null,
      })
      .returning();

    // Create response with cookie
    const response = NextResponse.json({
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
      },
    }, { status: 201 });

    // Set auth cookie on response
    response.cookies.set('user_id', newUser[0].id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Qeydiyyat zamanı xəta baş verdi' },
      { status: 500 }
    );
  }
}
