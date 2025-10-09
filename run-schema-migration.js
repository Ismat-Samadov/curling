require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSchemaMigration() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL });

  const migrationSQL = fs.readFileSync(
    path.join(__dirname, 'migrate-to-poster-schema.sql'),
    'utf8'
  );

  console.log('Moving tables to poster schema...');

  try {
    await pool.query(migrationSQL);

    console.log('✅ Schema migration completed successfully!');
    console.log('\nVerifying tables in poster schema:');

    const result = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema IN ('public', 'poster')
      ORDER BY table_schema, table_name;
    `);

    console.log('\nTables:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_schema}.${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSchemaMigration();
