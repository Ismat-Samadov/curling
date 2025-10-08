require('dotenv').config();
const { Pool } = require('pg');

async function verifySchema() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('Tables in poster schema:');
    result.rows.forEach(row => console.log(`- ${row.table_name}`));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifySchema();
