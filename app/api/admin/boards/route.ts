import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, adPostings } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

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

    // Get all boards with user information
    const allBoards = await db
      .select({
        id: adPostings.id,
        title: adPostings.title,
        description: adPostings.description,
        city: adPostings.city,
        boardType: adPostings.boardType,
        thumbnailImage: adPostings.thumbnailImage,
        pricePerDay: adPostings.pricePerDay,
        isActive: adPostings.isActive,
        isAvailable: adPostings.isAvailable,
        createdAt: adPostings.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(adPostings)
      .leftJoin(users, eq(adPostings.userId, users.id))
      .orderBy(adPostings.createdAt);

    const boardsWithUser = allBoards.map(b => ({
      id: b.id,
      title: b.title,
      description: b.description,
      city: b.city,
      boardType: b.boardType,
      thumbnailImage: b.thumbnailImage,
      pricePerDay: b.pricePerDay,
      isActive: b.isActive,
      isAvailable: b.isAvailable,
      createdAt: b.createdAt,
      user: {
        name: b.userName || 'Naməlum',
        email: b.userEmail || '-',
      },
    }));

    return NextResponse.json({ boards: boardsWithUser });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
