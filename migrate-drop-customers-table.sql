-- Drop the customers table as it's redundant (we use users table instead)
DROP TABLE IF EXISTS poster.customers CASCADE;

-- This migration cleans up the database by removing the customers table
-- All user information is now stored in the users table
