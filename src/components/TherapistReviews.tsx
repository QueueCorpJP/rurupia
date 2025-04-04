/*
SQL to run in your Supabase SQL Editor to add support for therapist reviews:

-- Step 1: Create table for tracking therapist reviews
CREATE TABLE IF NOT EXISTS public.therapist_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(therapist_id, user_id)
);

-- Step 2: Add RLS policies to secure the table
ALTER TABLE public.therapist_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select for everyone" ON public.therapist_reviews FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their own reviews" ON public.therapist_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own reviews" ON public.therapist_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own reviews" ON public.therapist_reviews FOR DELETE USING (auth.uid() = user_id);

-- Step 3: Create function to check if a user has booked with a therapist
CREATE OR REPLACE FUNCTION public.has_user_booked_with_therapist(p_user_id UUID, p_therapist_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_booking boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM bookings
    WHERE user_id = p_user_id
    AND therapist_id = p_therapist_id
    AND "status therapist" = 'completed'
  ) INTO has_booking;
  
  RETURN has_booking;
END;
$$;

-- Step 4: Create function to check if a user has already reviewed a therapist
CREATE OR REPLACE FUNCTION public.has_user_reviewed_therapist(p_user_id UUID, p_therapist_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_review boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM therapist_reviews
    WHERE user_id = p_user_id
    AND therapist_id = p_therapist_id
  ) INTO has_review;
  
  RETURN has_review;
END;
$$;

-- Step 5: Create function to get therapist reviews
CREATE OR REPLACE FUNCTION public.get_therapist_reviews(p_therapist_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  rating INTEGER,
  content TEXT,
  user_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tr.id, 
    tr.user_id, 
    tr.rating,
    tr.content,
    COALESCE(p.full_name, u.email) as user_name,
    tr.created_at
  FROM therapist_reviews tr
  LEFT JOIN auth.users u ON tr.user_id = u.id
  LEFT JOIN profiles p ON tr.user_id = p.id
  WHERE tr.therapist_id = p_therapist_id
  ORDER BY tr.created_at DESC;
END;
$$;

-- Step 6: Create function to update therapist average rating
CREATE OR REPLACE FUNCTION public.update_therapist_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_rating DECIMAL;
  review_count INTEGER;
BEGIN
  -- Calculate the average rating for the therapist
  SELECT 
    AVG(rating)::DECIMAL(10,1),
    COUNT(*)
  INTO 
    avg_rating,
    review_count
  FROM therapist_reviews
  WHERE therapist_id = NEW.therapist_id;
  
  -- Update the therapist's rating
  UPDATE therapists
  SET 
    rating = avg_rating,
    review_count = review_count
  WHERE id = NEW.therapist_id;
  
  RETURN NEW;
END;
$$;

-- Step 7: Create triggers to update therapist rating on review changes
CREATE OR REPLACE TRIGGER update_therapist_rating_on_insert
AFTER INSERT ON therapist_reviews
FOR EACH ROW
EXECUTE FUNCTION update_therapist_rating();

CREATE OR REPLACE TRIGGER update_therapist_rating_on_update
AFTER UPDATE ON therapist_reviews
FOR EACH ROW
EXECUTE FUNCTION update_therapist_rating();

CREATE OR REPLACE TRIGGER update_therapist_rating_on_delete
AFTER DELETE ON therapist_reviews
FOR EACH ROW
EXECUTE FUNCTION update_therapist_rating();
*/

import { useState, useEffect } from 'react';
import { Star } from '@/components/ui/star';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import TherapistReviewForm from './TherapistReviewForm';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Custom type for review data
interface Review {
  id: string;
  userName: string;
  rating: number;
  content: string;
  date: string;
}

interface DatabaseReview {
  id: string;
  user_id: string;
  therapist_id: string;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
    username?: string;
  };
}

interface TherapistReviewsProps {
  therapistId: string;
  therapistName?: string;
}

const TherapistReviews = ({ therapistId, therapistName }: TherapistReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchReviews();
  }, [therapistId]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);

    try {
      // Direct query to check if the table exists and fetch reviews in one go
      try {
        // Don't use profiles join initially to avoid relationship errors
        const { data, error } = await supabase
          .from('therapist_reviews')
          .select('id, user_id, rating, content, created_at')
          .eq('therapist_id', therapistId)
          .order('created_at', { ascending: false }) as any;

        if (error) {
          console.error('Error fetching reviews:', error);
          // Table might not exist or other error
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // Got reviews, now get usernames separately to avoid join issues
          const userIds = [...new Set(data.map((review: any) => review.user_id))];
          const userProfiles: Record<string, string> = {};
          
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, full_name, username')
              .in('id', userIds);
              
            if (profileData) {
              profileData.forEach((profile: any) => {
                userProfiles[profile.id] = profile.full_name || profile.username || 'ユーザー';
              });
            }
          } catch (profileError) {
            console.error('Error fetching profiles:', profileError);
          }

          // Transform the data
          const formattedReviews = data.map((review: DatabaseReview) => ({
            id: review.id,
            userName: userProfiles[review.user_id] || 'ユーザー',
            rating: review.rating,
            content: review.content,
            date: format(new Date(review.created_at), 'yyyy/MM/dd')
          }));

          setReviews(formattedReviews);
        }
      } catch (error) {
        console.error('Error in review fetching process:', error);
        setError('レビューの取得中にエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        レビュー
        {reviews.length > 0 && <span className="text-sm font-normal ml-2">({reviews.length}件)</span>}
      </h2>

      <TherapistReviewForm 
        therapistId={therapistId} 
        onReviewSubmitted={handleReviewSubmitted}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>{review.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{review.userName}</div>
                    <div className="text-sm text-muted-foreground">{review.date}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4"
                      filled={star <= review.rating}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm">{review.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          このセラピストにはまだレビューがありません
        </div>
      )}
    </div>
  );
};

export default TherapistReviews;
