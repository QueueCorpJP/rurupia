# Therapist Storage and Profile Fixes

This document explains how to fix the issues with therapist profile updates and storage bucket permissions.

## Issues Identified

Based on the console logs, there are two main issues:

1. **Storage bucket permissions for therapists**:
   ```
   Error creating bucket: StorageApiError: new row violates row-level security policy
   ```
   Therapists need appropriate permissions to create and use storage buckets for their profile images.

2. **Missing column in therapists table**:
   ```
   Could not find the 'galleryImages' column of 'therapists' in the schema cache
   ```
   The code is trying to update a column named `galleryImages` but the database schema uses snake_case (`gallery_images`).

## Solution Files

1. **Database Schema Fix (`supabase/therapist_storage_fix.sql`)**:
   - Adds the missing `gallery_images` column to the therapists table
   - Creates storage buckets for therapist files if they don't exist
   - Adds proper RLS policies for therapists to access storage buckets

2. **Code Fix**:
   - Updates the TherapistProfileForm component to use `gallery_images` (snake_case) instead of `galleryImages` (camelCase)

## How to Apply the Fixes

### Step 1: Apply the Database Fixes

1. Go to the Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/therapist_storage_fix.sql`
4. Run the script and verify there are no errors

### Step 2: Verify Storage Buckets

After running the SQL fix:

1. In the Supabase Dashboard, go to the Storage section
2. Verify that there's a 'therapists' bucket (it should be created by the SQL)
3. Check the policies on the bucket (there should be permissions for therapist users)

### Step 3: Test the Fixes

1. Restart the application
2. Log in as a therapist
3. Try to upload images in the therapist profile page
4. Verify that images can be uploaded and the profile can be updated without errors

## Troubleshooting

If issues persist after applying the fixes:

1. **Check the browser console** for any new errors
2. **Verify the RLS policies** are correctly applied in Supabase
3. **Ensure the column was added** to the therapists table

## Technical Details

### Storage Bucket Structure

The fix creates a single `therapists` bucket with subdirectories:

- `therapists/avatars` - For profile pictures
- `therapists/gallery` - For gallery images
- `therapists/documents` - For health documents

### Database Schema Update

The fix adds a `gallery_images TEXT[]` column to the therapists table, which is an array of image URLs.

### RLS Policies

The fix adds policies to allow:
- Therapists to upload files to their own directories
- Public read access to therapist files
- Therapists to update and delete their own files 