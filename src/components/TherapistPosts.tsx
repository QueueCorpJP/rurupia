
import { useState } from 'react';

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

const TherapistPosts = ({ posts, therapistName, isFollowing = true }: TherapistPostsProps) => {
  const [expandedPosts, setExpandedPosts] = useState<number[]>([]);
  
  const toggleExpand = (postId: number) => {
    if (expandedPosts.includes(postId)) {
      setExpandedPosts(expandedPosts.filter(id => id !== postId));
    } else {
      setExpandedPosts([...expandedPosts, postId]);
    }
  };
  
  const CHARACTER_LIMIT = 140;
  
  return (
    <div className="mt-8">
      <h2 className="font-semibold text-lg mb-3">最近の投稿</h2>
      <div className="space-y-4">
        {posts.map(post => {
          const isExpanded = expandedPosts.includes(post.id);
          const isLongPost = post.content.length > CHARACTER_LIMIT;
          const isBlurred = post.isPrivate && !isFollowing;
          
          return (
            <div key={post.id} className="border rounded-lg overflow-hidden shadow-sm">
              {post.image && (
                <div className={`relative ${isBlurred ? 'blur-sm' : ''}`}>
                  <img 
                    src={post.image} 
                    alt="投稿画像" 
                    className="w-full h-48 object-cover"
                  />
                  {isBlurred && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="bg-primary text-white px-3 py-1.5 rounded-full text-sm font-medium">
                        フォローして投稿を見る
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-base">{therapistName}</div>
                  <div className="text-xs text-muted-foreground">{post.date}</div>
                </div>
                
                <div className={`mt-2 ${isBlurred ? 'blur-sm' : ''}`}>
                  {isLongPost && !isExpanded ? (
                    <>
                      <p className="text-sm">{post.content.substring(0, CHARACTER_LIMIT)}...</p>
                      <button 
                        onClick={() => toggleExpand(post.id)} 
                        className="text-xs text-primary mt-1 hover:underline"
                      >
                        続きを読む
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">{post.content}</p>
                      {isLongPost && isExpanded && (
                        <button 
                          onClick={() => toggleExpand(post.id)} 
                          className="text-xs text-primary mt-1 hover:underline"
                        >
                          閉じる
                        </button>
                      )}
                    </>
                  )}
                </div>
                
                {isBlurred && (
                  <div className="mt-3 flex justify-center">
                    <button className="bg-primary text-white px-3 py-1.5 rounded-full text-sm font-medium">
                      フォローして投稿を見る
                    </button>
                  </div>
                )}
                
                <div className="flex mt-3 pt-3 border-t text-sm text-muted-foreground">
                  <button className="flex items-center mr-4 hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    いいね
                  </button>
                  <button className="flex items-center hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                    コメント
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TherapistPosts;
