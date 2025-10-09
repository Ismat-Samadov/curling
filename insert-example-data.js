require('dotenv').config();
const { Pool } = require('pg');

async function insertExampleData() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('Inserting example data...\n');

  try {
    // Example customers
    const customers = [
      { name: 'Əli Məmmədov', phone: '+994501234567', email: 'ali@example.az' },
      { name: 'Leyla Həsənova', phone: '+994502345678', email: 'leyla@example.az' },
      { name: 'Rəşad Quliyev', phone: '+994503456789', email: 'rashad@example.az' },
    ];

    console.log('Inserting customers...');
    for (const customer of customers) {
      await pool.query(
        'INSERT INTO poster.customers (name, phone, email) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [customer.name, customer.phone, customer.email]
      );
    }
    console.log('✅ Customers inserted\n');

    // Example ad postings (billboards in Baku)
    const adPostings = [
      {
        customerPhone: '+994501234567',
        ownerName: 'Əli Məmmədov',
        ownerPhone: '+994501234567',
        ownerEmail: 'ali@example.az',
        title: 'Nərimanov Metrosu yanında Premium Bilbord',
        description: 'Bakının ən işlək nöqtələrindən birində yerləşən böyük bilbord. Gündə minlərlə insan tərəfindən görünür. Əla görünmə, LED işıqlandırma.',
        latitude: 40.3953,
        longitude: 49.8821,
        address: 'Nərimanov metro stansiyası, Əhməd Rəcəbli küçəsi',
        city: 'Bakı',
        country: 'Azərbaycan',
        width: 6.0,
        height: 3.0,
        boardType: 'billboard',
        images: ['https://pub-15f3ee6e8c68431e96421e7288ad217c.r2.dev/test/test-upload.txt'],
        thumbnailImage: 'https://pub-15f3ee6e8c68431e96421e7288ad217c.r2.dev/test/test-upload.txt',
        pricePerDay: 15000, // 150 AZN
        pricePerWeek: 90000, // 900 AZN
        pricePerMonth: 300000, // 3000 AZN
      },
      {
        customerPhone: '+994502345678',
        ownerName: 'Leyla Həsənova',
        ownerPhone: '+994502345678',
        ownerEmail: 'leyla@example.az',
        title: '28 May metrosu Rəqəmsal Ekran',
        description: 'Yüksək keyfiyyətli LED ekran. 24/7 işləyir. Metro stansiyasının çıxışında, gündə 50,000+ insan tərəfindən görünür.',
        latitude: 40.3806,
        longitude: 49.8380,
        address: '28 May metro stansiyası, Azadlıq prospekti',
        city: 'Bakı',
        country: 'Azərbaycan',
        width: 4.0,
        height: 2.5,
        boardType: 'digital',
        images: ['https://pub-15f3ee6e8c68431e96421e7288ad217c.r2.dev/test/test-upload.txt'],
        thumbnailImage: 'https://pub-15f3ee6e8c68431e96421e7288ad217c.r2.dev/test/test-upload.txt',
        pricePerDay: 20000, // 200 AZN
        pricePerWeek: 120000, // 1200 AZN
        pricePerMonth: 400000, // 4000 AZN
      },
      {
        customerPhone: '+994503456789',
        ownerName: 'Rəşad Quliyev',
        ownerPhone: '+994503456789',
        ownerEmail: 'rashad@example.az',
        title: 'Sahil Bulvarı Divar Lövhəsi',
        description: 'Sahil bulvarında əla yerləşmə. Turistlər və yerli əhali tərəfindən hər gün görünür. Dəniz mənzərəsi ilə mükəmməl fon.',
        latitude: 40.3634,
        longitude: 49.8358,
        address: 'Dənizkənarı Milli Park, Sahil küçəsi',
        city: 'Bakı',
        country: 'Azərbaycan',
        width: 8.0,
        height: 4.0,
        boardType: 'wallscape',
        images: ['https://pub-15f3ee6e8c68431e96421e7288ad217c.r2.dev/test/test-upload.txt'],
        thumbnailImage: 'https://pub-15f3ee6e8c68431e96421e7288ad217c.r2.dev/test/test-upload.txt',
        pricePerDay: 25000, // 250 AZN
        pricePerWeek: 150000, // 1500 AZN
        pricePerMonth: 500000, // 5000 AZN
      },
      {
        customerPhone: '+994501234567',
        ownerName: 'Əli Məmmədov',
        ownerPhone: '+994501234567',
        ownerEmail: 'ali@example.az',
        title: 'Nizami küçəsi Poster Lövhəsi',
        description: 'Nizami küçəsində piyada zonasında orta ölçülü poster. Alış-veriş edənlər üçün idealdır.',
        latitude: 40.3777,
        longitude: 49.8359,
        address: 'Nizami küçəsi, Fountain Square yaxınlığı',
        city: 'Bakı',
        country: 'Azərbaycan',
        width: 2.0,
        height: 1.5,
        boardType: 'poster',
        images: ['https://pub-15f3ee6e8c68431e96421e7288ad217c.r2.dev/test/test-upload.txt'],
        thumbnailImage: 'https://pub-15f3ee6e8c68431e96421e7288ad217c.r2.dev/test/test-upload.txt',
        pricePerDay: 5000, // 50 AZN
        pricePerWeek: 30000, // 300 AZN
        pricePerMonth: 100000, // 1000 AZN
      },
      {
        customerPhone: '+994502345678',
        ownerName: 'Leyla Həsənova',
        ownerPhone: '+994502345678',
        ownerEmail: 'leyla@example.az',
        title: 'Koroğlu metrosu Avtobos Dayanacağı Reklamı',
        description: 'Avtobos dayanacağında panoramik reklam. Sərnişinlər və piyada keçənlər tərəfindən görünür.',
        latitude: 40.4093,
        longitude: 49.9189,
        address: 'Koroğlu metro stansiyası, Həsən Əliyev küçəsi',
        city: 'Bakı',
        country: 'Azərbaycan',
        width: 3.0,
        height: 1.2,
        boardType: 'transit',
        images: ['https://pub-15f3ee6e8c68431e96421e7288ad217c.r2.dev/test/test-upload.txt'],
        thumbnailImage: 'https://pub-15f3ee6e8c68431e96421e7288ad217c.r2.dev/test/test-upload.txt',
        pricePerDay: 8000, // 80 AZN
        pricePerWeek: 50000, // 500 AZN
        pricePerMonth: 180000, // 1800 AZN
      },
    ];

    console.log('Inserting ad postings...');
    for (const ad of adPostings) {
      const result = await pool.query(
        `INSERT INTO poster.ad_postings (
          customer_phone, owner_name, owner_phone, owner_email,
          title, description, latitude, longitude, address, city, country,
          width, height, board_type, images, thumbnail_image,
          price_per_day, price_per_week, price_per_month,
          is_active, is_available
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, true, true)
        RETURNING id, title`,
        [
          ad.customerPhone, ad.ownerName, ad.ownerPhone, ad.ownerEmail,
          ad.title, ad.description, ad.latitude, ad.longitude, ad.address, ad.city, ad.country,
          ad.width, ad.height, ad.boardType, ad.images, ad.thumbnailImage,
          ad.pricePerDay, ad.pricePerWeek, ad.pricePerMonth
        ]
      );
      console.log(`  ✓ Created: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
    }

    console.log('\n✅ All example data inserted successfully!\n');
    console.log('Summary:');
    console.log(`- ${customers.length} customers`);
    console.log(`- ${adPostings.length} ad postings`);
    console.log('\nYou can now view them at http://localhost:3003/boards');

  } catch (error) {
    console.error('❌ Error inserting data:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

insertExampleData();
