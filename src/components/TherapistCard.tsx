
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart } from 'lucide-react';
import { Therapist } from '../utils/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TherapistCardProps {
  therapist: Therapist;
  className?: string;
}

const TherapistCard = ({ therapist, className }: TherapistCardProps) => {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group", className)}>
      <div className="absolute right-4 top-4 z-10">
        <button className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:text-pink-500 transition-colors">
          <Heart className="h-5 w-5" />
        </button>
      </div>
      
      <Link to={`/therapists/${therapist.id}`}>
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img 
            src={therapist.imageUrl} 
            alt={therapist.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <Link to={`/therapists/${therapist.id}`}>
            <h3 className="font-bold text-xl hover:text-primary transition-colors">{therapist.name}</h3>
          </Link>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="text-sm font-medium">{therapist.rating}</span>
            <span className="text-sm text-muted-foreground">({therapist.reviews})</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="mr-1 h-4 w-4 text-primary" />
          {therapist.location}
        </div>
        
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {therapist.specialties.map((specialty, index) => (
              <span 
                key={index}
                className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{therapist.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-pink-100">
          <div className="text-sm font-medium">
            <span className="text-lg font-bold text-foreground">${therapist.price}</span>
            <span className="text-muted-foreground"> / 時間</span>
          </div>
          <Link to={`/therapists/${therapist.id}`}>
            <Button variant="outline" size="sm" className="rounded-full px-4 border-pink-200">
              詳細を見る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TherapistCard;
