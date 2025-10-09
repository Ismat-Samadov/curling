-- Create poster schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS poster;

-- Move tables from public schema to poster schema
ALTER TABLE IF EXISTS public.customers SET SCHEMA poster;
ALTER TABLE IF EXISTS public.ad_postings SET SCHEMA poster;
