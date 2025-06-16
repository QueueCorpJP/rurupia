import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Filter } from 'lucide-react';
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
import PostCard, { PostWithInteractions } from '@/components/PostCard';

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
  const [posts, setPosts] = useState<PostWithInteractions[]>([]);
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
  const checkAuthAndFollows = useCallback(async () => {
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
  }, []);
  
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
        // Unfollow: Find and delete the specific record using validation-first pattern
        // First validate the record exists
        const { data: existingRecord, error: findError } = await supabase
          .from('followed_therapists')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('therapist_id', therapistId)
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
  const fetchPosts = useCallback(async () => {
    // Don't set loading to true on subsequent calls to prevent flicker
    if (!posts.length) {
      setLoading(true);
    }
    
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
  }, [sortOrder, posts.length]);
  
  // Optimized version of post update that just updates one post's like and comment count
  const handlePostUpdate = useCallback(async (postId: string) => {
    // Instead of refetching all posts, just update the specific post's like and comment count
    try {
      // Get the updated likes count
      const { data: postData, error: postError } = await (supabase as any)
        .from('therapist_posts')
        .select('likes')
        .eq('id', postId)
        .single();
        
      if (postError) {
        console.error('Error fetching updated post:', postError);
        return;
      }
      
      // Get the updated comment count
      const { count: commentCount, error: commentError } = await (supabase as any)
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      if (commentError) {
        console.error('Error fetching comment count:', commentError);
      }
      
      if (postData) {
        // Update this one post in state, preserving all others
        setPosts(currentPosts => 
          currentPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  likes: postData.likes || post.likes,
                  comment_count: commentCount !== null ? commentCount : post.comment_count
                } 
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  }, []);
  
  // Initial data fetch
  useEffect(() => {
    const initialize = async () => {
      await checkAuthAndFollows();
      await fetchPosts();
    };
    
    initialize();
  }, [checkAuthAndFollows, fetchPosts]);
  
  // Re-fetch when sort order changes
  useEffect(() => {
    fetchPosts();
  }, [sortOrder, fetchPosts]);
  
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
          
          {/* Posts List */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-sm space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onPostUpdated={() => handlePostUpdate(post.id)}
                  />
                ))
              ) : (
                <div className="bg-white border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">投稿がありません</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AllTherapistPosts; 