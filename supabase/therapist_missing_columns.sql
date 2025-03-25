-- Add missing columns to therapists table
ALTER TABLE therapists
ADD COLUMN IF NOT EXISTS working_days TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS weight INTEGER,
ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS health_document_url TEXT,
ADD COLUMN IF NOT EXISTS service_areas JSONB DEFAULT '{}';

-- Log the changes
DO $$
BEGIN
    RAISE NOTICE 'Added missing columns to therapists table';
    RAISE NOTICE 'Columns added: working_days, working_hours, height, weight, hobbies, health_document_url, service_areas';
END $$;

-- Verify column existence
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'therapists'
    AND column_name IN ('working_days', 'working_hours', 'height', 'weight', 'hobbies', 'health_document_url', 'service_areas');
    
    RAISE NOTICE 'Number of new columns found: %', col_count;
END $$; 