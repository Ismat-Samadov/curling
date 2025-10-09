import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: user[0] });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ user: null });
  }
}
