import { useState, useEffect } from 'react';
import { Therapist } from '../utils/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

interface TherapistGalleryProps {
  therapist: Therapist;
}

const TherapistGallery = ({ therapist }: TherapistGalleryProps) => {
  // Default images to use if no gallery images are provided
  const defaultImages = [
    therapist.imageUrl || 'https://placehold.co/600x400/eee/ccc?text=No+Image',
    'https://images.unsplash.com/photo-1532884988337-3340a0e6a7d5?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1453&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1616803689943-5601631c7fec?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3'
  ];

  // Use gallery images from Supabase if available, otherwise use default images
  const [images, setImages] = useState<string[]>(defaultImages);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Check if therapist has gallery images
    console.log("TherapistGallery: Checking therapist data:", {
      therapistId: therapist.id,
      galleryImages: therapist.galleryImages,
      galleryImagesLength: therapist.galleryImages?.length,
      imageUrl: therapist.imageUrl
    });
    
    if (therapist.galleryImages && therapist.galleryImages.length > 0) {
      console.log("Using gallery images from therapist:", therapist.galleryImages);
      // Always include the therapist's profile image as the first image
      const galleryImages = [
        therapist.imageUrl || 'https://placehold.co/600x400/eee/ccc?text=No+Image',
        ...therapist.galleryImages
      ];
      setImages(galleryImages);
    } else {
      console.log("No gallery images found, using default images");
      setImages(defaultImages);
    }
    // Reset index when images change
    setCurrentIndex(0);
  }, [therapist.galleryImages, therapist.imageUrl, therapist.id]);

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

  // Get optimized image URL with appropriate dimensions and object-fit
  const getGalleryImageUrl = (url: string) => {
    const containerWidth = 800; // Approximate max width of the container
    const containerHeight = 384; // Height of the gallery (h-96)
    return getOptimizedImageUrl(url, containerWidth, containerHeight, 80, 'contain');
  };

  return (
    <div className="relative w-full h-96 sm:h-[400px] md:h-[500px] bg-gray-100">
      <img
        src={getGalleryImageUrl(images[currentIndex])}
        alt={`Photo of ${therapist.name}`}
        className="w-full h-full object-contain"
        onError={(e) => {
          // Replace broken image with placeholder
          const target = e.target as HTMLImageElement;
          target.src = 'https://placehold.co/600x400/eee/ccc?text=Image+Not+Found';
        }}
      />
      
      {images.length > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button 
              onClick={goToPrevious}
              className="p-2 rounded-full bg-background/80 text-foreground hover:bg-background/90 transition"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={goToNext}
              className="p-2 rounded-full bg-background/80 text-foreground hover:bg-background/90 transition"
              aria-label="Next image"
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
                  aria-label={`Go to image ${slideIndex + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TherapistGallery;
