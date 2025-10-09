import { Metadata } from 'next';
import { db } from '@/lib/db';
import { adPostings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateMetadata as genMeta, generateListingSchema, generateBreadcrumbSchema } from '@/lib/seo';

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const boardId = parseInt(id);

  try {
    const board = await db
      .select()
      .from(adPostings)
      .where(eq(adPostings.id, boardId))
      .limit(1);

    if (!board || board.length === 0) {
      return genMeta({
        title: 'Lövhə Tapılmadı',
        description: 'Axtardığınız reklam lövhəsi tapılmadı.',
        noindex: true,
      });
    }

    const listing = board[0];
    const area = (listing.width * listing.height).toFixed(1);
    const pricePerDay = (listing.pricePerDay / 100).toFixed(0);

    return genMeta({
      title: listing.title,
      description: `${listing.description.substring(0, 150)}... | ${listing.city}, ${listing.address} | Ölçü: ${listing.width}m × ${listing.height}m (${area} m²) | Qiymət: ${pricePerDay}₼/gün`,
      keywords: [
        listing.title,
        `${listing.boardType} reklam`,
        `${listing.city} billboard`,
        `${listing.city} reklam lövhəsi`,
        listing.address,
        `${listing.width}x${listing.height} billboard`,
        `${area} m² reklam`,
      ],
      image: listing.thumbnailImage || '/og-image.jpg',
      url: `/boards/${listing.id}`,
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return genMeta({
      title: 'Reklam Lövhəsi',
      description: 'Azərbaycanda reklam lövhələri və billboard kirayəsi',
    });
  }
}

export default async function BoardLayout({ params, children }: Props) {
  const { id } = await params;
  const boardId = parseInt(id);

  let listingSchema = null;
  let breadcrumbSchema = null;

  try {
    const board = await db
      .select()
      .from(adPostings)
      .where(eq(adPostings.id, boardId))
      .limit(1);

    if (board && board.length > 0) {
      const listing = board[0];

      // Generate structured data
      listingSchema = generateListingSchema({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        pricePerDay: listing.pricePerDay,
        pricePerWeek: listing.pricePerWeek,
        pricePerMonth: listing.pricePerMonth,
        city: listing.city,
        address: listing.address,
        latitude: listing.latitude,
        longitude: listing.longitude,
        width: listing.width,
        height: listing.height,
        boardType: listing.boardType,
        thumbnailImage: listing.thumbnailImage || '/og-image.jpg',
        ownerName: listing.ownerName,
        ownerPhone: listing.ownerPhone,
        createdAt: listing.createdAt.toISOString(),
      });

      // Generate breadcrumb
      breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Ana Səhifə', url: '/' },
        { name: 'Lövhələr', url: '/boards' },
        { name: listing.title, url: `/boards/${listing.id}` },
      ]);
    }
  } catch (error) {
    console.error('Error loading board data for layout:', error);
  }

  return (
    <>
      {listingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {children}
    </>
  );
}
