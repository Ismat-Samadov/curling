import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { statistics, adPostings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Helper function to hash IP for privacy
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex');
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, eventType } = body;

    // Validation
    if (!listingId || !eventType) {
      return NextResponse.json(
        { error: 'Listing ID və event type tələb olunur' },
        { status: 400 }
      );
    }

    if (eventType !== 'view' && eventType !== 'phone_reveal') {
      return NextResponse.json(
        { error: 'Yanlış event type' },
        { status: 400 }
      );
    }

    // Verify listing exists
    const listing = await db
      .select()
      .from(adPostings)
      .where(eq(adPostings.id, listingId))
      .limit(1);

    if (listing.length === 0) {
      return NextResponse.json(
        { error: 'Lövhə tapılmadı' },
        { status: 404 }
      );
    }

    // Get client info
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert statistics record
    await db.insert(statistics).values({
      listingId,
      eventType,
      ipHash,
      userAgent,
    });

    // If it's a view, also increment the view count on the listing
    if (eventType === 'view') {
      await db
        .update(adPostings)
        .set({
          viewCount: listing[0].viewCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(adPostings.id, listingId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking statistics:', error);
    return NextResponse.json(
      { error: 'Statistika yazılmadı' },
      { status: 500 }
    );
  }
}
