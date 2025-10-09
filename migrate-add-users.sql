-- Create users table in poster schema
CREATE TABLE IF NOT EXISTS poster.users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add user_id to ad_postings table
ALTER TABLE poster.ad_postings
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES poster.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON poster.users(email);
CREATE INDEX IF NOT EXISTS idx_ad_postings_user_id ON poster.ad_postings(user_id);
