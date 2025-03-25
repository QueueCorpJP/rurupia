import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, UploadCloud } from 'lucide-react';
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
  const [displayImages, setDisplayImages] = useState<string[]>([]);

  // Effect to set display images and validate them
  useEffect(() => {
    if (!galleryImages || !Array.isArray(galleryImages)) {
      console.log("Gallery images not provided or not in expected format:", galleryImages);
      setDisplayImages([]);
      return;
    }

    // Filter out any invalid URLs
    const validImages = galleryImages.filter(url => 
      typeof url === 'string' && url.trim() !== '');

    console.log("Valid gallery images:", validImages);
    setDisplayImages(validImages);
    
    // Reset current index if it's out of bounds
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0);
    }
  }, [galleryImages, currentIndex]);

  const goToPrevious = () => {
    if (displayImages.length === 0) return;
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? displayImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    if (displayImages.length === 0) return;
    const isLastSlide = currentIndex === displayImages.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">ギャラリー写真</h3>
        
        {displayImages.length > 0 ? (
          <div className="relative w-full h-80">
            <img
              src={displayImages[currentIndex]}
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
                {displayImages.map((_, slideIndex) => (
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
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-md border border-dashed border-gray-300 h-80">
            <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4 text-center">
              ギャラリーに写真がありません。<br/>
              プロフィールタブからアップロードしてください。
            </p>
            {onUploadClick && (
              <Button 
                variant="outline" 
                onClick={onUploadClick} 
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                写真をアップロード
              </Button>
            )}
          </div>
        )}
        
        {displayImages.length > 0 && onUploadClick && (
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={onUploadClick}
            >
              <Plus className="mr-2 h-4 w-4" />
              もっと写真をアップロード
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
