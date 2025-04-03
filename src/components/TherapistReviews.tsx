import { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star } from 'lucide-react';

interface TherapistReviewsProps {
  therapistId: string;
}

const TherapistReviews = ({ therapistId }: TherapistReviewsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">レビュー</h2>
      
      <Alert>
        <AlertDescription>
          レビュー機能は現在準備中です。近日公開予定ですので、しばらくお待ちください。
        </AlertDescription>
      </Alert>
      
      <div className="text-center py-4 text-muted-foreground">
        このセラピストにはまだレビューがありません
      </div>
    </div>
  );
};

export default TherapistReviews;
