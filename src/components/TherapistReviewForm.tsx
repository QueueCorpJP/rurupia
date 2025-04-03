import { Alert, AlertDescription } from "@/components/ui/alert";

interface TherapistReviewFormProps {
  therapistId: string;
  onReviewSubmitted: () => void;
}

export default function TherapistReviewForm({ therapistId, onReviewSubmitted }: TherapistReviewFormProps) {
  return (
    <Alert>
      <AlertDescription>
        レビュー機能は現在準備中です。近日公開予定ですので、しばらくお待ちください。
      </AlertDescription>
    </Alert>
  );
} 