
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/DataTable";
import { BarChart2, Edit, Trash, PlusCircle, FileText, BarChart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart } from "@/components/admin/LineChart";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  author_name: string;
  published_at: string;
  published: boolean;
  views: number;
  category_id: string;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
}

const AdminBlog = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("year");
  const [topPosts, setTopPosts] = useState<{title: string, views: number}[]>([]);
  const [viewsData, setViewsData] = useState<{name: string, value: number}[]>([]);
  const [categoryStats, setCategoryStats] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    fetchBlogData();
  }, []);

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
          category_id
        `)
        .order('published_at', { ascending: false });
      
      if (postsError) throw postsError;
      
      if (postsData) {
        // Add category name to posts
        const postsWithCategories = postsData.map(post => {
          const category = categoriesData?.find(cat => cat.id === post.category_id);
          return {
            ...post,
            category_name: category?.name || '未分類'
          };
        });
        
        setBlogPosts(postsWithCategories);
        
        // Calculate stats for top posts
        const sortedPosts = [...postsWithCategories].sort((a, b) => b.views - a.views);
        setTopPosts(
          sortedPosts.slice(0, 5).map(post => ({
            title: post.title,
            views: post.views
          }))
        );
        
        // Calculate category statistics
        const catStats: {[key: string]: number} = {};
        postsWithCategories.forEach(post => {
          const catName = post.category_name || '未分類';
          catStats[catName] = (catStats[catName] || 0) + 1;
        });
        
        setCategoryStats(
          Object.entries(catStats).map(([name, count]) => ({ name, count }))
        );
        
        // Generate dummy views data for now (this would be replaced with real analytics data)
        const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
        setViewsData(
          months.map((name, index) => ({
            name,
            value: Math.floor(Math.random() * 1000) + 500
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
      toast({
        title: "エラー",
        description: "ブログデータの取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = () => {
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
        title: "削除完了",
        description: "投稿が削除されました。",
      });
      
      // Refresh the data
      fetchBlogData();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "エラー",
        description: "投稿の削除に失敗しました。",
        variant: "destructive",
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

  const filteredPosts = blogPosts.filter(
    post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Column definition for the blog posts table
  const columns = [
    {
      key: "title",
      label: "タイトル",
      accessorKey: "title"
    },
    {
      key: "author_name",
      label: "著者",
      accessorKey: "author_name"
    },
    {
      key: "category",
      label: "カテゴリ",
      accessorKey: "category_name"
    },
    {
      key: "published_at",
      label: "公開日",
      accessorKey: "published_at",
      render: ({ row }: any) => {
        const date = row?.published_at ? new Date(row.published_at) : null;
        return date ? format(date, "yyyy/MM/dd") : "-";
      }
    },
    {
      key: "status",
      label: "ステータス",
      accessorKey: "published",
      render: ({ row }: any) => {
        // Use the StatusBadge component
        return (
          <StatusBadge 
            status={row?.published ? "公開中" : "下書き"} 
          />
        );
      }
    },
    {
      key: "views",
      label: "閲覧数",
      accessorKey: "views"
    },
    {
      key: "actions",
      label: "操作",
      render: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleEditPost(row.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => confirmDelete(row.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ブログ管理</h1>
        <Button className="gap-1" onClick={handleCreatePost}>
          <PlusCircle className="h-4 w-4" /> 新規作成
        </Button>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">
            <FileText className="h-4 w-4 mr-2" /> 投稿一覧
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-2" /> 分析
          </TabsTrigger>
          <TabsTrigger value="settings">
            <BarChart2 className="h-4 w-4 mr-2" /> 設定
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>ブログ投稿一覧</CardTitle>
                <Input
                  placeholder="タイトル、著者、カテゴリで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <CardDescription>
                すべてのブログ投稿の管理と編集が可能です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={filteredPosts} 
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">ブログ閲覧分析</h2>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="期間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">過去1週間</SelectItem>
                <SelectItem value="month">過去1ヶ月</SelectItem>
                <SelectItem value="quarter">過去3ヶ月</SelectItem>
                <SelectItem value="year">過去1年</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LineChart 
              title="ブログ閲覧数推移" 
              data={viewsData} 
              color="#0ea5e9"
            />
            {/* We could add another chart here later */}
          </div>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>人気記事ランキング</CardTitle>
              <CardDescription>閲覧数が多い記事のランキングです</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : topPosts.length > 0 ? (
                <div className="space-y-4">
                  {topPosts.map((post, index) => (
                    <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary flex items-center justify-center h-8 w-8 rounded-full text-primary-foreground font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{post.title}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {post.views} 閲覧
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  閲覧データがありません
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ管理</CardTitle>
              <CardDescription>
                ブログカテゴリの管理を行います。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left">カテゴリ名</th>
                          <th className="px-4 py-2 text-right">投稿数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryStats.map((category, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="px-4 py-2">{category.name}</td>
                            <td className="px-4 py-2 text-right">{category.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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

export default AdminBlog;
