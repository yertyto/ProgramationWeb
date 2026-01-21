-- Migration: Add email column to users table
-- Execute this file: psql -U postgres -d event_db -f add_email_column.sql

-- Add email column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Display the updated table structure
\d public.users

-- Display all users
SELECT id, username, email, created_at FROM public.users;
