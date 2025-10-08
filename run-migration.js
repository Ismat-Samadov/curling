require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL });

  const migrationSQL = fs.readFileSync(path.join(__dirname, 'migrate.sql'), 'utf8');

  console.log('Running migration...');

  try {
    // Execute the entire migration
    console.log('Executing migration SQL...');
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('\nNew schema:');
    console.log('- customers table created');
    console.log('- boards renamed to ad_postings');
    console.log('- bookings table dropped');
    console.log('- New columns added (customer_phone, is_available, view_count)');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
