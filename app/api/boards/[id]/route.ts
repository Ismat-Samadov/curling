import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adPostings } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// GET /api/boards/[id] - Get a single ad posting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const boardId = parseInt(id);

    const board = await db.select()
      .from(adPostings)
      .where(eq(adPostings.id, boardId))
      .limit(1);

    if (board.length === 0) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.update(adPostings)
      .set({ viewCount: sql`${adPostings.viewCount} + 1` })
      .where(eq(adPostings.id, boardId));

    return NextResponse.json({ board: board[0] });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

// PUT /api/boards/[id] - Update an ad posting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const boardId = parseInt(id);
    const body = await request.json();

    const updatedBoard = await db.update(adPostings)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(adPostings.id, boardId))
      .returning();

    if (updatedBoard.length === 0) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ board: updatedBoard[0] });
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[id] - Delete an ad posting (soft delete by setting isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const boardId = parseInt(id);

    const deletedBoard = await db.update(adPostings)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(adPostings.id, boardId))
      .returning();

    if (deletedBoard.length === 0) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}
