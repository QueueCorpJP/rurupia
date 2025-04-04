import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Star, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

/*
If you encounter errors with missing columns or ambiguous column references, please run this SQL:

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
  
  -- Update the therapist's rating - using table aliases to avoid ambiguity
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
*/

interface TherapistReviewFormProps {
  therapistId: string;
  onReviewSubmitted?: () => void;
}

// Custom type for therapist_reviews table
interface TherapistReview {
  id: string;
  therapist_id: string;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function TherapistReviewForm({
  therapistId,
  onReviewSubmitted,
}: TherapistReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [canSubmitReview, setCanSubmitReview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "info" | "warning" | "error";
  } | null>(null);
  const [tableExists, setTableExists] = useState(false);

  // Check if user can submit a review
  useEffect(() => {
    const checkReviewability = async () => {
      setLoading(true);
      setStatusMessage(null);

      try {
        // Get current user
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        if (!user) {
          setStatusMessage({
            text: "レビューを投稿するにはログインが必要です。",
            type: "warning",
          });
          setCanSubmitReview(false);
          setLoading(false);
          setCurrentUser(null);
          return;
        }

        setCurrentUser(user);

        // Check if the therapist_reviews table exists by directly querying it
        try {
          // Use a simple query with limit 0 to check if the table exists
          const { error: tableCheckError } = await supabase
            .from('therapist_reviews')
            .select('id')
            .limit(0) as any;

          // If there's no error, the table exists
          setTableExists(!tableCheckError);

          if (tableCheckError) {
            console.error('Table existence check error:', tableCheckError);
            setStatusMessage({
              text: "レビュー機能は現在準備中です。もうしばらくお待ちください。",
              type: "info",
            });
            setCanSubmitReview(false);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error checking table existence:', error);
          setTableExists(false);
          setStatusMessage({
            text: "レビュー機能は現在準備中です。もうしばらくお待ちください。",
            type: "info",
          });
          setCanSubmitReview(false);
          setLoading(false);
          return;
        }
        
        // If we reach here, the table exists
        
        // 1. Check if the user has completed a session with this therapist
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('id')
          .eq('user_id', user.id)
          .eq('therapist_id', therapistId)
          .eq('status therapist', 'completed')
          .maybeSingle() as any;
        
        const hasCompletedBooking = !!bookingData;
        
        // 2. Check if the user has already reviewed the therapist
        const { data: reviewData, error: reviewError } = await supabase
          .from('therapist_reviews')
          .select('id')
          .eq('user_id', user.id)
          .eq('therapist_id', therapistId)
          .maybeSingle() as any;
          
        const hasReviewed = !!reviewData;
        
        if (hasReviewed) {
          setStatusMessage({
            text: "このセラピストに対してすでにレビューを投稿済みです。",
            type: "info",
          });
          setCanSubmitReview(false);
        } else if (!hasCompletedBooking) {
          setStatusMessage({
            text: "レビューを投稿するには、このセラピストのセッションを完了している必要があります。",
            type: "warning",
          });
          setCanSubmitReview(false);
        } else {
          // User can submit a review
          setCanSubmitReview(true);
        }
      } catch (error) {
        console.error('Error checking reviewability:', error);
        setStatusMessage({
          text: "レビュー資格の確認中にエラーが発生しました。",
          type: "error",
        });
        setCanSubmitReview(false);
      } finally {
        setLoading(false);
      }
    };

    checkReviewability();
  }, [therapistId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("評価を選択してください");
      return;
    }

    if (!reviewText.trim()) {
      toast.error("レビュー内容を入力してください");
      return;
    }

    if (!currentUser) {
      toast.error("レビューを投稿するにはログインが必要です");
      return;
    }

    if (!tableExists) {
      toast.info("レビュー機能は現在準備中です");
      return;
    }

    setSubmitting(true);

    try {
      // Insert the review into the therapist_reviews table
      const { data, error } = await supabase
        .from('therapist_reviews')
        .insert({
          therapist_id: therapistId,
          user_id: currentUser.id,
          rating,
          content: reviewText
        }) as any; // Type assertion to avoid TypeScript errors
      
      if (error) {
        console.error('Error submitting review:', error);
        
        // Check for specific error codes
        if (error.code === '42703') {
          toast.error("レビュー機能はまだ完全に設定されていません。管理者に連絡してください。");
        } else if (error.code === '42702') {
          // Ambiguous column reference
          toast.error("データベースの設定に問題があります。管理者に連絡してください。");
          console.error("Please run the SQL commands at the top of this file to fix the ambiguous column reference");
        } else if (error.code === '23505') {
          // Unique violation - user already reviewed this therapist
          toast.error("このセラピストに対してすでにレビューを投稿済みです。");
          setStatusMessage({
            text: "このセラピストに対してすでにレビューを投稿済みです。",
            type: "info",
          });
          setCanSubmitReview(false);
        } else {
          toast.error(`レビューの投稿に失敗しました: ${error.message}`);
        }
        return;
      }
      
      // Success!
      toast.success("レビューを投稿しました！");
      
      // Reset form
      setRating(0);
      setReviewText("");
      
      // Update status
      setCanSubmitReview(false);
      setStatusMessage({
        text: "このセラピストに対してすでにレビューを投稿済みです。",
        type: "info",
      });
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("レビューの投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium mb-3">レビューを投稿</h3>
      
      {statusMessage && (
        <Alert variant={statusMessage.type === "error" ? "destructive" : "default"} className="mb-4">
          <AlertDescription>{statusMessage.text}</AlertDescription>
        </Alert>
      )}

      {canSubmitReview && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">評価</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="focus:outline-none p-1"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star 
                    fill={value <= (hoverRating || rating) ? "currentColor" : "none"}
                    className="h-6 w-6"
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 ? `${rating}点` : "評価を選択"}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              レビュー内容
            </label>
            <Textarea
              id="content"
              placeholder="セラピストについてのレビューを書いてください..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                送信中...
              </>
            ) : (
              "投稿する"
            )}
          </Button>
        </form>
      )}
    </div>
  );
} 
