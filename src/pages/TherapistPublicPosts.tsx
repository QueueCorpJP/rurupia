import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'sonner';

// Define interfaces
interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  visibility: string;
  title?: string;
  likes: number;
  comments?: number;
}

interface Therapist {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
}

const TherapistPublicPosts = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Function to toggle post expansion
  const togglePostExpansion = (postId: string) => {
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
  
  // Character limit for truncated content
  const charLimit = 150;
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja });
    } catch (error) {
      return dateString;
    }
  };
  
  // Check if user is authenticated and following the therapist
  const checkFollowStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        
        // Check if user is following the therapist
        const { data, error } = await supabase
          .from('followed_therapists')
          .select('id')
          .eq('user_id', user.id)
          .eq('therapist_id', id)
          .maybeSingle();
          
        if (error) {
          console.error('Error checking follow status:', error);
          return;
        }
        
        setIsFollowing(!!data);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };
  
  // Toggle follow status
  const handleToggleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      if (isFollowing) {
        // Unfollow: Find and delete the specific record using validation-first pattern
        // First validate the record exists
        const { data: existingRecord, error: findError } = await supabase
          .from('followed_therapists')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('therapist_id', id)
          .single();
          
        if (findError) {
          console.error('Error finding follow record:', findError);
          throw findError;
        }
        
        if (existingRecord) {
          // Delete by ID to avoid chained .eq() calls
          const { error: deleteError } = await supabase
            .from('followed_therapists')
            .delete()
            .eq('id', existingRecord.id);
            
          if (deleteError) throw deleteError;
        }
        
        setIsFollowing(false);
      } else {
        // Follow
        const { error } = await supabase
          .from('followed_therapists')
          .insert({
            user_id: currentUser.id,
            therapist_id: id,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };
  
  // Fetch posts and therapist data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch therapist data
        const { data: therapistData, error: therapistError } = await supabase
          .from('therapists')
          .select('id, name, image_url, description')
          .eq('id', id)
          .single();
          
        if (therapistError) {
          console.error('Error fetching therapist:', therapistError);
          return;
        }
        
        setTherapist(therapistData);
        
        // Check if user is following
        await checkFollowStatus();
        
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('therapist_posts')
          .select('*')
          .eq('therapist_id', id)
          .eq('visibility', 'public') // Only fetch public posts for non-followers
          .order('created_at', { ascending: false });
          
        if (postsError) {
          console.error('Error fetching posts:', postsError);
          return;
        }
        
        setPosts(postsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Update posts when follow status changes
  useEffect(() => {
    const fetchPostsBasedOnFollowStatus = async () => {
      if (!id) return;
      
      try {
        let query = supabase
          .from('therapist_posts')
          .select('*')
          .eq('therapist_id', id)
          .order('created_at', { ascending: false });
        
        // If not following, only show public posts
        if (!isFollowing) {
          query = query.eq('visibility', 'public');
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching posts:', error);
          return;
        }
        
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    
    if (!loading) {
      fetchPostsBasedOnFollowStatus();
    }
  }, [id, isFollowing, loading]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!therapist) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">セラピストが見つかりません</h1>
            <p className="text-muted-foreground mb-6">
              お探しのセラピストは存在しないか、削除されました。
            </p>
            <Button onClick={() => navigate('/therapists')}>
              セラピスト一覧に戻る
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center text-muted-foreground hover:text-foreground p-0"
            onClick={() => navigate(`/therapist/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            セラピストのプロフィールに戻る
          </Button>
        </div>
        
        <div className="flex flex-col gap-6">
          {/* Therapist header */}
          <div className="bg-white border rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex-shrink-0">
              <Avatar className="h-20 w-20">
                {therapist.image_url ? (
                  <AvatarImage src={therapist.image_url} alt={therapist.name} />
                ) : (
                  <AvatarFallback>{therapist.name?.charAt(0) || 'T'}</AvatarFallback>
                )}
              </Avatar>
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">{therapist.name}の投稿</h1>
              <p className="text-muted-foreground mb-4">{therapist.description}</p>
              
              <Button 
                variant={isFollowing ? "outline" : "default"}
                onClick={handleToggleFollow}
                className="min-w-[120px]"
              >
                {isFollowing ? 'フォロー中' : 'フォローする'}
              </Button>
            </div>
          </div>
          
          {/* Posts list */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">投稿一覧</h2>
            
            {posts.length > 0 ? (
              posts.map(post => {
                const shouldTruncate = post.content.length > charLimit && !expandedPosts.has(post.id);
                const isPrivate = post.visibility === 'followers';
                const isBlurred = isPrivate && !isFollowing;
                
                return (
                  <div 
                    key={post.id} 
                    className={`bg-white border rounded-lg overflow-hidden ${isBlurred ? 'relative' : ''}`}
                  >
                    {/* Post header */}
                    <div className="p-4 flex items-center gap-3 border-b">
                      <Avatar>
                        {therapist.image_url ? (
                          <AvatarImage src={therapist.image_url} alt={therapist.name} />
                        ) : (
                          <AvatarFallback>{therapist.name?.charAt(0) || 'T'}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{therapist.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
                      </div>
                    </div>
                    
                    {/* Post content */}
                    <div className={`${isBlurred ? 'blur-sm' : ''}`}>
                      {/* Post image if available */}
                      {post.image_url && (
                        <div className="aspect-video w-full bg-muted overflow-hidden">
                          <img 
                            src={post.image_url} 
                            alt={post.title || "投稿画像"} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Post text content */}
                      <div className="p-4">
                        {post.title && (
                          <h3 className="font-medium mb-2">{post.title}</h3>
                        )}
                        <p className="text-sm">
                          {shouldTruncate ? `${post.content.substring(0, charLimit)}...` : post.content}
                        </p>
                        
                        {/* Read more button if content is truncated */}
                        {post.content.length > charLimit && (
                          <button 
                            onClick={() => togglePostExpansion(post.id)}
                            className="text-xs text-primary mt-2 font-medium"
                          >
                            {expandedPosts.has(post.id) ? '閉じる' : 'もっと見る'}
                          </button>
                        )}
                      </div>
                      
                      {/* Post actions */}
                      <div className="p-2 flex items-center gap-2 border-t">
                        <button 
                          className="text-muted-foreground hover:text-primary p-2 rounded-full transition-colors"
                          onClick={() => {
                            // Like functionality - could be expanded later
                            console.log('いいね clicked for post:', post.id);
                          }}
                        >
                          <Heart className="h-5 w-5" />
                        </button>
                        <span className="text-sm text-muted-foreground">{post.likes || 0}</span>
                        <button 
                          className="text-muted-foreground hover:text-primary p-2 rounded-full transition-colors ml-2"
                          onClick={() => {
                            // Comment functionality - could be expanded later
                            console.log('コメント clicked for post:', post.id);
                          }}
                        >
                          <MessageSquare className="h-5 w-5" />
                        </button>
                        <span className="text-sm text-muted-foreground">{post.comments || 0}</span>
                        <button 
                          className="text-muted-foreground hover:text-primary p-2 rounded-full transition-colors ml-2"
                          onClick={() => {
                            // Share functionality
                            const postUrl = `${window.location.origin}/therapist/${therapist.id}/posts`;
                            const text = `${therapist.name}さんの投稿をチェック！`;
                            
                            if (navigator.share) {
                              navigator.share({
                                title: text,
                                text: post.content.substring(0, 100) + '...',
                                url: postUrl,
                              });
                                                         } else {
                               navigator.clipboard.writeText(postUrl);
                               toast.success('リンクをクリップボードにコピーしました');
                             }
                          }}
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Overlay for private posts */}
                    {isBlurred && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 z-10">
                        <p className="text-center mb-2">この投稿はフォロワー限定です</p>
                        <Button onClick={handleToggleFollow}>フォローして投稿を見る</Button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white border rounded-lg p-6 text-center">
                <p className="text-muted-foreground">まだ投稿はありません</p>
                <p className="text-sm mt-2">このセラピストはまだ投稿をしていません。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TherapistPublicPosts; 