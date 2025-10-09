require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runUsersMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const migrationSQL = fs.readFileSync(
    path.join(__dirname, 'migrate-add-users.sql'),
    'utf8'
  );

  console.log('Running users migration...');

  try {
    await pool.query(migrationSQL);
    console.log('✅ Users table created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runUsersMigration();
