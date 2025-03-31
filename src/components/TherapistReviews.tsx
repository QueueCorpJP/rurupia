import { Star } from 'lucide-react';

interface Review {
  id: number;
  user: string;
  rating: number;
  content: string;
  date: string;
}

interface TherapistReviewsProps {
  reviews: Review[];
}

const TherapistReviews = ({ reviews }: TherapistReviewsProps) => {
  return (
    <div className="mt-8">
      <h2 className="font-semibold text-lg mb-3">お客様の声</h2>
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{review.user}</div>
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{review.date}</div>
              </div>
              <p className="text-sm mt-2">{review.content}</p>
            </div>
          ))
        ) : (
          <div className="border rounded-lg p-6 text-center">
            <p className="text-muted-foreground">まだレビューはありません</p>
            <p className="text-sm mt-2">このセラピストはまだレビューを受けていません。</p>
          </div>
        )}
      </div>
      <button className="w-full mt-4 bg-muted hover:bg-muted/80 text-foreground h-10 px-4 py-2 rounded-md transition-all">
        レビューを書く
      </button>
    </div>
  );
};

export default TherapistReviews;
