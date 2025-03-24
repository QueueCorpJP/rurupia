
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TherapistGalleryViewProps {
  galleryImages?: string[];
  onUploadClick?: () => void;
}

export const TherapistGalleryView = ({ 
  galleryImages = [], 
  onUploadClick 
}: TherapistGalleryViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    if (galleryImages.length === 0) return;
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? galleryImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    if (galleryImages.length === 0) return;
    const isLastSlide = currentIndex === galleryImages.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">ギャラリー写真</h3>
        
        {galleryImages.length > 0 ? (
          <div className="relative w-full h-80">
            <img
              src={galleryImages[currentIndex]}
              alt={`Gallery image ${currentIndex + 1}`}
              className="w-full h-full object-cover rounded-md"
            />
            
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
                {galleryImages.map((_, slideIndex) => (
                  <div
                    key={slideIndex}
                    onClick={() => setCurrentIndex(slideIndex)}
                    className={`h-2 w-2 rounded-full cursor-pointer transition-all ${
                      currentIndex === slideIndex ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 bg-muted/20 rounded-md">
            <p className="text-muted-foreground mb-4">ギャラリー写真がありません</p>
            {onUploadClick && (
              <Button onClick={onUploadClick} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                写真をアップロード
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
