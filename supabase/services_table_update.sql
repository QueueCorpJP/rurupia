-- Add store_id column to the services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS services_store_id_idx ON services (store_id);

-- Enable Row Level Security on services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for the services table
CREATE POLICY "Store owners can see and manage their own services" ON services
  USING (store_id = auth.uid());

-- Create policy to allow public read access for all services
CREATE POLICY "Anyone can view services" ON services
  FOR SELECT
  USING (true);

-- Comment for future reference
COMMENT ON TABLE services IS 'Service offerings that can be linked to stores and therapists'; 