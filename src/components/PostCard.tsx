import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Types for post interactions
interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
}

// Post with interaction data
export interface PostWithInteractions {
  id: string;
  therapist_id: string;
  title?: string;
  content: string;
  image_url?: string;
  visibility?: string;
  created_at: string;
  likes: number;
  liked?: boolean;
  comments?: PostComment[];
  comment_count?: number;
  // Therapist information
  therapist_name: string;
  therapist_image_url?: string;
  therapist_specialties?: string[];
}

interface PostCardProps {
  post: PostWithInteractions;
  onPostUpdated?: () => void;
}

const PostCard = ({ post: initialPost, onPostUpdated }: PostCardProps) => {
  const [post, setPost] = useState<PostWithInteractions>(initialPost);
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [comments, setComments] = useState<PostComment[]>(post.comments || []);
  const [isLiked, setIsLiked] = useState(post.liked || false);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  // Character limit for truncated content
  const charLimit = 150;
  
  // Check if user is authenticated - use useCallback to prevent unnecessary rerenders
  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    return user;
  }, []);

  // Effect to check authentication and load comment count on mount
  useEffect(() => {
    const initAuth = async () => {
      const user = await checkAuth();
      
      if (user) {
        // Check if user has liked this post
        checkUserLiked(user.id, post.id);
      }
      
      // Load comment count immediately
      loadCommentCount();
    };
    
    initAuth();
  }, [post.id, checkAuth]);
  
  // Load comment count without loading full comments
  const loadCommentCount = async () => {
    try {
      const { count, error } = await (supabase as any)
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
        
      if (!error && count !== null) {
        setPost(prev => ({
          ...prev,
          comment_count: count
        }));
      }
    } catch (error) {
      console.error('Error loading comment count:', error);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja });
    } catch (error) {
      return dateString;
    }
  };
  
  // Check if user has liked the post without triggering rerenders
  const checkUserLiked = async (userId: string, postId: string) => {
    try {
      // Use type assertion to avoid TypeScript errors with custom tables
      const { data, error } = await (supabase as any)
        .from('post_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();
        
      if (!error) {
        setIsLiked(!!data);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };
  
  // Toggle post expansion
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Handle liking/unliking a post with optimistic updates
  const handleLike = async () => {
    if (!currentUser) {
      toast.error('いいねするにはログインしてください');
      return;
    }
    
    // Prevent multiple clicks while processing
    if (isLikeProcessing) return;
    
    try {
      setIsLikeProcessing(true);
      
      // Optimistically update UI
      const newIsLiked = !isLiked;
      const likeDelta = newIsLiked ? 1 : -1;
      const newLikesCount = Math.max(0, (post.likes || 0) + likeDelta);
      
      // Update local state immediately
      setIsLiked(newIsLiked);
      setPost(prev => ({
        ...prev,
        likes: newLikesCount
      }));
      
      // Now update database in the background
      if (newIsLiked) {
        // Add like
        await (supabase as any)
          .from('post_likes')
          .insert({
            user_id: currentUser.id,
            post_id: post.id
          });
      } else {
        // Remove like
        await (supabase as any)
          .from('post_likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('post_id', post.id);
      }
      
      // Update the likes count in the posts table - in background
      await (supabase as any)
        .from('therapist_posts')
        .update({ likes: newLikesCount })
        .eq('id', post.id);
        
      // We do NOT call onPostUpdated() here to avoid full page refresh
      
    } catch (error) {
      console.error('Error updating like status:', error);
      toast.error('エラーが発生しました。もう一度お試しください');
      
      // Revert optimistic update if error occurs
      setIsLiked(!isLiked);
      setPost(prev => ({
        ...prev,
        likes: isLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1)
      }));
    } finally {
      setIsLikeProcessing(false);
    }
  };
  
  // Open comments drawer/dialog
  const openComments = async () => {
    // Check if user is logged in
    if (!currentUser) {
      toast.error('コメントを見るには会員登録が必要です。');
      return;
    }
    
    // Only load comments when first opening the dialog
    if (!showComments && comments.length === 0) {
      await loadComments();
    }
    setShowComments(true);
    
    // Ensure comments scroll area starts at top on mobile
    if (isMobile) {
      setTimeout(() => {
        const scrollArea = document.querySelector('[data-comments-scroll-area]');
        if (scrollArea) {
          scrollArea.scrollTop = 0;
        }
      }, 100);
    }
  };
  
  // Load comments for the post
  const loadComments = async () => {
    if (isLoadingComments) return;
    
    setIsLoadingComments(true);
    try {
      // First ensure user is authenticated
      if (!currentUser) {
        await checkAuth();
      }
      
      // Use a simplified direct query that avoids relation errors
      const { data, error } = await (supabase as any)
        .from('post_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data && Array.isArray(data)) {
        // Get user names in a separate step
        const userIds = data.map(comment => comment.user_id);
        const { data: profilesData } = await (supabase as any)
          .from('profiles')
          .select('id, full_name, username')
          .in('id', userIds);
          
        // Create a map of user_id to name
        const userNameMap: Record<string, string> = {};
        if (profilesData) {
          profilesData.forEach((profile: any) => {
            // Prefer username over full_name if available, fall back to User if neither exists
            userNameMap[profile.id] = profile.username || profile.full_name || 'User';
          });
        }
        
        // Transform comments with user names
        const commentsWithNames = data.map(comment => ({
          ...comment,
          user_name: userNameMap[comment.user_id] || 'User'
        }));
        
        setComments(commentsWithNames);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('コメントの読み込み中にエラーが発生しました');
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  // Handle comment text change without causing dialog remounting
  const handleCommentTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  };
  
  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!currentUser) {
      toast.error('コメントするにはログインしてください');
      return;
    }
    
    if (!commentText.trim()) {
      toast.error('コメントを入力してください');
      return;
    }
    
    let newCommentData: any = null;
    let userName = 'User';
    
    try {
      // Get the user's name first
      try {
        const { data: profileData } = await (supabase as any)
          .from('profiles')
          .select('full_name, username')
          .eq('id', currentUser.id)
          .maybeSingle();
          
        if (profileData?.username) {
          userName = profileData.username;
        } else if (profileData?.full_name) {
          userName = profileData.full_name;
        } else {
          userName = currentUser.email || 'User';
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        userName = currentUser.email || 'User';
      }

      // Skip the standard approach and directly use a simplified insert without any .select()
      // This avoids triggering the ambiguous column error
      const { error: insertError } = await (supabase as any)
        .from('post_comments')
        .insert({
          user_id: currentUser.id,
          post_id: post.id,
          content: commentText.trim()
        });
        
      if (insertError) {
        throw insertError;
      }
      
      // Create a temporary comment object
      const newComment = {
        id: `temp-${Date.now()}`,
        post_id: post.id,
        user_id: currentUser.id,
        content: commentText.trim(),
        created_at: new Date().toISOString(),
        user_name: userName
      };
      
      // Update local state with new comment
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      
      // Update the comment count in the UI
      setPost(prev => ({
        ...prev,
        comment_count: (prev.comment_count || 0) + 1
      }));
      
      // Also refresh the actual comment count from database to ensure accuracy
      setTimeout(() => {
        loadCommentCount();
      }, 1000);
      
      // Call onPostUpdated to refresh the post data if needed
      if (onPostUpdated) onPostUpdated();
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('コメントの投稿中にエラーが発生しました');
    }
  };
  
  // Open share dialog
  const handleShare = () => {
    setShowShareDialog(true);
  };
  
  // Execute share action
  const executeShare = (platform: 'line' | 'twitter' | 'facebook' | 'copy') => {
    const postUrl = `${window.location.origin}/therapist/${post.therapist_id}/post/${post.id}`;
    const text = `${post.therapist_name}のセラピスト投稿`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'line':
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl)
          .then(() => toast.success('リンクをコピーしました'))
          .catch(() => toast.error('コピーに失敗しました'));
        setShowShareDialog(false);
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=600');
    setShowShareDialog(false);
  };
  
  // Memoized components to prevent unnecessary rerenders
  // Render comments UI based on device
  const renderCommentsUI = () => {
    const content = (
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto min-h-0" style={{ overscrollBehavior: 'contain' }}>
          <div className="p-4 space-y-4">
            {isLoadingComments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">ユーザー</div>
                    <div className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</div>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                まだコメントはありません
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Textarea
              ref={commentInputRef}
              placeholder="コメントを投稿..."
              value={commentText}
              onChange={handleCommentTextChange}
              className="min-h-10 resize-none flex-1"
              rows={2}
              style={{
                fontSize: '16px', // Prevents zoom on iOS
                WebkitAppearance: 'none',
                WebkitBorderRadius: '0',
                WebkitTapHighlightColor: 'transparent'
              }}
            />
            <Button 
              size="icon" 
              onClick={handleCommentSubmit}
              disabled={!commentText.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
    
    return isMobile ? (
      <Drawer 
        open={showComments} 
        onOpenChange={setShowComments}
        shouldScaleBackground={true}
      >
        <DrawerContent className="h-[85vh] flex flex-col">
          {/* Header with close button */}
          <DrawerHeader className="flex-shrink-0 border-b">
            <div className="flex justify-between items-center">
              <div>
                <DrawerTitle>コメント</DrawerTitle>
                <DrawerDescription>この投稿へのコメント</DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">
                  ✕
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          {/* Comments container - scrollable middle section */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {isLoadingComments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm">ユーザー</div>
                      <div className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</div>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                まだコメントはありません
              </div>
            )}
          </div>

          {/* Fixed input area at bottom */}
          <div className="flex-shrink-0 bg-white border-t">
            <div className="p-4">
              <div className="flex gap-2">
                <Textarea
                  ref={commentInputRef}
                  placeholder="コメントを投稿..."
                  value={commentText}
                  onChange={handleCommentTextChange}
                  className="resize-none flex-1 text-base"
                  rows={2}
                  style={{
                    fontSize: '16px', // Prevents zoom on iOS
                  }}
                  onFocus={() => {
                    // Small delay to ensure keyboard is visible, then scroll to bottom
                    setTimeout(() => {
                      const drawer = document.querySelector('[data-vaul-drawer]');
                      if (drawer) {
                        drawer.scrollTo({ top: drawer.scrollHeight, behavior: 'smooth' });
                      }
                    }, 300);
                  }}
                />
                <Button 
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim()}
                  className="h-auto px-4 py-2"
                >
                  送信
                </Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    ) : (
      <Dialog 
        open={showComments} 
        onOpenChange={(open) => {
          // Only close if explicitly set to false
          if (open === false) {
            setShowComments(false);
          } else {
            setShowComments(open);
          }
        }}
        modal={true}
      >
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>コメント</DialogTitle>
            <DialogDescription>この投稿へのコメントを表示・投稿できます</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {content}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComments(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render share dialog
  const renderShareUI = () => (
    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>投稿をシェア</DialogTitle>
          <DialogDescription>投稿を各種SNSでシェアできます</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button 
            onClick={() => executeShare('line')} 
            className="bg-[#06C755] hover:bg-[#06C755]/90 text-white"
          >
            LINEでシェア
          </Button>
          <Button 
            onClick={() => executeShare('twitter')} 
            className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white"
          >
            Twitterでシェア
          </Button>
          <Button 
            onClick={() => executeShare('facebook')} 
            className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
          >
            Facebookでシェア
          </Button>
          <Button 
            onClick={() => executeShare('copy')} 
            variant="outline"
          >
            リンクをコピー
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
  
  const shouldTruncate = post.content.length > charLimit && !isExpanded;
  
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
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
      </div>
      
      {/* Post content */}
      <div className="p-4">
        {post.title && <h3 className="font-medium mb-2">{post.title}</h3>}
        <div className="mb-4">
          {shouldTruncate ? (
            <>
              <p>{post.content.substring(0, charLimit)}...</p>
              <button 
                onClick={toggleExpansion}
                className="text-sm text-primary hover:underline mt-1"
              >
                続きを読む
              </button>
            </>
          ) : (
            <>
              <p>{post.content}</p>
              {post.content.length > charLimit && (
                <button 
                  onClick={toggleExpansion}
                  className="text-sm text-primary hover:underline mt-1"
                >
                  閉じる
                </button>
              )}
            </>
          )}
        </div>
        {post.image_url && (
          <div className="mb-4">
            <img 
              src={post.image_url} 
              alt="Post" 
              className="w-full max-w-md mx-auto h-auto rounded-lg object-cover"
              style={{ aspectRatio: '16/9', maxHeight: '300px' }}
              onError={(e) => {
                // Handle image load errors
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      {/* Post actions */}
      <div className="px-4 pb-4 flex gap-4">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : ''}`}
          onClick={handleLike}
          disabled={isLikeProcessing}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{post.likes || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={openComments}
        >
          <MessageSquare className="h-4 w-4" />
          <span>{post.comment_count || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          <span>シェア</span>
        </Button>
      </div>
      
      {/* Comments UI */}
      {showComments && renderCommentsUI()}
      
      {/* Share Dialog */}
      {showShareDialog && renderShareUI()}
    </div>
  );
};

export default PostCard; 