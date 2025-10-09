import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adPostings } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json({ error: 'Daxil olmamısınız' }, { status: 401 });
    }

    const userBoards = await db
      .select()
      .from(adPostings)
      .where(eq(adPostings.userId, userId));

    return NextResponse.json({ boards: userBoards });
  } catch (error) {
    console.error('Error fetching user boards:', error);
    return NextResponse.json({ error: 'Lövhələr yüklənmədi' }, { status: 500 });
  }
}
