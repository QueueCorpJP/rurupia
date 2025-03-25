-- Migration to add settings columns to therapists table
ALTER TABLE therapists
-- Account settings
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'ja',

-- Privacy settings
ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_follower_count BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_availability BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS restrict_messaging BOOLEAN DEFAULT FALSE,

-- Notification settings
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS booking_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS message_notifications BOOLEAN DEFAULT TRUE, 
ADD COLUMN IF NOT EXISTS marketing_notifications BOOLEAN DEFAULT FALSE;

-- Add comment to the table
COMMENT ON TABLE therapists IS 'Therapist profiles with additional settings capabilities';

-- Note: Run this SQL script in your Supabase SQL Editor to add these columns
-- These columns are needed for the TherapistSettings page to work properly 