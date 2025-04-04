# Therapist Connectivity Database Setup

This directory contains the necessary SQL scripts to set up the database for the Therapist Connectivity application.

## Overview

The `database-setup.sql` file includes scripts for creating and configuring:

1. **Therapist Reviews System**
   - Creates the `therapist_reviews` table
   - Adds rating and review_count columns to the `therapists` table
   - Sets up a trigger to update therapist ratings automatically
   - Configures Row Level Security (RLS) policies

2. **Post Interaction System**
   - Creates the `post_likes` and `post_comments` tables
   - Sets up triggers to update like and comment counts automatically
   - Configures Row Level Security (RLS) policies
   - Provides utility functions for checking likes and getting comments

## How to Apply These Changes

### Option 1: Using the Supabase UI

1. Log in to your Supabase project
2. Go to the SQL Editor
3. Copy and paste the content of `database-setup.sql`
4. Run the script

### Option 2: Using the Supabase CLI

1. Install the Supabase CLI if you haven't already:
   ```
   npm install -g supabase
   ```

2. Log in to Supabase:
   ```
   supabase login
   ```

3. Link your project:
   ```
   supabase link --project-ref your-project-ref
   ```

4. Run the SQL script:
   ```
   supabase db push --db-url your-database-url --sql-file api/database-setup.sql
   ```

## Troubleshooting

### Ambiguous Column Reference

If you see an error like:
```
ERROR: column reference "review_count" is ambiguous
```

This means that the column exists in multiple tables or the trigger function isn't qualifying column names properly. The scripts in `database-setup.sql` should fix this issue by using table aliases.

### Missing Tables

If your application shows that features are "under preparation," it likely means the required tables don't exist yet. Running these scripts will create the necessary tables.

### Connection Issues

If you're having issues connecting to the database:
1. Verify your Supabase credentials
2. Check network connectivity
3. Ensure your IP is allowed in Supabase's access control

## Application Integration

After running these scripts, the following features should work:

1. Users can review therapists (if they've had a completed session)
2. Users can like therapist posts
3. Users can comment on therapist posts
4. Users can share posts (client-side implementation) 