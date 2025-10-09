require('dotenv').config();
const { Client } = require('pg');

async function fixUserListings() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // Update listing ID 8 to associate with user ID 1
    const result = await client.query(`
      UPDATE poster.ad_postings
      SET user_id = 1
      WHERE id = 8 AND owner_email = 'ismetsemedov@gmail.com'
      RETURNING id, title, user_id
    `);

    if (result.rows.length > 0) {
      console.log('Updated listing:');
      result.rows.forEach(row => {
        console.log(`ID: ${row.id}, Title: ${row.title}, UserID: ${row.user_id}`);
      });
    } else {
      console.log('No listings updated');
    }

    // Verify the update
    const verifyResult = await client.query(`
      SELECT id, title, owner_email, user_id
      FROM poster.ad_postings
      WHERE user_id = 1
    `);

    console.log('\nListings for user ID 1:');
    verifyResult.rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Email: ${row.owner_email}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

fixUserListings();
