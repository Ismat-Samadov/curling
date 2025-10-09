-- Add is_admin column to users table
ALTER TABLE poster.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Create an index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON poster.users(is_admin);
