
import { useState } from "react";
import { format, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Switch } from "@/components/ui/switch";
import { ImageIcon, Calendar, Globe, Lock, X } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const TherapistPostForm = () => {
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [timeSlot, setTimeSlot] = useState<string>("指定なし");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setSelectedImage(file.name);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
  };

  const handlePost = () => {
    if (!postContent.trim() && !selectedImage) {
      toast.error("投稿内容または画像を入力してください");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate posting delay
    setTimeout(() => {
      console.log("Posting:", {
        content: postContent,
        image: selectedImage,
        isScheduled,
        scheduledDate,
        timeSlot,
        isPrivate
      });
      
      // Show success message
      if (isScheduled) {
        toast.success("投稿を予約しました", {
          description: scheduledDate 
            ? `${format(scheduledDate, 'yyyy年MM月dd日', { locale: ja })}に公開されます`
            : "指定した日時に公開されます",
        });
      } else {
        toast.success("投稿しました");
      }
      
      // Reset form
      setPostContent("");
      setSelectedImage(null);
      setPreviewImage(null);
      setIsScheduled(false);
      setScheduledDate(addDays(new Date(), 1));
      setIsPrivate(false);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">投稿</h2>
      
      <div className="border rounded-lg p-4 bg-card">
        <Textarea
          placeholder="今日の出来事や状況を投稿しましょう"
          rows={4}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="resize-none mb-4 border-none focus-visible:ring-0 p-0"
        />
        
        {previewImage && (
          <div className="relative mb-4">
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full max-h-80 object-cover rounded-md" 
            />
            <button 
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="border-t pt-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div>
                <Input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" type="button" className="gap-1">
                    <ImageIcon className="h-4 w-4" />
                    写真
                  </Button>
                </Label>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" type="button" className={`gap-1 ${isScheduled ? 'bg-primary/10 border-primary/20 text-primary' : ''}`}>
                    <Calendar className="h-4 w-4" />
                    {isScheduled ? '予約投稿' : '今すぐ投稿'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="scheduled-post" className="text-sm font-medium">
                        予約投稿
                      </Label>
                      <Switch
                        id="scheduled-post"
                        checked={isScheduled}
                        onCheckedChange={setIsScheduled}
                      />
                    </div>
                    
                    {isScheduled && (
                      <DateTimePicker
                        date={scheduledDate}
                        setDate={setScheduledDate}
                        timeSlot={timeSlot}
                        setTimeSlot={setTimeSlot}
                        className="mt-2"
                      />
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                className={`gap-1 ${isPrivate ? 'bg-primary/10 border-primary/20 text-primary' : ''}`}
                onClick={() => setIsPrivate(!isPrivate)}
              >
                {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                {isPrivate ? 'フォロワー限定' : '全員に公開'}
              </Button>
            </div>
            
            <div className="ml-auto">
              <Button 
                onClick={handlePost}
                disabled={(!postContent.trim() && !selectedImage) || isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? '投稿中...' : isScheduled ? '予約投稿する' : '投稿する'}
              </Button>
            </div>
          </div>
          
          {postContent.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              {postContent.length}/140 文字
              {postContent.length > 140 && (
                <span className="text-amber-500 ml-1">
                  （140文字を超える部分は折りたたまれます）
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
