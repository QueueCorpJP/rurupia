import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2 } from 'lucide-react';

interface Post {
  id: number;
  content: string;
  image?: string;
  date: string;
  isPrivate?: boolean;
}

interface TherapistPostsProps {
  posts: Post[];
  therapistName: string;
  isFollowing?: boolean;
}

const TherapistPosts = ({ posts, therapistName, isFollowing = false }: TherapistPostsProps) => {
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  
  const togglePostExpansion = (postId: number) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };
  
  const charLimit = 150;
  
  return (
    <div className="mt-8">
      <h2 className="font-semibold text-lg mb-3">投稿</h2>
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map(post => {
            const shouldTruncate = post.content.length > charLimit && !expandedPosts.has(post.id);
            
            const isBlurred = post.isPrivate && !isFollowing;
            
            return (
              <div 
                key={post.id} 
                className={`border rounded-lg overflow-hidden ${isBlurred ? 'relative' : ''}`}
              >
                <div className="p-4 flex items-center gap-3 border-b">
                  <Avatar>
                    <AvatarFallback>{therapistName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{therapistName}</p>
                    <p className="text-xs text-muted-foreground">{post.date}</p>
                  </div>
                </div>
                
                <div className={`${isBlurred ? 'blur-sm' : ''}`}>
                  {post.image && (
                    <div className="aspect-video w-full bg-muted overflow-hidden">
                      <img 
                        src={post.image} 
                        alt="Post content" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <p className="text-sm">
                      {shouldTruncate ? `${post.content.substring(0, charLimit)}...` : post.content}
                    </p>
                    
                    {post.content.length > charLimit && (
                      <button 
                        onClick={() => togglePostExpansion(post.id)}
                        className="text-xs text-primary mt-2 font-medium"
                      >
                        {expandedPosts.has(post.id) ? '閉じる' : 'もっと見る'}
                      </button>
                    )}
                  </div>
                  
                  <div className="p-2 flex items-center gap-2 border-t">
                    <button className="text-muted-foreground hover:text-primary p-2 rounded-full transition-colors">
                      <Heart className="h-5 w-5" />
                    </button>
                    <button className="text-muted-foreground hover:text-primary p-2 rounded-full transition-colors">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    <button className="text-muted-foreground hover:text-primary p-2 rounded-full transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {isBlurred && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 z-10">
                    <p className="text-center mb-2">この投稿はフォロワー限定です</p>
                    <Button>フォローして投稿を見る</Button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="border rounded-lg p-6 text-center">
            <p className="text-muted-foreground">まだ投稿はありません</p>
            <p className="text-sm mt-2">このセラピストはまだ投稿をしていません。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistPosts;
