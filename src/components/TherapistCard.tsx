
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { Therapist } from '../utils/types';

interface TherapistCardProps {
  therapist: Therapist;
}

const TherapistCard = ({ therapist }: TherapistCardProps) => {
  return (
    <Link 
      to={`/therapists/${therapist.id}`}
      className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img 
          src={therapist.imageUrl} 
          alt={therapist.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg">{therapist.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="text-sm font-medium">{therapist.rating}</span>
            <span className="text-sm text-muted-foreground">({therapist.reviews})</span>
          </div>
        </div>
        
        <div className="mt-1 flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-3 w-3" />
          {therapist.location}
        </div>
        
        <div className="mt-2">
          <div className="flex flex-wrap gap-1 mt-2">
            {therapist.specialties.map((specialty, index) => (
              <span 
                key={index}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
        
        <p className="mt-3 text-sm line-clamp-2">{therapist.description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-foreground">${therapist.price}</span>
            <span className="text-muted-foreground"> / hour</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {therapist.experience} years exp.
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TherapistCard;
