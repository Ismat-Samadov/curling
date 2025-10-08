-- Migration: Simplify schema to customers and ad_postings tables

-- Step 1: Drop old enum types first
DROP TYPE IF EXISTS board_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;

-- Step 2: Drop bookings table (not needed anymore)
DROP TABLE IF EXISTS bookings CASCADE;

-- Step 3: Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Step 4: Rename boards to ad_postings if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'boards') THEN
    ALTER TABLE boards RENAME TO ad_postings;
  END IF;
END $$;

-- Step 5: Add new columns to ad_postings if they don't exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ad_postings') THEN
    ALTER TABLE ad_postings
      ADD COLUMN IF NOT EXISTS customer_phone TEXT,
      ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true NOT NULL,
      ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 NOT NULL;

    -- Drop old status column if it exists
    ALTER TABLE ad_postings DROP COLUMN IF EXISTS status CASCADE;
  END IF;
END $$;

-- Step 6: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ad_postings') THEN
    CREATE INDEX IF NOT EXISTS idx_ad_postings_customer_phone ON ad_postings(customer_phone);
    CREATE INDEX IF NOT EXISTS idx_ad_postings_city ON ad_postings(city);
    CREATE INDEX IF NOT EXISTS idx_ad_postings_is_active ON ad_postings(is_active);
  END IF;
END $$;
