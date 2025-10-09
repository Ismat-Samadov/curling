import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adPostings } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json({ error: 'Daxil olmamısınız' }, { status: 401 });
    }

    const { id } = await params;
    const boardId = parseInt(id);

    if (isNaN(boardId)) {
      return NextResponse.json({ error: 'Yanlış ID' }, { status: 400 });
    }

    // Check if board belongs to user
    const board = await db
      .select()
      .from(adPostings)
      .where(and(eq(adPostings.id, boardId), eq(adPostings.userId, userId)))
      .limit(1);

    if (board.length === 0) {
      return NextResponse.json(
        { error: 'Lövhə tapılmadı və ya sizə aid deyil' },
        { status: 404 }
      );
    }

    // Delete the board
    await db.delete(adPostings).where(eq(adPostings.id, boardId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json({ error: 'Lövhə silinmədi' }, { status: 500 });
  }
}
