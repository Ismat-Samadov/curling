import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { adPostings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { AZERBAIJAN_CITIES } from '@/lib/regions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://reklamyeri.az';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/boards`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Get all active board listings
  const boards = await db
    .select({
      id: adPostings.id,
      updatedAt: adPostings.updatedAt,
    })
    .from(adPostings)
    .where(eq(adPostings.isActive, true));

  const boardPages = boards.map((board) => ({
    url: `${baseUrl}/boards/${board.id}`,
    lastModified: board.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // City-specific pages
  const cityPages = AZERBAIJAN_CITIES.map((city) => ({
    url: `${baseUrl}/boards?city=${encodeURIComponent(city)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...boardPages, ...cityPages];
}
