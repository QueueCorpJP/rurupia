import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/DataTable";
import { Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  
  // Debug form states
  const [debugTitle, setDebugTitle] = useState("Test Post");
  const [debugCategory, setDebugCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleEditPost = (postId: string) => {
    const post = blogPosts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setActiveTab("editor");
    }
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

  const columns = [
    {
      key: "title",
      label: "タイトル",
      accessorKey: "title"
    },
    {
      key: "author_name",
      label: "作成者",
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
      render: (data: any) => {
        // Safely access data - check if it exists before destructuring
        if (!data) return "-";
        
        // Now we can safely destructure
        const { row } = data;
        if (!row || !row.published_at) return "-";
        
        const date = new Date(row.published_at);
        return format(date, "yyyy/MM/dd");
      }
    },
    {
      key: "status",
      label: "ステータス",
      accessorKey: "published",
      render: (data: any) => {
        // Safely access data
        if (!data || !data.row) return null;
        
        return (
          <StatusBadge 
            status={data.row.published ? "公開中" : "下書き"} 
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
      render: (data: any) => {
        // Safely access data
        if (!data || !data.row) return null;
        
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setSelectedPost(data.row);
                setActiveTab("editor");
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                setSelectedPostId(data.row.id);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  const handleSimplePostCreation = async () => {
    if (!debugTitle || !debugCategory) {
      toast({
        title: "Error",
        description: "Title and category are required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    console.log("Starting simple blog post creation");
    
    try {
      // Check session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session check:", session ? "Session exists" : "No session");
      
      if (!session) {
        toast({
          title: "Error",
          description: "No active session",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create a minimal blog post
      const postData = {
        title: debugTitle,
        content: "<p>This is a test blog post created with the debug form.</p>",
        excerpt: "Test excerpt",
        slug: `test-post-${Date.now()}`,
        category_id: debugCategory,
        category: categories.find(c => c.id === debugCategory)?.name || "",
        published: true,
        author_name: "Debug Author"
      };
      
      console.log("Preparing to insert post:", postData);
      
      const { data: insertData, error: insertError } = await supabase
        .from('blog_posts')
        .insert(postData)
        .select();
      
      console.log("Insert response:", insertData);
        
      if (insertError) {
        console.error("Insert error:", insertError);
        console.error("Error details:", JSON.stringify(insertError));
        toast({
          title: "Error creating post",
          description: insertError.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Blog post created successfully"
        });
        fetchBlogData();
      }
    } catch (error) {
      console.error("Simple post creation error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ブログ管理</h1>
        <p className="text-muted-foreground mt-2">ブログ記事の作成と管理</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">記事一覧</TabsTrigger>
          <TabsTrigger value="editor">新規作成/編集</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ブログ記事一覧</CardTitle>
              <CardDescription>
                全てのブログ記事を管理します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Input
                  placeholder="タイトルで検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={() => {
                  setSelectedPost(null);
                  setActiveTab("editor");
                }}>
                  新規作成
                </Button>
              </div>
              <DataTable 
                columns={columns}
                data={filteredPosts}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle>{selectedPost ? "記事を編集" : "新規記事を作成"}</CardTitle>
              <CardDescription>
                ブログ記事の内容を編集します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlogEditor 
                initialData={selectedPost}
                onSuccess={() => {
                  fetchBlogData();
                  setActiveTab("posts");
                  setSelectedPost(null);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>記事を削除</DialogTitle>
          </DialogHeader>
          <p>この記事を削除してもよろしいですか？この操作は取り消せません。</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              削除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
