import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { statistics } from '@/lib/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const id = parseInt(listingId);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Yanlış ID' }, { status: 400 });
    }

    // Get total views
    const viewsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(statistics)
      .where(and(
        eq(statistics.listingId, id),
        eq(statistics.eventType, 'view')
      ));

    // Get total phone reveals
    const revealsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(statistics)
      .where(and(
        eq(statistics.listingId, id),
        eq(statistics.eventType, 'phone_reveal')
      ));

    // Get unique views (based on IP hash)
    const uniqueViewsResult = await db
      .select({ count: sql<number>`count(DISTINCT ip_hash)` })
      .from(statistics)
      .where(and(
        eq(statistics.listingId, id),
        eq(statistics.eventType, 'view')
      ));

    // Get views in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentViewsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(statistics)
      .where(and(
        eq(statistics.listingId, id),
        eq(statistics.eventType, 'view'),
        gte(statistics.createdAt, sevenDaysAgo)
      ));

    // Get views in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyViewsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(statistics)
      .where(and(
        eq(statistics.listingId, id),
        eq(statistics.eventType, 'view'),
        gte(statistics.createdAt, thirtyDaysAgo)
      ));

    return NextResponse.json({
      totalViews: Number(viewsResult[0]?.count || 0),
      uniqueViews: Number(uniqueViewsResult[0]?.count || 0),
      phoneReveals: Number(revealsResult[0]?.count || 0),
      last7Days: Number(recentViewsResult[0]?.count || 0),
      last30Days: Number(monthlyViewsResult[0]?.count || 0),
      conversionRate: Number(viewsResult[0]?.count || 0) > 0
        ? ((Number(revealsResult[0]?.count || 0) / Number(viewsResult[0]?.count || 0)) * 100).toFixed(2)
        : 0,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Statistika yüklənmədi' },
      { status: 500 }
    );
  }
}
