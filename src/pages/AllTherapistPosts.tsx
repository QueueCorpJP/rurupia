import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Extended Post interface that includes therapist information
interface Post {
  id: string;
  therapist_id: string;
  title?: string;
  content: string;
  image_url?: string;
  visibility: string;
  created_at: string;
  likes: number;
  // Therapist information
  therapist_name: string;
  therapist_image_url?: string;
  therapist_specialties?: string[];
}

const AllTherapistPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [followedTherapists, setFollowedTherapists] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<string>("latest");
  
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
  
  // Check if user is authenticated and get followed therapists
  const checkAuthAndFollows = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        
        // Get list of therapists the user is following
        const { data, error } = await supabase
          .from('followed_therapists')
          .select('therapist_id')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error fetching followed therapists:', error);
          return;
        }
        
        if (data) {
          const therapistIds = data.map(item => item.therapist_id);
          setFollowedTherapists(new Set(therapistIds));
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };
  
  // Toggle follow status for a therapist
  const handleToggleFollow = async (therapistId: string) => {
    if (!currentUser) {
      toast.error('フォローするにはログインが必要です');
      navigate('/login');
      return;
    }
    
    try {
      const isFollowing = followedTherapists.has(therapistId);
      
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followed_therapists')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('therapist_id', therapistId);
          
        if (error) throw error;
        
        // Update local state
        const newFollowed = new Set(followedTherapists);
        newFollowed.delete(therapistId);
        setFollowedTherapists(newFollowed);
        toast.success('フォローを解除しました');
      } else {
        // Follow
        const { error } = await supabase
          .from('followed_therapists')
          .insert({
            user_id: currentUser.id,
            therapist_id: therapistId,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        // Update local state
        const newFollowed = new Set(followedTherapists);
        newFollowed.add(therapistId);
        setFollowedTherapists(newFollowed);
        toast.success('フォローしました');
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('エラーが発生しました。もう一度お試しください');
    }
  };
  
  // Fetch all public posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      // First, get all public posts from therapist_posts table
      let query = supabase
        .from('therapist_posts')
        .select('*')
        .eq('visibility', 'public');
      
      // Sort based on user selection
      if (sortOrder === "latest") {
        query = query.order('created_at', { ascending: false });
      } else if (sortOrder === "popular") {
        query = query.order('likes', { ascending: false });
      }
      
      const { data: postsData, error: postsError } = await query;
      
      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }
      
      if (postsData && postsData.length > 0) {
        // Get the unique therapist IDs from the posts
        const therapistIds = [...new Set(postsData.map(post => post.therapist_id))];
        
        // Fetch therapist data for those IDs
        const { data: therapistsData, error: therapistsError } = await supabase
          .from('therapists')
          .select('id, name, image_url, specialties')
          .in('id', therapistIds);
        
        if (therapistsError) {
          console.error('Error fetching therapist data:', therapistsError);
        }
        
        // Create a map of therapist ID to therapist data for easy lookup
        const therapistMap = therapistsData?.reduce((map, therapist) => {
          map[therapist.id] = therapist;
          return map;
        }, {} as Record<string, any>) || {};
        
        // Transform the posts data with therapist information
        const transformedPosts = postsData.map(post => {
          const therapist = therapistMap[post.therapist_id] || {};
          return {
            id: post.id,
            therapist_id: post.therapist_id,
            title: post.title,
            content: post.content,
            image_url: post.image_url,
            visibility: post.visibility,
            created_at: post.created_at,
            likes: post.likes || 0,
            // Add therapist information
            therapist_name: therapist.name || '不明なセラピスト',
            therapist_image_url: therapist.image_url,
            therapist_specialties: therapist.specialties || []
          };
        });
        
        setPosts(transformedPosts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error in fetchPosts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchPosts();
    checkAuthAndFollows();
  }, []);
  
  // Re-fetch when sort order changes
  useEffect(() => {
    fetchPosts();
  }, [sortOrder]);
  
  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="bg-white border rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-2">セラピスト投稿一覧</h1>
            <p className="text-muted-foreground mb-6">全セラピストの最新投稿をチェックしましょう</p>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">並び替え:</span>
                <Select
                  value={sortOrder}
                  onValueChange={setSortOrder}
                >
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue placeholder="並び替え" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">最新順</SelectItem>
                    <SelectItem value="popular">人気順</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Posts list */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : posts.length > 0 ? (
              posts.map(post => {
                const shouldTruncate = post.content.length > charLimit && !expandedPosts.has(post.id);
                const isFollowing = followedTherapists.has(post.therapist_id);
                
                return (
                  <div 
                    key={post.id} 
                    className="bg-white border rounded-lg overflow-hidden"
                  >
                    {/* Post header */}
                    <div className="p-4 flex items-center gap-3 border-b">
                      <Link to={`/therapist/${post.therapist_id}`}>
                        <Avatar className="cursor-pointer">
                          {post.therapist_image_url ? (
                            <AvatarImage src={post.therapist_image_url} alt={post.therapist_name} />
                          ) : (
                            <AvatarFallback>{post.therapist_name?.charAt(0) || 'T'}</AvatarFallback>
                          )}
                        </Avatar>
                      </Link>
                      <div className="flex-grow">
                        <Link to={`/therapist/${post.therapist_id}`} className="hover:underline">
                          <p className="font-medium">{post.therapist_name}</p>
                        </Link>
                        <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
                      </div>
                      <Button
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleFollow(post.therapist_id)}
                      >
                        {isFollowing ? 'フォロー中' : 'フォローする'}
                      </Button>
                    </div>
                    
                    {/* Post content */}
                    <div>
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
                        <button className="text-muted-foreground hover:text-primary p-2 rounded-full transition-colors">
                          <Heart className="h-5 w-5" />
                        </button>
                        <span className="text-sm text-muted-foreground">{post.likes || 0}</span>
                        <Link 
                          to={`/therapist/${post.therapist_id}`}
                          className="ml-auto text-sm text-primary hover:underline"
                        >
                          このセラピストの投稿をもっと見る
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white border rounded-lg p-6 text-center">
                <p className="text-muted-foreground">まだ投稿はありません</p>
                <p className="text-sm mt-2">セラピストが投稿すると、ここに表示されます。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AllTherapistPosts; 