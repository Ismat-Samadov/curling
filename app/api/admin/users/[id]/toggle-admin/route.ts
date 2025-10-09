import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
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
    const targetUserId = parseInt(id);
    const body = await request.json();
    const { isAdmin } = body;

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: 'Yanlış ID' }, { status: 400 });
    }

    // Cannot modify own admin status
    if (targetUserId === userId) {
      return NextResponse.json({ error: 'Öz admin statusunuzu dəyişdirə bilməzsiniz' }, { status: 400 });
    }

    // Update user admin status
    await db
      .update(users)
      .set({ isAdmin, updatedAt: new Date() })
      .where(eq(users.id, targetUserId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling admin status:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
