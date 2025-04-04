-- Database setup for Therapist Connectivity features

-- ==================== THERAPIST REVIEWS ==================== 

-- Create therapist_reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.therapist_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(therapist_id, user_id) -- Each user can only review a therapist once
);

-- Add columns to therapists table if they don't exist
ALTER TABLE public.therapists ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1) DEFAULT NULL;
ALTER TABLE public.therapists ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Fix the trigger function to avoid ambiguous column references
CREATE OR REPLACE FUNCTION public.update_therapist_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_rating DECIMAL;
  count_reviews INTEGER;
BEGIN
  -- Calculate the average rating for the therapist
  SELECT 
    AVG(tr.rating)::DECIMAL(10,1),
    COUNT(tr.id)
  INTO 
    avg_rating,
    count_reviews
  FROM public.therapist_reviews tr
  WHERE tr.therapist_id = NEW.therapist_id;
  
  -- Update the therapist's rating - using fully qualified column names to avoid ambiguity
  UPDATE public.therapists t
  SET 
    t.rating = avg_rating,
    t.review_count = count_reviews
  WHERE t.id = NEW.therapist_id;
  
  RETURN NEW;
END;
$$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_therapist_rating_trigger ON public.therapist_reviews;
CREATE TRIGGER update_therapist_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.therapist_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_therapist_rating();

-- Add RLS policies for therapist_reviews
ALTER TABLE public.therapist_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all reviews
CREATE POLICY therapist_reviews_select_policy
  ON public.therapist_reviews
  FOR SELECT
  USING (true);

-- Policy: Users can only insert their own reviews and only if they have a completed booking with the therapist
CREATE POLICY therapist_reviews_insert_policy
  ON public.therapist_reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE user_id = auth.uid()
      AND therapist_id = therapist_reviews.therapist_id
      AND status = 'completed'
    )
  );

-- Policy: Users can only update their own reviews
CREATE POLICY therapist_reviews_update_policy
  ON public.therapist_reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own reviews
CREATE POLICY therapist_reviews_delete_policy
  ON public.therapist_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== POST LIKES ==================== 

-- Create post_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.therapist_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id) -- Each user can only like a post once
);

-- Add RLS policies for post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all likes
CREATE POLICY post_likes_select_policy
  ON public.post_likes
  FOR SELECT
  USING (true);

-- Policy: Users can only insert their own likes
CREATE POLICY post_likes_insert_policy
  ON public.post_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own likes
CREATE POLICY post_likes_delete_policy
  ON public.post_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update post like count
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  like_count INTEGER;
BEGIN
  -- Calculate total likes for the post
  SELECT COUNT(*)
  INTO like_count
  FROM public.post_likes
  WHERE post_id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.post_id
    ELSE NEW.post_id
  END;
  
  -- Update the post's like count
  UPDATE public.therapist_posts
  SET likes = like_count
  WHERE id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.post_id
    ELSE NEW.post_id
  END;
  
  RETURN NULL;
END;
$$;

-- Create the trigger for post likes
DROP TRIGGER IF EXISTS update_post_like_count_trigger ON public.post_likes;
CREATE TRIGGER update_post_like_count_trigger
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_post_like_count();

-- ==================== POST COMMENTS ==================== 

-- Create post_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.therapist_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for post_comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all comments
CREATE POLICY post_comments_select_policy
  ON public.post_comments
  FOR SELECT
  USING (true);

-- Policy: Users can only insert their own comments
CREATE POLICY post_comments_insert_policy
  ON public.post_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own comments
CREATE POLICY post_comments_update_policy
  ON public.post_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own comments
CREATE POLICY post_comments_delete_policy
  ON public.post_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment_count column to therapist_posts if it doesn't exist
ALTER TABLE public.therapist_posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Function to update post comment count
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  comment_count INTEGER;
BEGIN
  -- Calculate total comments for the post
  SELECT COUNT(*)
  INTO comment_count
  FROM public.post_comments
  WHERE post_id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.post_id
    ELSE NEW.post_id
  END;
  
  -- Update the post's comment count
  UPDATE public.therapist_posts
  SET comment_count = comment_count
  WHERE id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.post_id
    ELSE NEW.post_id
  END;
  
  RETURN NULL;
END;
$$;

-- Create the trigger for post comments
DROP TRIGGER IF EXISTS update_post_comment_count_trigger ON public.post_comments;
CREATE TRIGGER update_post_comment_count_trigger
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_post_comment_count();

-- ==================== API FUNCTIONS ==================== 

-- Function to check if a user has liked a post
CREATE OR REPLACE FUNCTION public.has_user_liked_post(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.post_likes
    WHERE post_id = p_post_id AND user_id = p_user_id
  );
END;
$$;

-- Function to get comments for a post
CREATE OR REPLACE FUNCTION public.get_post_comments(p_post_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  username TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT 
      c.id,
      c.user_id,
      c.content,
      c.created_at,
      p.username,
      p.full_name
    FROM 
      public.post_comments c
    LEFT JOIN
      public.profiles p ON c.user_id = p.id
    WHERE
      c.post_id = p_post_id
    ORDER BY
      c.created_at DESC;
END;
$$; 