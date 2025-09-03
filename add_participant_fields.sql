-- Add missing fields to participants table
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS firstname TEXT,
ADD COLUMN IF NOT EXISTS lastinitial TEXT,
ADD COLUMN IF NOT EXISTS fsuemail TEXT,
ADD COLUMN IF NOT EXISTS study_complete BOOLEAN DEFAULT FALSE;