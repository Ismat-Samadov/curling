require('dotenv').config();
const { Client } = require('pg');

async function checkListings() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // Get all users
    const usersResult = await client.query(`
      SELECT id, email, name
      FROM poster.users
      ORDER BY id
    `);

    console.log('Users:');
    usersResult.rows.forEach(row => {
      console.log(`ID: ${row.id}, Email: ${row.email}, Name: ${row.name}`);
    });

    // Get all listings
    const listingsResult = await client.query(`
      SELECT id, title, owner_email, user_id, created_at
      FROM poster.ad_postings
      ORDER BY id
    `);

    console.log('\nListings:');
    listingsResult.rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Email: ${row.owner_email}, UserID: ${row.user_id || 'NULL'}, Created: ${row.created_at}`);
    });

    console.log('\nListings without user_id:', listingsResult.rows.filter(r => !r.user_id).length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkListings();
