require('dotenv').config();
const { Client } = require('pg');

async function cleanDuplicates() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Get all listings
    const result = await client.query(`
      SELECT id, title, owner_email, created_at, thumbnail_image
      FROM poster.ad_postings
      ORDER BY created_at DESC
    `);

    console.log('\nAll listings:');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Email: ${row.owner_email || 'N/A'}, Created: ${row.created_at}, Has Image: ${!!row.thumbnail_image}`);
    });

    // Find duplicates (same title and created within 5 seconds)
    const duplicates = [];
    for (let i = 0; i < result.rows.length; i++) {
      for (let j = i + 1; j < result.rows.length; j++) {
        if (result.rows[i].title === result.rows[j].title) {
          const timeDiff = Math.abs(new Date(result.rows[i].created_at) - new Date(result.rows[j].created_at));
          if (timeDiff < 5000) { // Within 5 seconds
            duplicates.push(result.rows[j].id); // Keep the first one, delete the second
          }
        }
      }
    }

    if (duplicates.length > 0) {
      console.log('\nDuplicates found (IDs to delete):', duplicates);

      for (const id of duplicates) {
        await client.query('DELETE FROM poster.ad_postings WHERE id = $1', [id]);
        console.log(`Deleted duplicate listing with ID: ${id}`);
      }
    } else {
      console.log('\nNo duplicates found');
    }

    // Update listings without images to use null (will use placeholder in UI)
    const updateResult = await client.query(`
      UPDATE poster.ad_postings
      SET thumbnail_image = NULL
      WHERE thumbnail_image = '' OR thumbnail_image IS NULL
      RETURNING id, title
    `);

    if (updateResult.rows.length > 0) {
      console.log('\nUpdated listings to use placeholder:');
      updateResult.rows.forEach(row => {
        console.log(`ID: ${row.id}, Title: ${row.title}`);
      });
    }

    console.log('\nCleanup complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

cleanDuplicates();
