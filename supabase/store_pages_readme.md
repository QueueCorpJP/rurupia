# Store Pages Real-time Data Integration

This document outlines the changes made to the store pages to use real data from Supabase instead of mock data.

## Overview

Previously, several store pages were using mock data. These pages have been updated to fetch and display real data from the Supabase database. New database tables have also been created to support these features.

## Database Changes

### New Tables

A new SQL file `supabase/store_analytics_tables.sql` has been created with the following new tables:

1. **customer_age_distribution**
   - Stores age distribution data for customer analytics
   - Columns: id, store_id, age_group, count, updated_at

2. **monthly_customer_data**
   - Stores monthly customer acquisition data (new vs returning)
   - Columns: id, store_id, month, year, new_customers, returning_customers, updated_at

3. **popular_booking_times**
   - Stores data about popular booking times
   - Columns: id, store_id, time_slot, bookings_count, recorded_date, updated_at

4. **therapist_performance**
   - Stores performance metrics for therapists
   - Columns: id, store_id, therapist_id, bookings_count, rating, recorded_date, updated_at

### Table Modifications

A new SQL file `supabase/services_table_update.sql` has been created to modify the existing services table:

1. **services**
   - Added a new column `store_id` to associate services with stores
   - Created an index for better performance
   - Enabled Row-Level Security (RLS)
   - Added RLS policies for store owners and public access

### RLS Policies

Row-Level Security (RLS) policies have been added to ensure stores can only access their own data.

## Component Updates

### 1. StoreAdminDashboard.tsx

- Replaced mock data with real data from Supabase for the store dashboard
- Added functionality to:
  - Display current month's sales with percentage change from previous month
  - Show current month's booking count with percentage change
  - Count active therapists for the store
  - Count services/courses available at the store
  - Generate monthly revenue trend chart from booking history
  - Create day-of-week booking distribution chart
  - Show customer age distribution from analytics data
  - Handle loading states and error conditions
  - Fall back to mock data when real data is unavailable

### 2. StoreBookings.tsx

- Replaced mock data with real bookings data from Supabase
- Added functionality to:
  - Fetch bookings for therapists associated with the store
  - Display today's bookings
  - Filter bookings by status
  - Check-in clients
  - Cancel bookings
  - View booking details (placeholder)

### 3. StoreCourses.tsx

- Replaced mock data with real services data from Supabase
- Updated to temporarily work without the store_id column until migration is run
- Added functionality to:
  - Fetch services associated with the store
  - Add new services/courses
  - Edit existing services
  - Delete services

### 4. StoreAnalytics.tsx

- Replaced mock data with real analytics data from Supabase
- Added fallback to mock data if the analytics tables don't exist yet
- Added functionality to:
  - Switch between different time periods (week, month, quarter, year)
  - Display loading states
  - Show age distribution charts
  - Show monthly customer data
  - Show popular booking times
  - Show therapist performance metrics

## Implementation Notes

### Dashboard

- The dashboard fetches and calculates sales data from the bookings table
- Therapist counts come from the store_therapists table
- Course counts are retrieved from the services table with fallback to therapist_services
- Daily booking patterns are calculated from the booking dates in the database
- The customer age distribution can come from the customer_age_distribution table when available

### Bookings

- Bookings are linked to therapists, who are linked to stores via the `store_therapists` table
- The system fetches client names, therapist names, and service information via joins
- Date/time formatting is handled with the date-fns library

### Services/Courses

- Services are directly linked to the store via the new `store_id` column (after running the SQL migration)
- Services can be managed (CRUD operations) through the UI
- The component is designed to work even before the migration is run (though with limited functionality)

### Analytics

- Analytics data is seeded with sample data when running the SQL file
- Each analytics table is linked to a store via `store_id`
- Charts are rendered using Recharts
- Mock data is used as a fallback if the analytics tables don't exist yet

## How to Apply These Changes

1. **Run the SQL scripts** to create the required database structure:
   
   First, run the analytics tables script:
   ```
   psql -f supabase/store_analytics_tables.sql
   ```
   
   Then, run the services table update script:
   ```
   psql -f supabase/services_table_update.sql
   ```
   
   Or execute them directly in Supabase SQL editor.

2. **Deploy the updated components**:
   - StoreAdminDashboard.tsx
   - StoreBookings.tsx
   - StoreCourses.tsx
   - StoreAnalytics.tsx

3. **Test the functionality** to ensure everything is working as expected:
   - Check that the dashboard metrics reflect actual data from bookings and services
   - Verify that the charts show data relevant to the store
   - Check that bookings data is properly displayed
   - Test adding and editing services
   - Verify that analytics charts display correctly

## Potential Future Enhancements

1. **Dashboard**:
   - Add real-time repeat customer analysis based on booking history
   - Include conversion rates from inquiries to bookings
   - Add forecasting based on historical data

2. **Bookings**:
   - Implement advanced filtering options
   - Add booking creation form
   - Add detailed booking views

3. **Services**:
   - Add service categories
   - Add service images
   - Add availability settings

4. **Analytics**:
   - Add more detailed revenue analytics
   - Add export functionality
   - Add custom date range selection 

## Known Issues

- The StoreCourses.tsx component will show an error about `column services.store_id does not exist` until the SQL migration is run
- The StoreAnalytics.tsx and StoreAdminDashboard.tsx components may show TypeScript errors related to the Supabase schema types, but they will still function using mock data until the tables are created 