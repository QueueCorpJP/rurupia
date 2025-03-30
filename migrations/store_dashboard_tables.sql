-- Create customer_age_distribution table if it doesn't exist
CREATE TABLE IF NOT EXISTS customer_age_distribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  age_group TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  
  UNIQUE(store_id, age_group)
);

CREATE INDEX IF NOT EXISTS idx_age_distribution_store_id ON customer_age_distribution(store_id);

-- Create monthly_customer_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS monthly_customer_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  new_customers INTEGER DEFAULT 0,
  returning_customers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  
  UNIQUE(store_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_monthly_data_store_id ON monthly_customer_data(store_id);
CREATE INDEX IF NOT EXISTS idx_monthly_data_year_month ON monthly_customer_data(store_id, year, month);

-- Create popular_booking_times table if it doesn't exist
CREATE TABLE IF NOT EXISTS popular_booking_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  time_slot TEXT NOT NULL,
  bookings_count INTEGER DEFAULT 0,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  
  UNIQUE(store_id, time_slot, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_booking_times_store_id ON popular_booking_times(store_id);
CREATE INDEX IF NOT EXISTS idx_booking_times_date ON popular_booking_times(recorded_date);

-- Create therapist_performance table if it doesn't exist
CREATE TABLE IF NOT EXISTS therapist_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  bookings_count INTEGER DEFAULT 0,
  rating NUMERIC(3,1) DEFAULT 5.0,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  
  UNIQUE(store_id, therapist_id, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_therapist_performance_store_id ON therapist_performance(store_id);
CREATE INDEX IF NOT EXISTS idx_therapist_performance_therapist_id ON therapist_performance(therapist_id);

-- Add RLS policies to protect data
ALTER TABLE customer_age_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_customer_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_booking_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_performance ENABLE ROW LEVEL SECURITY;

-- RLS policies for customer_age_distribution
CREATE POLICY customer_age_distribution_store_policy ON customer_age_distribution
  FOR ALL USING (store_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.user_type = 'admin'
  ));

-- RLS policies for monthly_customer_data
CREATE POLICY monthly_customer_data_store_policy ON monthly_customer_data
  FOR ALL USING (store_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.user_type = 'admin'
  ));

-- RLS policies for popular_booking_times
CREATE POLICY popular_booking_times_store_policy ON popular_booking_times
  FOR ALL USING (store_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.user_type = 'admin'
  ));

-- RLS policies for therapist_performance
CREATE POLICY therapist_performance_store_policy ON therapist_performance
  FOR ALL USING (store_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.user_type = 'admin'
  ));

-- Insert sample data for testing
DO $$
DECLARE
  demo_store_id UUID;
  therapist_id1 UUID;
  therapist_id2 UUID;
  therapist_id3 UUID;
BEGIN
  -- Get a real store ID for sample data
  SELECT id INTO demo_store_id FROM stores LIMIT 1;
  
  IF demo_store_id IS NULL THEN
    -- Fallback to a random UUID if no store exists
    demo_store_id := gen_random_uuid();
  END IF;
  
  -- Get some real therapist IDs
  SELECT array_agg(id) INTO STRICT therapist_id1 FROM therapists LIMIT 1;
  
  IF therapist_id1 IS NULL THEN
    -- Fallback to random UUIDs if no therapists exist
    therapist_id1 := gen_random_uuid();
    therapist_id2 := gen_random_uuid();
    therapist_id3 := gen_random_uuid();
  ELSE
    -- Get more therapist IDs if available
    SELECT id INTO therapist_id2 FROM therapists WHERE id <> therapist_id1 LIMIT 1;
    SELECT id INTO therapist_id3 FROM therapists WHERE id NOT IN (therapist_id1, COALESCE(therapist_id2, gen_random_uuid())) LIMIT 1;
    
    -- Fallback to random UUIDs if not enough therapists
    IF therapist_id2 IS NULL THEN therapist_id2 := gen_random_uuid(); END IF;
    IF therapist_id3 IS NULL THEN therapist_id3 := gen_random_uuid(); END IF;
  END IF;
  
  -- Insert age distribution data
  INSERT INTO customer_age_distribution (store_id, age_group, count)
  VALUES
    (demo_store_id, '10代', 5),
    (demo_store_id, '20代', 25),
    (demo_store_id, '30代', 35),
    (demo_store_id, '40代', 20),
    (demo_store_id, '50代', 10),
    (demo_store_id, '60代以上', 5)
  ON CONFLICT (store_id, age_group) DO UPDATE
  SET count = EXCLUDED.count,
      updated_at = TIMEZONE('utc', NOW());
  
  -- Insert monthly customer data for the past 6 months
  INSERT INTO monthly_customer_data (store_id, month, year, new_customers, returning_customers)
  VALUES
    (demo_store_id, '01', 2023, 20, 10),
    (demo_store_id, '02', 2023, 25, 15),
    (demo_store_id, '03', 2023, 30, 20),
    (demo_store_id, '04', 2023, 35, 25),
    (demo_store_id, '05', 2023, 40, 30),
    (demo_store_id, '06', 2023, 45, 35)
  ON CONFLICT (store_id, month, year) DO UPDATE
  SET new_customers = EXCLUDED.new_customers,
      returning_customers = EXCLUDED.returning_customers,
      updated_at = TIMEZONE('utc', NOW());
  
  -- Insert popular booking times
  INSERT INTO popular_booking_times (store_id, time_slot, bookings_count, recorded_date)
  VALUES
    (demo_store_id, '09:00-10:00', 5, CURRENT_DATE),
    (demo_store_id, '10:00-11:00', 8, CURRENT_DATE),
    (demo_store_id, '11:00-12:00', 10, CURRENT_DATE),
    (demo_store_id, '13:00-14:00', 12, CURRENT_DATE),
    (demo_store_id, '14:00-15:00', 15, CURRENT_DATE),
    (demo_store_id, '15:00-16:00', 18, CURRENT_DATE),
    (demo_store_id, '16:00-17:00', 14, CURRENT_DATE),
    (demo_store_id, '17:00-18:00', 10, CURRENT_DATE),
    (demo_store_id, '18:00-19:00', 7, CURRENT_DATE),
    (demo_store_id, '19:00-20:00', 4, CURRENT_DATE)
  ON CONFLICT (store_id, time_slot, recorded_date) DO UPDATE
  SET bookings_count = EXCLUDED.bookings_count,
      updated_at = TIMEZONE('utc', NOW());
  
  -- Insert therapist performance data
  INSERT INTO therapist_performance (store_id, therapist_id, bookings_count, rating, recorded_date)
  VALUES
    (demo_store_id, therapist_id1, 25, 4.8, CURRENT_DATE),
    (demo_store_id, therapist_id2, 18, 4.5, CURRENT_DATE),
    (demo_store_id, therapist_id3, 22, 4.7, CURRENT_DATE)
  ON CONFLICT (store_id, therapist_id, recorded_date) DO UPDATE
  SET bookings_count = EXCLUDED.bookings_count,
      rating = EXCLUDED.rating,
      updated_at = TIMEZONE('utc', NOW());
END $$; 