import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, adPostings } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json({ error: 'Daxil olmamısınız' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0] || !user[0].isAdmin) {
      return NextResponse.json({ error: 'İcazəniz yoxdur' }, { status: 403 });
    }

    // Get all users with board counts
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
        boardCount: sql<number>`COUNT(${adPostings.id})::int`,
      })
      .from(users)
      .leftJoin(adPostings, eq(users.id, adPostings.userId))
      .groupBy(users.id)
      .orderBy(users.createdAt);

    const usersWithCounts = allUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
      _count: {
        boards: u.boardCount || 0,
      },
    }));

    return NextResponse.json({ users: usersWithCounts });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
