
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Image, Eye, Clock, Lock } from 'lucide-react';

interface Post {
  id: number;
  content: string;
  image?: string;
  date: string;
  likes?: number;
  comments?: number;
  isPrivate?: boolean;
  isScheduled?: boolean;
  scheduledDate?: string;
}

interface TherapistPostsProps {
  posts: Post[];
  therapistName: string;
  therapistId: number;
  isFollowing?: boolean;
}

const TherapistPosts = ({ posts, therapistName, therapistId, isFollowing = false }: TherapistPostsProps) => {
  // State to track expanded posts
  const [expandedPosts, setExpandedPosts] = useState<number[]>([]);

  const togglePostExpansion = (postId: number) => {
    setExpandedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );
  };

  const isPostExpanded = (postId: number) => expandedPosts.includes(postId);

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">最近の投稿</h2>
        <Link to={`/therapist-posts/${therapistId}`} className="text-sm text-primary hover:underline">
          すべての投稿を見る
        </Link>
      </div>
      
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-6 border rounded-lg bg-muted/30">
            <p className="text-muted-foreground">投稿はまだありません</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="border rounded-lg overflow-hidden bg-card">
              {/* Post Header */}
              <div className="p-4 pb-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                    {/* Avatar could be added here */}
                  </div>
                  <div>
                    <div className="font-medium">{therapistName}</div>
                    <div className="text-xs text-muted-foreground">{post.date}</div>
                  </div>
                </div>
                
                {post.isScheduled && (
                  <div className="text-xs flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.scheduledDate || '予約投稿'}
                  </div>
                )}
                
                {post.isPrivate && (
                  <div className="text-xs flex items-center text-muted-foreground">
                    <Lock className="h-3 w-3 mr-1" />
                    フォロワー限定
                  </div>
                )}
              </div>
              
              {/* Post Content */}
              <div className="px-4 pb-3">
                {post.isPrivate && !isFollowing ? (
                  <div className="py-4 text-center">
                    <Lock className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">このコンテンツはフォロワー限定です</p>
                    <button className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full">
                      フォローして投稿を見る
                    </button>
                  </div>
                ) : (
                  <>
                    {post.content.length <= 140 || isPostExpanded(post.id) ? (
                      <p className="text-sm mt-2 whitespace-pre-wrap">{post.content}</p>
                    ) : (
                      <>
                        <p className="text-sm mt-2 whitespace-pre-wrap">
                          {post.content.substring(0, 140)}...
                        </p>
                        <button 
                          onClick={() => togglePostExpansion(post.id)}
                          className="text-xs text-primary mt-1 hover:underline"
                        >
                          詳細を表示
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
              
              {/* Post Image (if exists) */}
              {post.image && !post.isPrivate && (
                <div className={post.isPrivate && !isFollowing ? "filter blur-sm" : ""}>
                  <img 
                    src={post.image} 
                    alt="Post" 
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}
              
              {/* Post Actions */}
              <div className="px-4 py-3 flex items-center space-x-4 text-muted-foreground border-t">
                <button className="flex items-center text-xs hover:text-primary transition-colors">
                  <Heart className="h-4 w-4 mr-1" />
                  <span>{post.likes || 0}</span>
                </button>
                <button className="flex items-center text-xs hover:text-primary transition-colors">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{post.comments || 0}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TherapistPosts;
