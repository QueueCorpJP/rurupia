
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon } from "lucide-react";

export const TherapistPostForm = () => {
  const [postContent, setPostContent] = useState("");

  const handlePost = () => {
    if (!postContent.trim()) return;
    console.log("Posting:", postContent);
    // In a real app, this would post to the backend
    setPostContent("");
    // Add success toast
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">投稿</h2>
      
      <div className="border rounded-lg p-4">
        <Textarea
          placeholder="今日の出来事や状況を投稿しましょう"
          rows={4}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="resize-none mb-4 border-none focus-visible:ring-0 p-0"
        />
        
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            写真・動画アップロード
          </Button>
          
          <Button 
            onClick={handlePost}
            disabled={!postContent.trim()}
            className="bg-black text-white hover:bg-black/90"
          >
            投稿
          </Button>
        </div>
      </div>
    </div>
  );
};
