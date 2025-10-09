import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, adPostings, statistics } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
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

    if (isNaN(boardId)) {
      return NextResponse.json({ error: 'Yanlış ID' }, { status: 400 });
    }

    // Get board data
    const board = await db
      .select()
      .from(adPostings)
      .where(eq(adPostings.id, boardId))
      .limit(1);

    if (board.length === 0) {
      return NextResponse.json({ error: 'Lövhə tapılmadı' }, { status: 404 });
    }

    // Delete images
    const boardData = board[0];

    // Delete thumbnail image
    if (boardData.thumbnailImage && boardData.thumbnailImage.startsWith('/uploads/')) {
      const thumbnailPath = join(process.cwd(), 'public', boardData.thumbnailImage);
      try {
        await unlink(thumbnailPath);
      } catch (error) {
        console.error('Error deleting thumbnail:', error);
      }
    }

    // Delete all board images
    if (boardData.images && Array.isArray(boardData.images)) {
      for (const image of boardData.images) {
        if (image && image.startsWith('/uploads/')) {
          const imagePath = join(process.cwd(), 'public', image);
          try {
            await unlink(imagePath);
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        }
      }
    }

    // Delete statistics
    await db.delete(statistics).where(eq(statistics.listingId, boardId));

    // Delete board
    await db.delete(adPostings).where(eq(adPostings.id, boardId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
