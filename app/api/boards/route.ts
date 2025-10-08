import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adPostings, customers } from '@/lib/db/schema';
import { desc, sql, and, gte, lte, eq } from 'drizzle-orm';

// GET /api/boards - Get all ad postings with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const minLat = searchParams.get('minLat');
    const maxLat = searchParams.get('maxLat');
    const minLng = searchParams.get('minLng');
    const maxLng = searchParams.get('maxLng');

    let query = db.select().from(adPostings).where(sql`is_active = true`);

    // Apply filters if provided
    const conditions = [];

    if (city) {
      conditions.push(sql`LOWER(city) = LOWER(${city})`);
    }

    if (minLat && maxLat && minLng && maxLng) {
      conditions.push(
        and(
          gte(adPostings.latitude, parseFloat(minLat)),
          lte(adPostings.latitude, parseFloat(maxLat)),
          gte(adPostings.longitude, parseFloat(minLng)),
          lte(adPostings.longitude, parseFloat(maxLng))
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allBoards = await query.orderBy(desc(adPostings.createdAt));

    return NextResponse.json({ boards: allBoards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create a new ad posting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.title || !body.latitude || !body.longitude || !body.ownerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Optionally create/update customer record
    if (body.ownerPhone) {
      const existingCustomer = await db.select()
        .from(customers)
        .where(eq(customers.phone, body.ownerPhone))
        .limit(1);

      if (existingCustomer.length === 0) {
        await db.insert(customers).values({
          name: body.ownerName,
          phone: body.ownerPhone,
          email: body.ownerEmail,
        });
      }
    }

    const newBoard = await db.insert(adPostings).values({
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
      images: body.images || [],
      thumbnailImage: body.thumbnailImage,
      pricePerDay: body.pricePerDay,
      pricePerWeek: body.pricePerWeek,
      pricePerMonth: body.pricePerMonth,
      ownerName: body.ownerName,
      ownerEmail: body.ownerEmail,
      ownerPhone: body.ownerPhone,
      customerPhone: body.ownerPhone,
    }).returning();

    return NextResponse.json({ board: newBoard[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}
