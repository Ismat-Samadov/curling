import { Metadata } from 'next';
import { generateMetadata as genMeta, generateBreadcrumbSchema, siteConfig } from '@/lib/seo';

export const metadata: Metadata = genMeta({
  title: 'Reklam Lövhələri - Billboard Kirayə',
  description: 'Azərbaycanda reklam lövhələri və billboard kirayəsi. Bakı, Gəncə, Sumqayıt və digər şəhərlərdə ən yaxşı yerləşdirmə. Digital ekran, bilbord və poster reklamları.',
  keywords: [
    'reklam lövhəsi',
    'billboard kirayə',
    'outdoor reklam',
    'Bakı billboard',
    'Gəncə reklam',
    'Sumqayıt lövhə',
    'digital ekran',
    'reklam yerləşdirmə',
  ],
  url: '/boards',
});

export default function BoardsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Səhifə', url: '/' },
    { name: 'Reklam Lövhələri', url: '/boards' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
