require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const sql = fs.readFileSync('./migrate-add-statistics.sql', 'utf8');
    await client.query(sql);

    console.log('✓ Statistics table created successfully');
    console.log('✓ Indexes created successfully');

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await client.end();
  }
}

runMigration();
