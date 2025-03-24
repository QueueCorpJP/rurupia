# Supabase Setup Instructions

This document contains instructions to fix the Supabase configuration issues in the Therapist Connectivity app.

## Issues Fixed

1. Added rich text editor (TinyMCE) for blog creation
2. Fixed Row Level Security (RLS) policies for:
   - Blog posts
   - Storage bucket for blog images
   - Page views table

## Setup Instructions

### 1. Run SQL Commands

To fix the Supabase configuration, you need to run the SQL commands in `supabase-setup.sql`. Here's how:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of `supabase-setup.sql` from this project
4. Run the SQL commands

The SQL script will:
- Create a 'blog' storage bucket
- Set up proper RLS policies for storage objects
- Fix the blog_posts table RLS policies
- Add RLS policies for page_views table

### 2. Verify Admin User

Ensure your admin user has the correct user_type:

1. Go to the Supabase Table Editor
2. Open the 'profiles' table
3. Find your user and make sure the 'user_type' column is set to 'admin'

```sql
-- You can also run this SQL to update your user to admin:
UPDATE profiles 
SET user_type = 'admin' 
WHERE id = 'your-auth-user-id';
```

## Troubleshooting

If you're still experiencing issues:

### Blog Post Creation Fails

Check the browser console for error messages. Common issues:

1. **403 Unauthorized**: You need to be logged in as an admin user
2. **Storage bucket doesn't exist**: Run the SQL commands to create the bucket
3. **RLS policy violation**: Make sure your user has admin privileges

### Page Views Not Loading

The dashboard may show errors when loading page_views. This happens because:

1. The created_at column might be missing
2. The RLS policy may be preventing access

Run the following SQL to fix:

```sql
-- Add created_at column if it doesn't exist
ALTER TABLE page_views 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Make sure the RLS policy exists
CREATE POLICY IF NOT EXISTS "Allow admin users to view page_views" ON public.page_views
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
  )
);
```

## Additional Information

- The rich text editor uses TinyMCE, which requires an active internet connection
- All admin functions require a user with 'admin' user_type in the profiles table
- Blog images are stored in the 'blog' storage bucket with public read access 