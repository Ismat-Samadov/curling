import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, adPostings, statistics } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, count, gte, lte, sql, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json({ error: 'Daxil olmamısınız' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0] || !user[0].isAdmin) {
      return NextResponse.json({ error: 'İcazəniz yoxdur' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const now = new Date();
    const periodDays = parseInt(period);
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - periodDays);

    // === USER ANALYTICS ===

    // Total users
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // New users in period
    const newUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, startDate));
    const newUsers = newUsersResult[0]?.count || 0;

    // Users with listings
    const usersWithListingsResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${adPostings.userId})::int` })
      .from(adPostings)
      .where(sql`${adPostings.userId} IS NOT NULL`);
    const usersWithListings = usersWithListingsResult[0]?.count || 0;

    // User growth by day (last 30 days)
    const userGrowthData = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})::text`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // === LISTING ANALYTICS ===

    // Total listings
    const totalListingsResult = await db.select({ count: count() }).from(adPostings);
    const totalListings = totalListingsResult[0]?.count || 0;

    // Active listings
    const activeListingsResult = await db
      .select({ count: count() })
      .from(adPostings)
      .where(eq(adPostings.isActive, true));
    const activeListings = activeListingsResult[0]?.count || 0;

    // New listings in period
    const newListingsResult = await db
      .select({ count: count() })
      .from(adPostings)
      .where(gte(adPostings.createdAt, startDate));
    const newListings = newListingsResult[0]?.count || 0;

    // Listings by type
    const listingsByType = await db
      .select({
        type: adPostings.boardType,
        count: count(),
      })
      .from(adPostings)
      .groupBy(adPostings.boardType)
      .orderBy(desc(count()));

    // Listings by city (top 10)
    const listingsByCity = await db
      .select({
        city: adPostings.city,
        count: count(),
      })
      .from(adPostings)
      .groupBy(adPostings.city)
      .orderBy(desc(count()))
      .limit(10);

    // Listing growth by day
    const listingGrowthData = await db
      .select({
        date: sql<string>`DATE(${adPostings.createdAt})::text`,
        count: count(),
      })
      .from(adPostings)
      .where(gte(adPostings.createdAt, startDate))
      .groupBy(sql`DATE(${adPostings.createdAt})`)
      .orderBy(sql`DATE(${adPostings.createdAt})`);

    // === ENGAGEMENT ANALYTICS ===

    // Total views
    const totalViewsResult = await db
      .select({ count: count() })
      .from(statistics)
      .where(eq(statistics.eventType, 'view'));
    const totalViews = totalViewsResult[0]?.count || 0;

    // Total phone reveals
    const totalPhoneRevealsResult = await db
      .select({ count: count() })
      .from(statistics)
      .where(eq(statistics.eventType, 'phone_reveal'));
    const totalPhoneReveals = totalPhoneRevealsResult[0]?.count || 0;

    // Views in period
    const viewsInPeriodResult = await db
      .select({ count: count() })
      .from(statistics)
      .where(and(
        eq(statistics.eventType, 'view'),
        gte(statistics.createdAt, startDate)
      ));
    const viewsInPeriod = viewsInPeriodResult[0]?.count || 0;

    // Phone reveals in period
    const phoneRevealsInPeriodResult = await db
      .select({ count: count() })
      .from(statistics)
      .where(and(
        eq(statistics.eventType, 'phone_reveal'),
        gte(statistics.createdAt, startDate)
      ));
    const phoneRevealsInPeriod = phoneRevealsInPeriodResult[0]?.count || 0;

    // Conversion rate (phone reveals / views)
    const conversionRate = totalViews > 0
      ? ((totalPhoneReveals / totalViews) * 100).toFixed(2)
      : '0.00';

    // Engagement by day
    const engagementByDay = await db
      .select({
        date: sql<string>`DATE(${statistics.createdAt})::text`,
        views: sql<number>`SUM(CASE WHEN ${statistics.eventType} = 'view' THEN 1 ELSE 0 END)::int`,
        phoneReveals: sql<number>`SUM(CASE WHEN ${statistics.eventType} = 'phone_reveal' THEN 1 ELSE 0 END)::int`,
      })
      .from(statistics)
      .where(gte(statistics.createdAt, startDate))
      .groupBy(sql`DATE(${statistics.createdAt})`)
      .orderBy(sql`DATE(${statistics.createdAt})`);

    // Top performing listings
    const topListings = await db
      .select({
        listingId: statistics.listingId,
        title: adPostings.title,
        views: sql<number>`COUNT(CASE WHEN ${statistics.eventType} = 'view' THEN 1 END)::int`,
        phoneReveals: sql<number>`COUNT(CASE WHEN ${statistics.eventType} = 'phone_reveal' THEN 1 END)::int`,
      })
      .from(statistics)
      .leftJoin(adPostings, eq(statistics.listingId, adPostings.id))
      .groupBy(statistics.listingId, adPostings.title)
      .orderBy(desc(sql`COUNT(CASE WHEN ${statistics.eventType} = 'view' THEN 1 END)`))
      .limit(10);

    // === REVENUE ANALYTICS ===

    // Average price per day
    const avgPriceResult = await db
      .select({
        avg: sql<number>`AVG(${adPostings.pricePerDay})::int`,
      })
      .from(adPostings)
      .where(eq(adPostings.isActive, true));
    const avgPricePerDay = avgPriceResult[0]?.avg || 0;

    // Total potential revenue (all active listings per day)
    const totalRevenueResult = await db
      .select({
        total: sql<number>`SUM(${adPostings.pricePerDay})::int`,
      })
      .from(adPostings)
      .where(eq(adPostings.isActive, true));
    const totalDailyRevenue = totalRevenueResult[0]?.total || 0;

    // Price distribution by board type
    const priceByType = await db
      .select({
        type: adPostings.boardType,
        avgPrice: sql<number>`AVG(${adPostings.pricePerDay})::int`,
        minPrice: sql<number>`MIN(${adPostings.pricePerDay})::int`,
        maxPrice: sql<number>`MAX(${adPostings.pricePerDay})::int`,
        count: count(),
      })
      .from(adPostings)
      .groupBy(adPostings.boardType)
      .orderBy(desc(sql`AVG(${adPostings.pricePerDay})`));

    // === ACTIVITY METRICS ===

    // Most active users (by listing count)
    const mostActiveUsers = await db
      .select({
        userId: adPostings.userId,
        userName: users.name,
        userEmail: users.email,
        listingCount: count(),
      })
      .from(adPostings)
      .leftJoin(users, eq(adPostings.userId, users.id))
      .where(sql`${adPostings.userId} IS NOT NULL`)
      .groupBy(adPostings.userId, users.name, users.email)
      .orderBy(desc(count()))
      .limit(10);

    // Recent activity (last 10 events)
    const recentActivity = await db
      .select({
        id: statistics.id,
        listingId: statistics.listingId,
        eventType: statistics.eventType,
        createdAt: statistics.createdAt,
        listingTitle: adPostings.title,
      })
      .from(statistics)
      .leftJoin(adPostings, eq(statistics.listingId, adPostings.id))
      .orderBy(desc(statistics.createdAt))
      .limit(20);

    // === SUMMARY METRICS ===

    const analytics = {
      summary: {
        totalUsers,
        newUsers,
        usersWithListings,
        userEngagementRate: totalUsers > 0 ? ((usersWithListings / totalUsers) * 100).toFixed(2) : '0.00',
        totalListings,
        activeListings,
        newListings,
        inactiveListings: totalListings - activeListings,
        totalViews,
        totalPhoneReveals,
        viewsInPeriod,
        phoneRevealsInPeriod,
        conversionRate,
        avgPricePerDay: (avgPricePerDay / 100).toFixed(0),
        totalDailyRevenue: (totalDailyRevenue / 100).toFixed(0),
        totalMonthlyRevenue: ((totalDailyRevenue * 30) / 100).toFixed(0),
      },
      growth: {
        users: userGrowthData,
        listings: listingGrowthData,
      },
      engagement: {
        byDay: engagementByDay,
        topListings,
      },
      distribution: {
        listingsByType,
        listingsByCity,
        priceByType: priceByType.map(p => ({
          ...p,
          avgPrice: (p.avgPrice / 100).toFixed(0),
          minPrice: (p.minPrice / 100).toFixed(0),
          maxPrice: (p.maxPrice / 100).toFixed(0),
        })),
      },
      activity: {
        mostActiveUsers,
        recentActivity,
      },
      period: {
        days: periodDays,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      },
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
