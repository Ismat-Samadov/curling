import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, adPostings, statistics } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, inArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json({ error: 'Daxil olmamısınız' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!adminUser[0] || !adminUser[0].isAdmin) {
      return NextResponse.json({ error: 'İcazəniz yoxdur' }, { status: 403 });
    }

    const body = await request.json();
    const { boardIds, action, value } = body;

    if (!Array.isArray(boardIds) || boardIds.length === 0) {
      return NextResponse.json({ error: 'Heç bir lövhə seçilməyib' }, { status: 400 });
    }

    const validBoardIds = boardIds.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));

    if (validBoardIds.length === 0) {
      return NextResponse.json({ error: 'Yanlış ID-lər' }, { status: 400 });
    }

    switch (action) {
      case 'activate':
        await db
          .update(adPostings)
          .set({ isActive: true, updatedAt: new Date() })
          .where(inArray(adPostings.id, validBoardIds));
        break;

      case 'deactivate':
        await db
          .update(adPostings)
          .set({ isActive: false, updatedAt: new Date() })
          .where(inArray(adPostings.id, validBoardIds));
        break;

      case 'makeAvailable':
        await db
          .update(adPostings)
          .set({ isAvailable: true, updatedAt: new Date() })
          .where(inArray(adPostings.id, validBoardIds));
        break;

      case 'makeUnavailable':
        await db
          .update(adPostings)
          .set({ isAvailable: false, updatedAt: new Date() })
          .where(inArray(adPostings.id, validBoardIds));
        break;

      case 'delete':
        // Delete statistics first
        await db.delete(statistics).where(inArray(statistics.listingId, validBoardIds));
        // Delete boards
        await db.delete(adPostings).where(inArray(adPostings.id, validBoardIds));
        break;

      default:
        return NextResponse.json({ error: 'Yanlış əməliyyat' }, { status: 400 });
    }

    return NextResponse.json({ success: true, affected: validBoardIds.length });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
