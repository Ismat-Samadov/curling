import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Add search_path to use poster schema
const databaseUrl = process.env.DATABASE_URL + '?options=-c%20search_path=poster,public';
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
