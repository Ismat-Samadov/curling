// SEO Configuration for banner.az
export const siteConfig = {
  name: 'banner.az',
  title: 'Reklam Lövhələri - Billboard Kirayə | banner.az',
  description: 'Azərbaycanda reklam lövhələri və billboard kirayəsi. Bakı, Gəncə, Sumqayıt və digər şəhərlərdə ən yaxşı yerləşdirmə. Digital ekran, bilbord və poster reklamları.',
  url: 'https://banner.az',
  ogImage: '/og-image.jpg',
  keywords: [
    'reklam lövhəsi',
    'billboard',
    'reklam kirayəsi',
    'outdoor reklam',
    'Bakı reklam',
    'billboard Azərbaycan',
    'digital ekran',
    'reklam lövhəsi kirayəsi',
    'outdoor advertising Azerbaijan',
    'billboard rental',
    'Gəncə billboard',
    'Sumqayıt reklam',
    'poster lövhəsi',
    'divar reklamı',
    'nəqliyyat reklamı',
    'körpü reklamı',
    'küçə lövhəsi',
  ],
  locale: 'az_AZ',
  type: 'website',
};

// Generate page metadata
export function generateMetadata(params: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}) {
  const {
    title = siteConfig.title,
    description = siteConfig.description,
    keywords = siteConfig.keywords,
    image = siteConfig.ogImage,
    url = siteConfig.url,
    type = siteConfig.type,
    noindex = false,
  } = params;

  const fullTitle = title === siteConfig.title ? title : `${title} | banner.az`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    robots: noindex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: image.startsWith('http') ? image : `${siteConfig.url}${image}`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: siteConfig.locale,
      type: type as any,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image.startsWith('http') ? image : `${siteConfig.url}${image}`],
      creator: '@banneraz',
      site: '@banneraz',
    },
    alternates: {
      canonical: url,
    },
    other: {
      'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
    },
  };
}

// Generate JSON-LD structured data
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'banner.az',
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AZ',
      addressLocality: 'Bakı',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      areaServed: 'AZ',
      availableLanguage: ['az', 'en', 'ru'],
    },
    sameAs: [
      'https://facebook.com/banneraz',
      'https://instagram.com/banneraz',
      'https://linkedin.com/company/banneraz',
    ],
  };
}

// Generate Product (Listing) Schema
export function generateListingSchema(listing: {
  id: number;
  title: string;
  description: string;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  boardType: string;
  thumbnailImage: string;
  ownerName: string;
  ownerPhone: string;
  createdAt: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.thumbnailImage.startsWith('http')
      ? listing.thumbnailImage
      : `${siteConfig.url}${listing.thumbnailImage}`,
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: (listing.pricePerDay / 100).toFixed(2),
      highPrice: (listing.pricePerMonth / 100).toFixed(2),
      priceCurrency: 'AZN',
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.url}/boards/${listing.id}`,
      priceSpecification: [
        {
          '@type': 'UnitPriceSpecification',
          price: (listing.pricePerDay / 100).toFixed(2),
          priceCurrency: 'AZN',
          unitText: 'DAY',
        },
        {
          '@type': 'UnitPriceSpecification',
          price: (listing.pricePerWeek / 100).toFixed(2),
          priceCurrency: 'AZN',
          unitText: 'WEEK',
        },
        {
          '@type': 'UnitPriceSpecification',
          price: (listing.pricePerMonth / 100).toFixed(2),
          priceCurrency: 'AZN',
          unitText: 'MONTH',
        },
      ],
    },
    brand: {
      '@type': 'Brand',
      name: 'banner.az',
    },
    category: listing.boardType,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Ölçü',
        value: `${listing.width}m × ${listing.height}m`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Növ',
        value: listing.boardType,
      },
    ],
    location: {
      '@type': 'Place',
      name: listing.address,
      address: {
        '@type': 'PostalAddress',
        streetAddress: listing.address,
        addressLocality: listing.city,
        addressCountry: 'AZ',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: listing.latitude,
        longitude: listing.longitude,
      },
    },
  };
}

// Generate BreadcrumbList Schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

// Generate WebSite Schema with Search
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/boards?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Generate LocalBusiness Schema for each listing
export function generateLocalBusinessSchema(listing: {
  id: number;
  title: string;
  description: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  ownerName: string;
  ownerPhone: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.url}/boards/${listing.id}`,
    name: listing.title,
    description: listing.description,
    url: `${siteConfig.url}/boards/${listing.id}`,
    telephone: listing.ownerPhone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: listing.city,
      addressCountry: 'AZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: listing.latitude,
      longitude: listing.longitude,
    },
  };
}

// City-specific metadata
export const cityMetadata: Record<string, { title: string; description: string; keywords: string[] }> = {
  'Bakı': {
    title: 'Bakıda Reklam Lövhələri - Billboard Kirayə',
    description: 'Bakıda reklam lövhələri və billboard kirayəsi. Şəhərin mərkəzində, Nəsimi, Yasamal, Nizami rayonlarında ən yaxşı yerləşdirmə.',
    keywords: ['bakı billboard', 'bakı reklam lövhəsi', 'bakıda reklam', 'billboard baku'],
  },
  'Gəncə': {
    title: 'Gəncədə Reklam Lövhələri - Billboard Kirayə',
    description: 'Gəncə şəhərində reklam lövhələri və billboard kirayəsi. Şəhərin əsas yollarında strateji yerləşdirmə.',
    keywords: ['gəncə billboard', 'gəncə reklam', 'ganja advertising'],
  },
  'Sumqayıt': {
    title: 'Sumqayıtda Reklam Lövhələri - Billboard Kirayə',
    description: 'Sumqayıt şəhərində reklam lövhələri və billboard kirayəsi. Sənaye zonalarında və əsas yollarda yerləşdirmə.',
    keywords: ['sumqayıt billboard', 'sumqayıt reklam', 'sumgait advertising'],
  },
};

// Board type specific metadata
export const boardTypeMetadata: Record<string, { title: string; description: string }> = {
  billboard: {
    title: 'Bilbord Kirayəsi - Böyük Ölçülü Reklam Lövhələri',
    description: 'Azərbaycanda bilbord kirayəsi. Böyük ölçülü reklam lövhələri əsas yollarda və şəhər mərkəzlərində.',
  },
  digital: {
    title: 'Digital Ekran Reklamı - LED/LCD Reklam Lövhələri',
    description: 'Digital ekran və LED/LCD reklam lövhələri. Dinamik məzmun, yüksək görünürlük, müasir texnologiya.',
  },
  poster: {
    title: 'Poster Lövhəsi Kirayəsi - Orta Ölçülü Reklam',
    description: 'Poster lövhəsi kirayəsi. Orta ölçülü reklam lövhələri küçə səviyyəsində yerləşdirmə üçün.',
  },
  wallscape: {
    title: 'Divar Reklamı - Bina Divarında Lövhə',
    description: 'Bina divarlarında böyük ölçülü reklam lövhələri. Maksimum görünürlük və təsir.',
  },
  transit: {
    title: 'Nəqliyyat Reklamı - Avtobus və Metro',
    description: 'Nəqliyyat reklamı - avtobus, metro və digər ictimai nəqliyyatda reklam yerləşdirmə.',
  },
  street: {
    title: 'Küçə Lövhəsi - Piyada Trafiki üçün Reklam',
    description: 'Küçə səviyyəsində reklam lövhələri. Piyada trafiki üçün optimal yerləşdirmə.',
  },
  bridge: {
    title: 'Körpü Lövhəsi - Yüksək Trafikdə Reklam',
    description: 'Körpü və yol üstü reklam lövhələri. Yüksək nəqliyyat trafiki olan yerlərdə.',
  },
  roof: {
    title: 'Dam Lövhəsi - Bina Damında Reklam',
    description: 'Bina damlarında reklam lövhələri. Uzaq məsafədən görünən böyük formatda.',
  },
};
