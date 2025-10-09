import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, adPostings, statistics } from '@/lib/db/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'users';

    let csvData = '';
    let filename = '';

    switch (type) {
      case 'users':
        const allUsers = await db.select().from(users);

        // CSV header
        csvData = 'ID,Ad,E-poçt,Telefon,Admin,Yaradılma Tarixi,Elan Sayı\n';

        // Get board count for each user
        for (const user of allUsers) {
          const boardCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(adPostings)
            .where(eq(adPostings.userId, user.id));

          csvData += `${user.id},"${user.name}","${user.email}","${user.phone || ''}",${user.isAdmin ? 'Bəli' : 'Xeyr'},"${user.createdAt.toISOString()}",${boardCount[0]?.count || 0}\n`;
        }

        filename = `users-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'boards':
        const allBoards = await db
          .select({
            board: adPostings,
            user: users,
          })
          .from(adPostings)
          .leftJoin(users, eq(adPostings.userId, users.id));

        // CSV header
        csvData = 'ID,Başlıq,Şəhər,Növ,Ölçü,Günlük Qiymət,Aktiv,Mövcud,Sahibi,E-poçt,Yaradılma Tarixi\n';

        for (const { board, user } of allBoards) {
          const price = (board.pricePerDay / 100).toFixed(2);
          const size = `${board.width}x${board.height}`;

          csvData += `${board.id},"${board.title}","${board.city}","${board.boardType}","${size}","${price} ₼",${board.isActive ? 'Bəli' : 'Xeyr'},${board.isAvailable ? 'Bəli' : 'Xeyr'},"${user?.name || ''}","${user?.email || ''}","${board.createdAt.toISOString()}"\n`;
        }

        filename = `boards-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'statistics':
        // Get aggregated statistics per listing
        const statsQuery = await db
          .select({
            listingId: statistics.listingId,
            title: adPostings.title,
            totalEvents: sql<number>`count(*)`,
            views: sql<number>`count(case when ${statistics.eventType} = 'view' then 1 end)`,
            phoneReveals: sql<number>`count(case when ${statistics.eventType} = 'phone_reveal' then 1 end)`,
          })
          .from(statistics)
          .leftJoin(adPostings, eq(statistics.listingId, adPostings.id))
          .groupBy(statistics.listingId, adPostings.title);

        // CSV header
        csvData = 'Elan ID,Elan Başlığı,Toplam Baxış,Telefon Açılması\n';

        for (const stat of statsQuery) {
          csvData += `${stat.listingId},"${stat.title || 'Naməlum'}",${stat.views},${stat.phoneReveals}\n`;
        }

        filename = `statistics-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      default:
        return NextResponse.json({ error: 'Yanlış növ' }, { status: 400 });
    }

    // Return CSV file
    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
