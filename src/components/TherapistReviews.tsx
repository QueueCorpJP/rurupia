
import { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star } from 'lucide-react';
import TherapistReviewForm from './TherapistReviewForm';

interface TherapistReviewsProps {
  therapistId: string;
}

const TherapistReviews = ({ therapistId }: TherapistReviewsProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    // Would typically refresh reviews here
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">レビュー</h2>
      
      <TherapistReviewForm 
        therapistId={therapistId} 
        onReviewSubmitted={handleReviewSubmitted} 
      />
      
      <div className="text-center py-4 text-muted-foreground">
        このセラピストにはまだレビューがありません
      </div>
    </div>
  );
};

export default TherapistReviews;
