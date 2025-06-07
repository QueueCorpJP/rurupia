import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, UploadCloud, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TherapistGalleryViewProps {
  galleryImages?: string[];
  onUploadClick?: () => void;
}

export const TherapistGalleryView = ({ 
  galleryImages: initialGalleryImages = [], 
  onUploadClick 
}: TherapistGalleryViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>(initialGalleryImages);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Update local state when prop changes
  useEffect(() => {
    setGalleryImages(initialGalleryImages);
  }, [initialGalleryImages]);

  const displayImages = galleryImages.length > 0 ? galleryImages : [];

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !userId) return;

    const files = Array.from(e.target.files);
    if (galleryImages.length + files.length > 5) {
      toast.error("画像は最大5枚までです");
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('therapists')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('therapists').getPublicUrl(filePath);
        if (data) {
          uploadedUrls.push(data.publicUrl);
        }
      }

      // Update the therapist record with new gallery images
      const newGalleryImages = [...galleryImages, ...uploadedUrls];
      const { error: updateError } = await supabase
        .from('therapists')
        .update({ gallery_images: newGalleryImages })
        .eq('id', userId);

      if (updateError) throw updateError;

      setGalleryImages(newGalleryImages);
      toast.success(`${uploadedUrls.length}枚の画像をアップロードしました`);

      // Clear the input
      e.target.value = '';
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(`画像のアップロードに失敗しました: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (indexToRemove: number) => {
    if (!userId) return;

    try {
      const newGalleryImages = galleryImages.filter((_, index) => index !== indexToRemove);
      
      const { error: updateError } = await supabase
        .from('therapists')
        .update({ gallery_images: newGalleryImages })
        .eq('id', userId);

      if (updateError) throw updateError;

      setGalleryImages(newGalleryImages);
      
      // Adjust current index if necessary
      if (currentIndex >= newGalleryImages.length && newGalleryImages.length > 0) {
        setCurrentIndex(newGalleryImages.length - 1);
      } else if (newGalleryImages.length === 0) {
        setCurrentIndex(0);
      }

      toast.success('画像を削除しました');
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast.error(`画像の削除に失敗しました: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">ギャラリー写真</h3>
        
        {/* File upload input */}
        <div className="mb-4">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading || galleryImages.length >= 5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            最大5枚まで選択できます。現在 {galleryImages.length}/5 枚。
          </p>
        </div>
        
        {displayImages.length > 0 ? (
          <div className="relative w-full h-96 sm:h-[400px] md:h-[500px] mb-4">
            <img
              src={displayImages[currentIndex]}
              alt={`Gallery image ${currentIndex + 1}`}
              className="w-full h-full object-cover rounded-md"
            />
            
            {/* Remove image button */}
            <button
              onClick={() => handleRemoveImage(currentIndex)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 text-white"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
            
            {displayImages.length > 1 && (
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
            )}
            
            {displayImages.length > 1 && (
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
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-md border border-dashed border-gray-300 h-80">
            <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4 text-center">
              ギャラリーに写真がありません。<br/>
              上のファイル選択ボタンから写真をアップロードしてください。
            </p>
          </div>
        )}
        
        {/* Gallery thumbnail grid */}
        {displayImages.length > 1 && (
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-2">
            {displayImages.map((url, index) => (
              <div
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                  currentIndex === index ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img 
                  src={url} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-0.5 text-white"
                  aria-label="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {uploading && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            アップロード中...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
