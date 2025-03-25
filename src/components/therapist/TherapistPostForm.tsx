import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Calendar, LockIcon, Globe, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface TherapistPostFormProps {
  onPostCreated?: () => void;
}

export const TherapistPostForm = ({ onPostCreated }: TherapistPostFormProps) => {
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postVisibility, setPostVisibility] = useState<"public" | "followers">("public");
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CHARACTER_LIMIT = 140;
  const remainingChars = CHARACTER_LIMIT - postContent.length;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${uuidv4()}.${fileExt}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('therapists')
        .upload(`posts/${filePath}`, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }
      
      const { data } = supabase
        .storage
        .from('therapists')
        .getPublicUrl(`posts/${filePath}`);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      return null;
    }
  };

  const handlePost = async () => {
    if (!postContent.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("認証エラー", { description: "ログインしていません。再度ログインしてください。" });
        return;
      }
      
      let imageUrl = null;
      
      // If an image was selected, upload it first
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage, user.id);
        if (!imageUrl) {
          toast.error("画像アップロードエラー", { description: "画像のアップロードに失敗しました。" });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Prepare the post data
      const postData = {
        therapist_id: user.id,
        title: postTitle || "無題の投稿", // Default title if none is provided
        content: postContent,
        visibility: postVisibility,
        image_url: imageUrl,
        scheduled_date: scheduledDate ? new Date(scheduledDate).toISOString() : null,
        created_at: new Date().toISOString(),
        likes: 0
      };
      
      // Insert the post
      const { error: insertError } = await supabase
        .from('therapist_posts')
        .insert([postData]);
      
      if (insertError) {
        console.error('Error creating post:', insertError);
        toast.error("投稿エラー", { description: "投稿の作成に失敗しました。" });
        setIsSubmitting(false);
        return;
      }
      
      // Success!
      toast.success("投稿が完了しました", {
        description: scheduledDate 
          ? `投稿は${scheduledDate}に公開されます` 
          : "投稿が公開されました",
      });
      
      // Reset form
      setPostContent("");
      setPostTitle("");
      setPostVisibility("public");
      setScheduledDate(null);
      setSelectedImage(null);
      setImagePreviewUrl(null);
      
      // Call the callback if provided
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error in handlePost:', error);
      toast.error("エラーが発生しました", { description: "投稿の作成中にエラーが発生しました。" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">投稿</h2>
      
      <div className="border rounded-lg p-4">
        <input
          type="text"
          placeholder="タイトル (任意)"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          className="w-full text-lg font-medium mb-2 border-none focus-visible:ring-0 p-0"
        />
        
        <Textarea
          placeholder="今日の出来事や状況を投稿しましょう"
          rows={4}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="resize-none mb-2 border-none focus-visible:ring-0 p-0 text-sm"
          maxLength={1000} // Set a reasonable max length
        />
        
        {imagePreviewUrl && (
          <div className="relative mt-2 mb-4">
            <img 
              src={imagePreviewUrl} 
              alt="Selected" 
              className="max-h-64 rounded-md object-contain mx-auto"
            />
            <button 
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        <div className="text-xs text-right text-muted-foreground mb-3">
          {remainingChars <= 20 ? (
            <span className={remainingChars < 0 ? "text-red-500" : "text-amber-500"}>
              残り{remainingChars}文字
            </span>
          ) : null}
        </div>
        
        <div className="flex justify-between items-center border-t pt-3">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageSelect}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              写真・動画
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <Calendar className="h-4 w-4 mr-1" />
                  {scheduledDate ? "予約済み" : "予約投稿"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">投稿日時を設定</h4>
                  <p className="text-xs text-muted-foreground">
                    投稿を予約すると、指定した日時に自動的に公開されます。
                  </p>
                  <input 
                    type="datetime-local"
                    className="w-full border rounded p-2 text-sm"
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  
                  {scheduledDate && (
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => setScheduledDate(null)}
                      >
                        予約解除
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            <Select 
              value={postVisibility}
              onValueChange={(value) => setPostVisibility(value as "public" | "followers")}
            >
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue>
                  {postVisibility === "public" ? (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <span>全員に公開</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LockIcon className="h-4 w-4 mr-1" />
                      <span>フォロワーのみ</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public" className="text-xs">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    全員に公開
                  </div>
                </SelectItem>
                <SelectItem value="followers" className="text-xs">
                  <div className="flex items-center">
                    <LockIcon className="h-4 w-4 mr-1" />
                    フォロワーのみ
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handlePost}
            disabled={!postContent.trim() || isSubmitting}
            className="bg-black text-white hover:bg-black/90 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                投稿中...
              </>
            ) : "投稿"}
          </Button>
        </div>
      </div>
    </div>
  );
};
