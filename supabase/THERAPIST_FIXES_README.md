# Therapist Signup & Database Fixes

This document explains the fixes for the issues with therapist signup and database configuration.

## Issues Identified

Based on the console logs, we've identified several issues:

1. **NOT NULL constraint violation on therapists.price column**:
   ```
   null value in column "price" of relation "therapists" violates not-null constraint
   ```

2. **Row-Level Security (RLS) policy issues for store_therapists table**:
   ```
   new row violates row-level security policy for table "store_therapists"
   ```

3. **Missing Relationship Records**: Therapists can create profiles but not complete the full database setup.

## Solution Files

We've created several fixes:

1. **Code Fix (`src/pages/TherapistSignup.tsx`)**:
   - Fixed the `createTherapistRecord` function to use a default price value (5000) instead of null
   - Added better error handling and logging
   - Made the store-therapist relationship creation more resilient to failures

2. **Database Schema Fix (`supabase/therapist_schema_fix.sql`)**:
   - Makes the price column in the therapists table nullable
   - Updates any existing records with problematic values
   - Adds appropriate indexes for performance

3. **RLS Policy Fixes (`supabase/store_therapist_relation_fix.sql`)**:
   - Adds proper policies for therapists to create records in store_therapists table
   - Sets up policies for therapists and stores to view and update relationships

4. **Combined Fix (`supabase/combined_therapist_fix.sql`)**:
   - A comprehensive fix that addresses all issues in one file
   - Includes data consistency checks and fixes
   - Creates missing records in the therapists table
   - Updates all needed RLS policies

## How to Apply the Fixes

1. **Update the Code**:
   - The changes to `TherapistSignup.tsx` have been applied to use default values and better error handling

2. **Run the Database Fixes**:
   - Go to the Supabase Dashboard
   - Navigate to the SQL Editor
   - Either run the individual SQL fixes or use the combined fix:
     - For a complete solution: Copy and paste the contents of `supabase/combined_therapist_fix.sql`
     - Run the script and verify the output

3. **Test the Fix**:
   - Try signing up as a therapist using a store invitation link
   - Verify that:
     - The profile is created successfully
     - The therapist record is created in the therapists table
     - You can access the therapist profile page

## Understanding the Fixes

1. **Schema Constraint Fix**:
   - The therapists table had a NOT NULL constraint on the price column, but we were trying to insert NULL
   - We've modified the schema to allow NULL values in this column
   - In the code, we now use a default value of 5000 to avoid the issue

2. **Row-Level Security (RLS) Policy Fixes**:
   - Added policies allowing therapists to create their own records
   - Added policies for store-therapist relationships
   - Fixed problematic policies that were causing permission issues

3. **Data Consistency**:
   - Added queries to find and fix any inconsistent data
   - Created missing therapist records for existing profiles
   - Updated status values for consistency

## Monitoring & Verification

After applying the fixes, the system will:

1. Log successful creation of therapist records
2. Handle store-therapist relationships appropriately
3. Show proper therapist data on the profile page

If issues persist, check the browser console for detailed error messages. 