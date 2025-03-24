
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { BlogPost } from '@/types/blog';

const StoreBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setStoreId(user.id);
        fetchPosts(user.id);
      }
    };
    
    getCurrentUser();
  }, []);

  const fetchPosts = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Get all blog posts created by this store
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id, 
          title, 
          content, 
          excerpt, 
          slug, 
          cover_image, 
          category, 
          category_id,
          tags, 
          published, 
          published_at, 
          scheduled_for, 
          author_name, 
          author_avatar, 
          views
        `)
        .eq('author_id', userId)
        .order('published_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Transform data for display
        const formattedPosts = data.map((post): BlogPost => {
          const status = post.published 
            ? 'public' 
            : post.scheduled_for ? 'pending' : 'draft';
          
          return {
            ...post,
            status,
            date: post.published_at 
              ? format(new Date(post.published_at), 'yyyy/MM/dd HH:mm')
              : '未公開',
          };
        });
        
        setPosts(formattedPosts);
        setFilteredPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('ブログ記事の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = () => {
    setSelectedPost(null);
    setIsEditorOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsEditorOpen(true);
  };

  const handleDeletePost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', selectedPost.id);
        
      if (error) throw error;
      
      // Remove post from state
      setPosts(posts.filter(post => post.id !== selectedPost.id));
      setFilteredPosts(filteredPosts.filter(post => post.id !== selectedPost.id));
      
      toast.success('ブログ記事が削除されました');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('ブログ記事の削除に失敗しました');
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    if (storeId) {
      fetchPosts(storeId);
    }
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">ブログ管理</h1>
          <p className="text-muted-foreground mt-1">ブログ記事の作成・編集</p>
        </div>
        <Button onClick={handleCreatePost}>
          <Plus className="h-4 w-4 mr-2" />
          新規作成
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ブログ記事一覧</CardTitle>
          <CardDescription>
            ブログ記事を表示、編集、削除できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">ブログ記事がありません</p>
              <Button variant="outline" className="mt-4" onClick={handleCreatePost}>
                <Plus className="h-4 w-4 mr-2" />
                最初の記事を作成する
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>タイトル</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>公開日</TableHead>
                    <TableHead>作成者</TableHead>
                    <TableHead>閲覧数</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{post.category}</TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={post.status || 'draft'} 
                          label={
                            post.status === 'public' ? '公開中' : 
                            post.status === 'pending' ? '公開予定' : '下書き'
                          }
                        />
                      </TableCell>
                      <TableCell>{post.date}</TableCell>
                      <TableCell>{post.author_name}</TableCell>
                      <TableCell>{post.views || 0}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">メニュー</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>アクション</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                              <Eye className="h-4 w-4 mr-2" />
                              <span>プレビュー</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPost(post)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              <span>編集</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeletePost(post)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>削除</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blog Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost ? '記事を編集' : '新規記事作成'}</DialogTitle>
            <DialogDescription>
              ブログ記事の内容を入力してください。
            </DialogDescription>
          </DialogHeader>
          <BlogEditor 
            initialData={selectedPost} 
            onSuccess={handleEditorClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>本当に削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は元に戻すことができません。記事「{selectedPost?.title}」を削除します。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              削除する
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreBlog;
