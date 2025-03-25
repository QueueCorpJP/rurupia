import { useState, useEffect } from 'react';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Calendar, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TherapistPostForm } from '@/components/therapist/TherapistPostForm';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ja } from 'date-fns/locale';

interface Post {
  id: string;
  therapist_id: string;
  title: string;
  content: string;
  image_url?: string;
  visibility: 'public' | 'followers';
  scheduled_date?: string;
  created_at: string;
  likes: number;
}

const TherapistPosts = () => {
  const [therapistId, setTherapistId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  const fetchPosts = async (userId?: string) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Get current datetime for comparing with scheduled_date
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('therapist_posts')
        .select('*')
        .eq('therapist_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching posts:", error);
        return;
      }
      
      // Filter out posts scheduled for the future and ensure visibility property exists
      const filteredPosts = data.filter((post: any) => 
        !post.scheduled_date || post.scheduled_date <= now
      ).map((post: any) => ({
        ...post,
        // Set default visibility to 'public' if it doesn't exist
        visibility: post.visibility || 'public'
      }));
      
      setPosts(filteredPosts || []);
    } catch (error) {
      console.error("Error in fetchPosts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getTherapistData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setTherapistId(user.id);
          fetchPosts(user.id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    getTherapistData();
  }, []);
  
  const handleDeletePost = async (postId: string) => {
    if (!confirm('この投稿を削除してもよろしいですか？')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('therapist_posts')
        .delete()
        .eq('id', postId);
        
      if (error) {
        toast.error("削除できませんでした", { description: error.message });
        return;
      }
      
      toast.success("投稿を削除しました");
      // Refresh posts
      if (therapistId) {
        fetchPosts(therapistId);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("エラーが発生しました");
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <TherapistLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">投稿管理</h1>
          <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                新しい投稿
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新しい投稿を作成</DialogTitle>
              </DialogHeader>
              <TherapistPostForm 
                onPostCreated={() => {
                  setIsCreatingPost(false);
                  if (therapistId) {
                    fetchPosts(therapistId);
                  }
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3">読み込み中...</span>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border rounded-lg overflow-hidden bg-white">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{post.title}</h3>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <span>{formatDate(post.created_at)}</span>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                          {post.visibility === 'public' ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              公開
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              フォロワーのみ
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">メニューを開く</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => toast.info("編集機能は近日公開予定です")}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>編集</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer text-destructive focus:text-destructive" 
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>削除</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <p className="text-sm mt-3">{post.content}</p>
                  
                  {post.image_url && (
                    <div className="mt-3">
                      <img 
                        src={post.image_url} 
                        alt={post.title} 
                        className="max-h-56 rounded-md object-cover" 
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center mt-4 pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      {post.likes || 0} いいね
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-lg">投稿がありません</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              新しい投稿を作成して、あなたの専門知識を共有しましょう
            </p>
            <Button onClick={() => setIsCreatingPost(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              最初の投稿を作成
            </Button>
          </div>
        )}
      </div>
    </TherapistLayout>
  );
};

export default TherapistPosts;
