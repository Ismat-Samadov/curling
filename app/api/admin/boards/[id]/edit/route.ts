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

    if (isNaN(boardId)) {
      return NextResponse.json({ error: 'Yanlış ID' }, { status: 400 });
    }

    // Validate the board exists
    const existingBoard = await db
      .select()
      .from(adPostings)
      .where(eq(adPostings.id, boardId))
      .limit(1);

    if (existingBoard.length === 0) {
      return NextResponse.json({ error: 'Lövhə tapılmadı' }, { status: 404 });
    }

    // Update board with provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    const allowedFields = [
      'title', 'description', 'latitude', 'longitude', 'address', 'city', 'country',
      'width', 'height', 'boardType', 'images', 'thumbnailImage',
      'pricePerDay', 'pricePerWeek', 'pricePerMonth',
      'ownerName', 'ownerEmail', 'ownerPhone',
      'isActive', 'isAvailable'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    await db
      .update(adPostings)
      .set(updateData)
      .where(eq(adPostings.id, boardId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
