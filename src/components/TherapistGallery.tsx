
import { useState } from 'react';
import { Therapist } from '../utils/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TherapistGalleryProps {
  therapist: Therapist;
}

const TherapistGallery = ({ therapist }: TherapistGalleryProps) => {
  // Mock images for gallery
  const images = [
    therapist.imageUrl,
    'https://images.unsplash.com/photo-1532884988337-3340a0e6a7d5?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1453&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1616803689943-5601631c7fec?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="relative w-full h-96">
      <img
        src={images[currentIndex]}
        alt={`Photo of ${therapist.name}`}
        className="w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button 
          onClick={goToPrevious}
          className="p-2 rounded-full bg-background/80 text-foreground hover:bg-background/90 transition"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={goToNext}
          className="p-2 rounded-full bg-background/80 text-foreground hover:bg-background/90 transition"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0">
        <div className="flex items-center justify-center gap-2">
          {images.map((_, slideIndex) => (
            <div
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`h-2 w-2 rounded-full cursor-pointer transition-all ${
                currentIndex === slideIndex ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapistGallery;
