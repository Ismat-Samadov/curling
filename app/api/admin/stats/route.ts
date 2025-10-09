import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, adPostings, statistics } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, count, gte, sql } from 'drizzle-orm';

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

    // Get total users
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get total boards
    const totalBoardsResult = await db.select({ count: count() }).from(adPostings);
    const totalBoards = totalBoardsResult[0]?.count || 0;

    // Get active boards
    const activeBoardsResult = await db
      .select({ count: count() })
      .from(adPostings)
      .where(eq(adPostings.isActive, true));
    const activeBoards = activeBoardsResult[0]?.count || 0;

    // Get total views
    const totalViewsResult = await db
      .select({ count: count() })
      .from(statistics)
      .where(eq(statistics.eventType, 'view'));
    const totalViews = totalViewsResult[0]?.count || 0;

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, startOfMonth));
    const newUsersThisMonth = newUsersResult[0]?.count || 0;

    // Get new boards this month
    const newBoardsResult = await db
      .select({ count: count() })
      .from(adPostings)
      .where(gte(adPostings.createdAt, startOfMonth));
    const newBoardsThisMonth = newBoardsResult[0]?.count || 0;

    const stats = {
      totalUsers,
      totalBoards,
      activeBoards,
      totalViews,
      totalRevenue: 0,
      newUsersThisMonth,
      newBoardsThisMonth,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
