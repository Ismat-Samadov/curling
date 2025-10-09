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
    const targetUserId = parseInt(id);

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: 'Yanlış ID' }, { status: 400 });
    }

    // Cannot delete own account
    if (targetUserId === userId) {
      return NextResponse.json({ error: 'Öz hesabınızı silə bilməzsiniz' }, { status: 400 });
    }

    // Get all boards for this user (to delete their images)
    const boards = await db
      .select()
      .from(adPostings)
      .where(eq(adPostings.userId, targetUserId));

    // Delete all images associated with user's boards
    for (const board of boards) {
      // Delete thumbnail image
      if (board.thumbnailImage && board.thumbnailImage.startsWith('/uploads/')) {
        const thumbnailPath = join(process.cwd(), 'public', board.thumbnailImage);
        try {
          await unlink(thumbnailPath);
        } catch (error) {
          console.error('Error deleting thumbnail:', error);
        }
      }

      // Delete all board images
      if (board.images && Array.isArray(board.images)) {
        for (const image of board.images) {
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

      // Delete statistics for this board
      await db.delete(statistics).where(eq(statistics.listingId, board.id));
    }

    // Delete all boards
    await db.delete(adPostings).where(eq(adPostings.userId, targetUserId));

    // Delete user account
    await db.delete(users).where(eq(users.id, targetUserId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
