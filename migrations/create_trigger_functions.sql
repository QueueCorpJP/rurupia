-- Create function to update age distribution data
CREATE OR REPLACE FUNCTION update_age_distribution()
RETURNS TRIGGER AS $$
BEGIN
  -- This is simplified - in a real implementation, 
  -- you would extract actual age data from user profiles
  -- For this demo, we'll randomly assign age groups
  DECLARE
    age_groups TEXT[] := ARRAY['10代', '20代', '30代', '40代', '50代', '60代以上'];
    random_idx INTEGER;
    store_id UUID;
  BEGIN
    -- Get store_id from the booking's therapist
    SELECT st.store_id INTO store_id
    FROM store_therapists st
    WHERE st.therapist_id = NEW.therapist_id;
    
    IF store_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Pick a random age group
    random_idx := floor(random() * 6) + 1;
    
    -- Update the count for that age group
    INSERT INTO customer_age_distribution (store_id, age_group, count)
    VALUES (store_id, age_groups[random_idx], 1)
    ON CONFLICT (store_id, age_group) DO UPDATE
    SET count = customer_age_distribution.count + 1,
        updated_at = TIMEZONE('utc', NOW());
    
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create function to update monthly customer data
CREATE OR REPLACE FUNCTION update_monthly_customer_data()
RETURNS TRIGGER AS $$
DECLARE
  booking_month TEXT;
  booking_year INTEGER;
  store_id UUID;
  is_new_customer BOOLEAN;
BEGIN
  -- Get month and year from booking date
  booking_month := to_char(NEW.date, 'MM');
  booking_year := EXTRACT(YEAR FROM NEW.date);
  
  -- Get store_id from the booking's therapist
  SELECT st.store_id INTO store_id
  FROM store_therapists st
  WHERE st.therapist_id = NEW.therapist_id;
  
  IF store_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if this is a new customer
  is_new_customer := NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE user_id = NEW.user_id
    AND id != NEW.id
  );
  
  -- Update monthly customer data
  IF is_new_customer THEN
    -- New customer
    INSERT INTO monthly_customer_data (store_id, month, year, new_customers, returning_customers)
    VALUES (store_id, booking_month, booking_year, 1, 0)
    ON CONFLICT (store_id, month, year) DO UPDATE
    SET new_customers = monthly_customer_data.new_customers + 1,
        updated_at = TIMEZONE('utc', NOW());
  ELSE
    -- Returning customer
    INSERT INTO monthly_customer_data (store_id, month, year, new_customers, returning_customers)
    VALUES (store_id, booking_month, booking_year, 0, 1)
    ON CONFLICT (store_id, month, year) DO UPDATE
    SET returning_customers = monthly_customer_data.returning_customers + 1,
        updated_at = TIMEZONE('utc', NOW());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update popular booking times
CREATE OR REPLACE FUNCTION update_popular_booking_times()
RETURNS TRIGGER AS $$
DECLARE
  booking_hour INTEGER;
  time_slot TEXT;
  store_id UUID;
BEGIN
  -- Get the hour from booking date
  booking_hour := EXTRACT(HOUR FROM NEW.date);
  
  -- Create time slot string (e.g., "13:00-14:00")
  time_slot := to_char(booking_hour, 'FM00') || ':00-' || to_char(booking_hour + 1, 'FM00') || ':00';
  
  -- Get store_id from the booking's therapist
  SELECT st.store_id INTO store_id
  FROM store_therapists st
  WHERE st.therapist_id = NEW.therapist_id;
  
  IF store_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Update popular booking times
  INSERT INTO popular_booking_times (store_id, time_slot, bookings_count, recorded_date)
  VALUES (store_id, time_slot, 1, CURRENT_DATE)
  ON CONFLICT (store_id, time_slot, recorded_date) DO UPDATE
  SET bookings_count = popular_booking_times.bookings_count + 1,
      updated_at = TIMEZONE('utc', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update therapist performance
CREATE OR REPLACE FUNCTION update_therapist_performance()
RETURNS TRIGGER AS $$
DECLARE
  store_id UUID;
BEGIN
  -- Get store_id from the booking's therapist
  SELECT st.store_id INTO store_id
  FROM store_therapists st
  WHERE st.therapist_id = NEW.therapist_id;
  
  IF store_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Update therapist performance
  INSERT INTO therapist_performance (store_id, therapist_id, bookings_count, rating, recorded_date)
  VALUES (store_id, NEW.therapist_id, 1, 5.0, CURRENT_DATE)
  ON CONFLICT (store_id, therapist_id, recorded_date) DO UPDATE
  SET bookings_count = therapist_performance.bookings_count + 1,
      updated_at = TIMEZONE('utc', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for new bookings
DROP TRIGGER IF EXISTS booking_age_distribution_trigger ON bookings;
CREATE TRIGGER booking_age_distribution_trigger
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_age_distribution();

DROP TRIGGER IF EXISTS booking_monthly_data_trigger ON bookings;
CREATE TRIGGER booking_monthly_data_trigger
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_customer_data();

DROP TRIGGER IF EXISTS booking_popular_times_trigger ON bookings;
CREATE TRIGGER booking_popular_times_trigger
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_popular_booking_times();

DROP TRIGGER IF EXISTS booking_therapist_performance_trigger ON bookings;
CREATE TRIGGER booking_therapist_performance_trigger
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_therapist_performance(); 