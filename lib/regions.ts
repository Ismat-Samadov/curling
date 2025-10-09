// Azerbaijan regions and cities data
export const AZERBAIJAN_REGIONS = {
  'Bakı': [
    'Bakı',
    'Abşeron',
    'Xəzər',
    'Pirallahı',
    'Nərimanov',
    'Nəsimi',
    'Yasamal',
    'Səbail',
    'Binəqədi',
    'Suraxanı',
    'Sabunçu',
    'Qaradağ'
  ],
  'Gəncə': [
    'Gəncə',
    'Göygöl',
    'Daşkəsən',
    'Goranboy',
    'Samux'
  ],
  'Sumqayıt': [
    'Sumqayıt'
  ],
  'Mingəçevir': [
    'Mingəçevir'
  ],
  'Şirvan': [
    'Şirvan',
    'Sabirabad',
    'Neftçala',
    'Biləsuvar'
  ],
  'Naxçıvan MR': [
    'Naxçıvan',
    'Şahbuz',
    'Ordubad',
    'Culfa',
    'Babək',
    'Şərur',
    'Kəngərli',
    'Sədərək'
  ],
  'Lənkəran-Astara': [
    'Lənkəran',
    'Astara',
    'Lerik',
    'Yardımlı',
    'Masallı',
    'Cəlilabad'
  ],
  'Quba-Xaçmaz': [
    'Quba',
    'Qusar',
    'Xaçmaz',
    'Şabran',
    'Siyəzən',
    'Xızı'
  ],
  'Şəki-Zaqatala': [
    'Şəki',
    'Zaqatala',
    'Qax',
    'Oğuz',
    'Qəbələ',
    'Balakən'
  ],
  'Yevlax': [
    'Yevlax',
    'Ağdaş',
    'Zərdab',
    'Göyçay',
    'Ucar'
  ],
  'Qarabağ': [
    'Ağdam',
    'Füzuli',
    'Xocavənd',
    'Kəlbəcər',
    'Laçın',
    'Qubadlı',
    'Zəngilan',
    'Şuşa',
    'Xankəndi'
  ],
  'Aran': [
    'Bərdə',
    'İmişli',
    'Kürdəmir',
    'Ağcabədi',
    'Beyləqan',
    'Saatlı',
    'Hacıqabul'
  ],
  'Mil-Muğan': [
    'Salyan',
    'Neftçala',
    'Biləsuvar'
  ],
  'Qazax': [
    'Qazax',
    'Ağstafa',
    'Tovuz',
    'Gədəbəy',
    'Şəmkir'
  ],
  'Dağlıq Şirvan': [
    'İsmayıllı',
    'Ağsu',
    'Şamaxı',
    'Qobustan'
  ]
} as const;

export const BOARD_TYPES = [
  { value: 'billboard', label: '🔶 Bilbord', description: 'Böyük ölçülü reklam lövhəsi' },
  { value: 'digital', label: '📺 Rəqəmsal Ekran', description: 'LED/LCD ekranlı reklam' },
  { value: 'poster', label: '📋 Poster Lövhəsi', description: 'Orta ölçülü poster' },
  { value: 'wallscape', label: '🏢 Divar Lövhəsi', description: 'Bina divarında reklam' },
  { value: 'transit', label: '🚌 Nəqliyyat Reklamı', description: 'Avtobus, metro reklamı' },
  { value: 'street', label: '🚏 Küçə Lövhəsi', description: 'Küçə səviyyəsində reklam' },
  { value: 'bridge', label: '🌉 Körpü Lövhəsi', description: 'Körpü üzərində reklam' },
  { value: 'roof', label: '🏠 Dam Lövhəsi', description: 'Bina damında reklam' }
] as const;

// Get all cities from all regions
export const getAllCities = (): string[] => {
  const cities: string[] = [];
  Object.values(AZERBAIJAN_REGIONS).forEach(regionCities => {
    cities.push(...regionCities);
  });
  return [...new Set(cities)].sort();
};

// Get region for a city
export const getRegionForCity = (city: string): string | null => {
  for (const [region, cities] of Object.entries(AZERBAIJAN_REGIONS)) {
    if ((cities as readonly string[]).includes(city)) {
      return region;
    }
  }
  return null;
};

// Default coordinates for Azerbaijan (Baku center)
export const AZERBAIJAN_DEFAULT_COORDS = {
  lat: 40.4093,
  lng: 49.8671,
  zoom: 12
};

// Major city coordinates for quick selection
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Bakı': { lat: 40.4093, lng: 49.8671 },
  'Gəncə': { lat: 40.6828, lng: 46.3606 },
  'Sumqayıt': { lat: 40.5897, lng: 49.6686 },
  'Mingəçevir': { lat: 40.7697, lng: 47.0461 },
  'Şirvan': { lat: 39.9367, lng: 48.9289 },
  'Naxçıvan': { lat: 39.2089, lng: 45.4125 },
  'Lənkəran': { lat: 38.7542, lng: 48.8511 },
  'Quba': { lat: 41.3617, lng: 48.5133 },
  'Şəki': { lat: 41.1919, lng: 47.1706 },
  'Yevlax': { lat: 40.6178, lng: 47.1506 },
  'Xaçmaz': { lat: 41.4617, lng: 48.8056 },
  'Qazax': { lat: 41.0925, lng: 45.3658 },
  'Şamaxı': { lat: 40.6317, lng: 48.6417 }
};
