require('dotenv').config();
const { Pool } = require('pg');

async function verifySchema() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema IN ('public', 'poster')
      ORDER BY table_schema, table_name;
    `);

    console.log('Tables in database:');
    result.rows.forEach(row => console.log(`- ${row.table_schema}.${row.table_name}`));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifySchema();
