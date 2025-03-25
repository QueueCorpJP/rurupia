-- Create table for age distribution
CREATE TABLE IF NOT EXISTS customer_age_distribution (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  age_group TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for monthly customer data
CREATE TABLE IF NOT EXISTS monthly_customer_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  new_customers INTEGER NOT NULL DEFAULT 0,
  returning_customers INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for popular booking times
CREATE TABLE IF NOT EXISTS popular_booking_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  time_slot TEXT NOT NULL,
  bookings_count INTEGER NOT NULL DEFAULT 0,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for therapist performance
CREATE TABLE IF NOT EXISTS therapist_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bookings_count INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2),
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE customer_age_distribution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store owners can manage their own analytics" ON customer_age_distribution
  USING (store_id = auth.uid());

ALTER TABLE monthly_customer_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store owners can manage their own analytics" ON monthly_customer_data
  USING (store_id = auth.uid());

ALTER TABLE popular_booking_times ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store owners can manage their own analytics" ON popular_booking_times
  USING (store_id = auth.uid());

ALTER TABLE therapist_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store owners can manage their own analytics" ON therapist_performance
  USING (store_id = auth.uid());

-- Insert sample data for testing
INSERT INTO customer_age_distribution (store_id, age_group, count)
SELECT 
  auth.uid(), -- Assuming the user running this is the store owner
  age_group,
  count
FROM (
  VALUES 
    ('10代', 5),
    ('20代', 30),
    ('30代', 35),
    ('40代', 20),
    ('50代', 8),
    ('60代以上', 2)
) AS sample_data(age_group, count)
WHERE EXISTS (SELECT 1 FROM stores WHERE id = auth.uid());

INSERT INTO monthly_customer_data (store_id, month, year, new_customers, returning_customers)
SELECT 
  auth.uid(),
  month,
  2023,
  new_customers,
  returning_customers
FROM (
  VALUES 
    ('1月', 28, 42),
    ('2月', 32, 45),
    ('3月', 35, 50),
    ('4月', 30, 55),
    ('5月', 38, 58),
    ('6月', 42, 60)
) AS sample_data(month, new_customers, returning_customers)
WHERE EXISTS (SELECT 1 FROM stores WHERE id = auth.uid());

INSERT INTO popular_booking_times (store_id, time_slot, bookings_count)
SELECT 
  auth.uid(),
  time_slot,
  bookings_count
FROM (
  VALUES 
    ('9:00', 5),
    ('10:00', 8),
    ('11:00', 12),
    ('12:00', 10),
    ('13:00', 7),
    ('14:00', 9),
    ('15:00', 14),
    ('16:00', 18),
    ('17:00', 15),
    ('18:00', 12),
    ('19:00', 8),
    ('20:00', 6)
) AS sample_data(time_slot, bookings_count)
WHERE EXISTS (SELECT 1 FROM stores WHERE id = auth.uid());

-- For therapist_performance, we need to get actual therapist IDs
-- This inserts sample data for the first 5 therapists associated with the store
INSERT INTO therapist_performance (store_id, therapist_id, bookings_count, rating)
SELECT 
  st.store_id,
  st.therapist_id,
  (RANDOM() * 50)::INTEGER + 1 AS bookings_count,
  (RANDOM() * 0.5 + 4.5)::DECIMAL(3,2) AS rating
FROM store_therapists st
JOIN profiles p ON st.therapist_id = p.id
WHERE st.store_id = auth.uid() AND st.status = 'active'
LIMIT 5; 