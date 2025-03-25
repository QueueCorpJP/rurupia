# Therapist Posts Feature Implementation

This document outlines the implementation of a Twitter-like post feature for therapists in the application.

## Features Implemented

1. **Post Creation**:
   - Text content with title (optional)
   - Image upload support
   - Visibility control (public or followers-only)
   - Scheduled posts

2. **Post Management**:
   - View all posts in a feed
   - Delete posts
   - "Edit" placeholder (UI only, functionality coming later)

3. **Display Features**:
   - Post content with images
   - Creation date formatting
   - Visibility indicators
   - Like count display (functionality coming later)

## Database Changes

The existing `therapist_posts` table has been enhanced with new columns:

```sql
ALTER TABLE therapist_posts 
ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE;
```

Row-Level Security (RLS) policies have been updated to:
- Allow viewing posts based on visibility settings
- Restrict follower-only posts to actual followers
- Always allow therapists to view their own posts

## Components Added/Modified

1. **TherapistPostForm (src/components/therapist/TherapistPostForm.tsx)**:
   - Form for creating and submitting posts
   - Image preview and upload
   - Visibility selection
   - Scheduled post setting

2. **TherapistPosts Page (src/pages/TherapistPosts.tsx)**:
   - List all posts from the logged-in therapist
   - Post management interface
   - Integration with post creation form

## How to Apply These Changes

1. **Database Schema Updates**:
   - Execute the SQL in `supabase/therapist_posts_alter.sql` on your Supabase instance

2. **Component Installation**:
   - The updated files should be in place in your codebase:
     - `src/components/therapist/TherapistPostForm.tsx`
     - `src/pages/TherapistPosts.tsx`

3. **Dependencies**:
   - Ensure you have the following dependencies:
     - date-fns (with ja locale)
     - UUID generation (v4)

## Usage

Therapists can access the post management through the menu. They can:
1. Create new posts with or without images
2. Set visibility to public or followers-only
3. Schedule posts for future publication
4. View and delete existing posts

## Future Enhancements

Future versions might include:
- Post editing functionality
- Like and comment features
- Multiple image uploads per post
- Post analytics
- Enhanced formatting options for post content

## Testing

Test the following scenarios:
1. Creating posts with and without images
2. Setting different visibility options
3. Scheduling posts for the future
4. Deleting posts
5. Viewing posts as different users to verify visibility settings 