
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Search, Plus, Eye, Edit, Trash2, MoreHorizontal, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { BlogEditor } from '@/components/admin/BlogEditor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BlogPost {
  id: number;
  title: string;
  status: string;
  category: string;
  date: string;
  author: string;
  views: number;
  published: boolean;
  published_at: string;
  category_id: string;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
  count?: number;
}

const StoreBlog = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [popularPosts, setPopularPosts] = useState<{title: string, views: number}[]>([]);
  const [postStats, setPostStats] = useState({
    published: 0,
    scheduled: 0,
    draft: 0,
    total: 0
  });
  const [categoryStats, setCategoryStats] = useState<Category[]>([]);
  
  useEffect(() => {
    fetchBlogData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(blogPosts);
      return;
    }
    
    const filtered = blogPosts.filter(
      post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredPosts(filtered);
  }, [searchQuery, blogPosts]);

  const fetchBlogData = async () => {
    setIsLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('blog_categories')
        .select('*');
      
      if (categoriesError) throw categoriesError;
      
      if (categoriesData) {
        setCategories(categoriesData);
      }
      
      // Fetch blog posts
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          author_name,
          published_at,
          published,
          views,
          category_id,
          scheduled_for
        `)
        .order('published_at', { ascending: false });
      
      if (postsError) throw postsError;
      
      if (postsData) {
        // Transform posts data to match the component's expected format
        const formattedPosts = postsData.map(post => {
          const category = categoriesData?.find(cat => cat.id === post.category_id);
          
          let status = '下書き';
          if (post.published) {
            status = '公開';
          } else if (post.scheduled_for) {
            status = '公開予定';
          }
          
          return {
            id: post.id,
            title: post.title,
            status: status,
            category: category?.name || '未分類',
            category_name: category?.name || '未分類',
            category_id: post.category_id,
            date: post.published_at ? format(new Date(post.published_at), 'yyyy/MM/dd') : '-',
            author: post.author_name || '未設定',
            views: post.views || 0,
            published: post.published,
            published_at: post.published_at
          };
        });
        
        setBlogPosts(formattedPosts);
        setFilteredPosts(formattedPosts);
        
        // Calculate stats
        const published = formattedPosts.filter(p => p.status === '公開').length;
        const scheduled = formattedPosts.filter(p => p.status === '公開予定').length;
        const draft = formattedPosts.filter(p => p.status === '下書き').length;
        
        setPostStats({
          published,
          scheduled,
          draft,
          total: formattedPosts.length
        });
        
        // Popular posts
        const sortedByViews = [...formattedPosts].sort((a, b) => b.views - a.views);
        setPopularPosts(sortedByViews.slice(0, 5).map(p => ({
          title: p.title,
          views: p.views
        })));
        
        // Category stats
        const catCounts: {[key: string]: number} = {};
        formattedPosts.forEach(post => {
          const catName = post.category_name || '未分類';
          catCounts[catName] = (catCounts[catName] || 0) + 1;
        });
        
        const catStats = Object.entries(catCounts).map(([name, count]) => {
          const category = categoriesData?.find(c => c.name === name);
          return {
            id: category?.id || '',
            name,
            count
          };
        });
        
        setCategoryStats(catStats);
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
      toast({
        title: 'エラー',
        description: 'ブログデータの取得に失敗しました。',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPost = () => {
    setSelectedPostId(null);
    setIsEditorOpen(true);
  };

  const handleEditPost = (postId: string) => {
    setSelectedPostId(postId);
    setIsEditorOpen(true);
  };

  const handleDeletePost = async () => {
    if (!selectedPostId) return;
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', selectedPostId);
      
      if (error) throw error;
      
      toast({
        title: '削除完了',
        description: '投稿が削除されました。'
      });
      
      // Refresh the data
      fetchBlogData();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'エラー',
        description: '投稿の削除に失敗しました。',
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPostId(null);
    }
  };

  const confirmDelete = (postId: string) => {
    setSelectedPostId(postId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ブログ管理</h1>
          <p className="text-muted-foreground mt-2">店舗ブログの投稿・管理</p>
        </div>
        <Button onClick={handleNewPost}>
          <Plus className="mr-2 h-4 w-4" />
          新規投稿
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>ブログ記事一覧</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="タイトルやカテゴリで検索"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            投稿済みおよび下書き中の記事一覧です。
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タイトル</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>公開日</TableHead>
                  <TableHead>投稿者</TableHead>
                  <TableHead className="text-right">閲覧数</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      表示するデータがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{post.category}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          post.status === '公開' 
                            ? 'bg-green-100 text-green-800' 
                            : post.status === '公開予定' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status || '未定義'}
                        </span>
                      </TableCell>
                      <TableCell>{post.date}</TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell className="text-right">{post.views}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">メニューを開く</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>アクション</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => window.open(`/blog/${post.id}`, '_blank')}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>プレビュー</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPost(String(post.id))}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>編集する</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive" 
                              onClick={() => confirmDelete(String(post.id))}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>削除する</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* ブログ統計情報 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              人気記事ランキング
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : popularPosts.length > 0 ? (
              <ol className="space-y-3">
                {popularPosts.map((post, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full">{index + 1}</span>
                      <span className="text-sm">{post.title}</span>
                    </div>
                    <span className="text-sm font-medium">{post.views}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-center py-4 text-sm text-muted-foreground">
                データがありません
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              投稿数統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">公開済み</span>
                  <span className="font-medium">{postStats.published}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">公開予定</span>
                  <span className="font-medium">{postStats.scheduled}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">下書き</span>
                  <span className="font-medium">{postStats.draft}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">合計</span>
                  <span className="font-medium">{postStats.total}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              カテゴリ統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : categoryStats.length > 0 ? (
              <div className="space-y-2">
                {categoryStats.map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{category.name}</span>
                    <span className="font-medium">{category.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-sm text-muted-foreground">
                データがありません
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPostId ? "投稿を編集" : "新規投稿を作成"}
            </DialogTitle>
          </DialogHeader>
          <BlogEditor 
            onSave={() => {
              setIsEditorOpen(false);
              fetchBlogData();
            }} 
            postId={selectedPostId || undefined}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>投稿を削除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>本当にこの投稿を削除しますか？この操作は元に戻せません。</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              削除する
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreBlog;
