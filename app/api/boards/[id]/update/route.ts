import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adPostings } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function PUT(
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

    const body = await request.json();

    // Check if board belongs to user
    const existingBoard = await db
      .select()
      .from(adPostings)
      .where(and(eq(adPostings.id, boardId), eq(adPostings.userId, userId)))
      .limit(1);

    if (existingBoard.length === 0) {
      return NextResponse.json(
        { error: 'Lövhə tapılmadı və ya sizə aid deyil' },
        { status: 404 }
      );
    }

    // Update the board
    const updated = await db
      .update(adPostings)
      .set({
        title: body.title,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address,
        city: body.city,
        country: body.country,
        width: body.width,
        height: body.height,
        boardType: body.boardType,
        images: body.images,
        thumbnailImage: body.thumbnailImage,
        pricePerDay: body.pricePerDay,
        pricePerWeek: body.pricePerWeek,
        pricePerMonth: body.pricePerMonth,
        ownerName: body.ownerName,
        ownerEmail: body.ownerEmail,
        ownerPhone: body.ownerPhone,
        updatedAt: new Date(),
      })
      .where(eq(adPostings.id, boardId))
      .returning();

    return NextResponse.json({ board: updated[0] });
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json({ error: 'Lövhə yenilənmədi' }, { status: 500 });
  }
}
