
import { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';

interface TherapistReviewFormProps {
  therapistId: string;
  onReviewSubmitted: () => void;
}

export default function TherapistReviewForm({ therapistId, onReviewSubmitted }: TherapistReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  
  return (
    <Alert>
      <AlertDescription>
        レビュー機能は現在準備中です。近日公開予定ですので、しばらくお待ちください。
      </AlertDescription>
    </Alert>
  );
} 
