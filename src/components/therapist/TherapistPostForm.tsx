
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Calendar, LockIcon, Globe } from "lucide-react";
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

export const TherapistPostForm = () => {
  const [postContent, setPostContent] = useState("");
  const [postVisibility, setPostVisibility] = useState<"public" | "followers">("public");
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);

  const CHARACTER_LIMIT = 140;
  const remainingChars = CHARACTER_LIMIT - postContent.length;

  const handlePost = () => {
    if (!postContent.trim()) return;
    
    const postDetails = {
      content: postContent,
      visibility: postVisibility,
      scheduledDate,
    };
    
    console.log("投稿:", postDetails);
    
    // In a real app, this would post to the backend
    toast.success("投稿が完了しました", {
      description: scheduledDate 
        ? `投稿は${scheduledDate}に公開されます` 
        : "投稿が公開されました",
    });
    
    // Reset form
    setPostContent("");
    setPostVisibility("public");
    setScheduledDate(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">投稿</h2>
      
      <div className="border rounded-lg p-4">
        <Textarea
          placeholder="今日の出来事や状況を投稿しましょう"
          rows={4}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="resize-none mb-2 border-none focus-visible:ring-0 p-0 text-sm"
          maxLength={1000} // Set a reasonable max length
        />
        
        <div className="text-xs text-right text-muted-foreground mb-3">
          {remainingChars <= 20 ? (
            <span className={remainingChars < 0 ? "text-red-500" : "text-amber-500"}>
              残り{remainingChars}文字
            </span>
          ) : null}
        </div>
        
        <div className="flex justify-between items-center border-t pt-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs">
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
            disabled={!postContent.trim()}
            className="bg-black text-white hover:bg-black/90 text-sm"
          >
            投稿
          </Button>
        </div>
      </div>
    </div>
  );
};
