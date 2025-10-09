import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, adPostings } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const boardId = parseInt(id);
    const body = await request.json();
    const { field, value } = body;

    if (isNaN(boardId)) {
      return NextResponse.json({ error: 'Yanlış ID' }, { status: 400 });
    }

    if (field !== 'isActive' && field !== 'isAvailable') {
      return NextResponse.json({ error: 'Yanlış sahə' }, { status: 400 });
    }

    // Update board status
    const updateData: any = { updatedAt: new Date() };
    updateData[field] = value;

    await db
      .update(adPostings)
      .set(updateData)
      .where(eq(adPostings.id, boardId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling board status:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
