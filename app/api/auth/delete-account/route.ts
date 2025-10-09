import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, adPostings, statistics } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE() {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json({ error: 'Autentifikasiya tələb olunur' }, { status: 401 });
    }

    // Get all boards for this user (to delete their images)
    const boards = await db
      .select()
      .from(adPostings)
      .where(eq(adPostings.userId, userId));

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
    await db.delete(adPostings).where(eq(adPostings.userId, userId));

    // Delete user account
    await db.delete(users).where(eq(users.id, userId));

    // Clear the auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Hesab uğurla silindi'
    });

    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Hesab silinərkən xəta baş verdi' },
      { status: 500 }
    );
  }
}
