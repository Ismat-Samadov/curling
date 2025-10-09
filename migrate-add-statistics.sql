-- Create statistics table for tracking views and phone reveals
CREATE TABLE IF NOT EXISTS poster.statistics (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES poster.ad_postings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'phone_reveal')),
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_statistics_listing_id ON poster.statistics(listing_id);
CREATE INDEX IF NOT EXISTS idx_statistics_event_type ON poster.statistics(event_type);
CREATE INDEX IF NOT EXISTS idx_statistics_created_at ON poster.statistics(created_at);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_statistics_listing_event ON poster.statistics(listing_id, event_type);
