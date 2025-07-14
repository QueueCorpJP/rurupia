import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/DataTable";
import { Edit, Trash, Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  description?: string;
  post_count?: number;
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
  
  // Category management states
  const [isCategoryDeleteDialogOpen, setIsCategoryDeleteDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  
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
      
      // Fetch category usage counts
      const { data: categoryUsage, error: usageError } = await supabase
        .from('blog_posts')
        .select('category_id')
        .not('category_id', 'is', null);
      
      if (usageError) throw usageError;
      
      if (categoriesData) {
        // Add post count to categories
        const categoriesWithCount = categoriesData.map(category => {
          const postCount = categoryUsage?.filter(post => post.category_id === category.id).length || 0;
          return {
            ...category,
            post_count: postCount
          };
        });
        
        setCategories(categoriesWithCount);
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

  // Category management functions
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryDescription(category.description || "");
    setIsEditCategoryModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !editCategoryName.trim()) {
      toast({
        title: "エラー",
        description: "カテゴリ名を入力してください。",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_categories')
        .update({
          name: editCategoryName.trim(),
          description: editCategoryDescription.trim() || null
        })
        .eq('id', selectedCategory.id);

      if (error) throw error;

      toast({
        title: "更新完了",
        description: "カテゴリが更新されました。",
      });

      fetchBlogData();
      setIsEditCategoryModalOpen(false);
      setSelectedCategory(null);
      setEditCategoryName("");
      setEditCategoryDescription("");
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "エラー",
        description: "カテゴリの更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const confirmCategoryDelete = (category: Category) => {
    setSelectedCategory(category);
    setSelectedCategoryId(category.id);
    setIsCategoryDeleteDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategoryId || !selectedCategory) return;

    // Check if category has posts
    if (selectedCategory.post_count && selectedCategory.post_count > 0) {
      toast({
        title: "削除不可",
        description: `このカテゴリは${selectedCategory.post_count}件の記事で使用中のため削除できません。`,
        variant: "destructive",
      });
      setIsCategoryDeleteDialogOpen(false);
      setSelectedCategoryId(null);
      setSelectedCategory(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', selectedCategoryId);

      if (error) throw error;

      toast({
        title: "削除完了",
        description: "カテゴリが削除されました。",
      });

      fetchBlogData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "エラー",
        description: "カテゴリの削除に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsCategoryDeleteDialogOpen(false);
      setSelectedCategoryId(null);
      setSelectedCategory(null);
    }
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
      render: (data: any) => {
        // Safely access data - check if it exists before destructuring
        if (!data) return "-";
        
        // Now we can safely destructure
        const { row } = data;
        if (!row) return "-";
        
        // Check if this is a scheduled post
        if (row.scheduled_for) {
          const scheduledDate = new Date(row.scheduled_for);
          const now = new Date();
          
          if (scheduledDate > now) {
            return `${format(scheduledDate, "yyyy/MM/dd")} (予約済み)`;
          }
        }
        
        // Default to published_at date
        if (!row.published_at) return "-";
        const date = new Date(row.published_at);
        return format(date, "yyyy/MM/dd");
      }
    },
    {
      key: "status",
      label: "ステータス",
      render: (data: any) => {
        // Safely access data
        if (!data || !data.row) return null;
        
        const row = data.row;
        
        // Check if this is a scheduled post
        if (row.scheduled_for) {
          const scheduledDate = new Date(row.scheduled_for);
          const now = new Date();
          
          if (scheduledDate > now) {
            return <StatusBadge status="予約済み" />;
          }
        }
        
        return (
          <StatusBadge 
            status={row.published ? "公開中" : "下書き"} 
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

  // Category table columns
  const categoryColumns = [
    {
      key: "name",
      label: "カテゴリ名",
      accessorKey: "name"
    },
    {
      key: "description",
      label: "説明",
      accessorKey: "description"
    },
    {
      key: "post_count",
      label: "記事数",
      render: (data: any) => {
        if (!data || !data.row) return "0";
        return data.row.post_count || 0;
      }
    },
    {
      key: "actions",
      label: "操作",
      render: (data: any) => {
        if (!data || !data.row) return null;
        
        const category = data.row;
        const hasPosts = category.post_count && category.post_count > 0;
        
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleEditCategory(category)}
              title="編集"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className={hasPosts ? "text-muted-foreground cursor-not-allowed" : "text-destructive hover:text-destructive"}
              onClick={() => !hasPosts && confirmCategoryDelete(category)}
              disabled={hasPosts}
              title={hasPosts ? "使用中のカテゴリは削除できません" : "削除"}
            >
              {hasPosts ? <AlertTriangle className="h-4 w-4" /> : <Trash className="h-4 w-4" />}
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
          <TabsTrigger value="categories">カテゴリ管理</TabsTrigger>
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

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ管理</CardTitle>
              <CardDescription>
                ブログカテゴリの管理を行います。使用中のカテゴリは削除できません。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={categoryColumns}
                data={categories}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Post Delete Dialog */}
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

      {/* Category Delete Dialog */}
      <Dialog open={isCategoryDeleteDialogOpen} onOpenChange={setIsCategoryDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カテゴリを削除</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCategory && selectedCategory.post_count && selectedCategory.post_count > 0 ? (
              <div className="flex items-center space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    このカテゴリは削除できません
                  </p>
                  <p className="text-sm text-yellow-700">
                    {selectedCategory.post_count}件の記事がこのカテゴリを使用しています。
                  </p>
                </div>
              </div>
            ) : (
              <p>カテゴリ「{selectedCategory?.name}」を削除してもよろしいですか？この操作は取り消せません。</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCategoryDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            {selectedCategory && (!selectedCategory.post_count || selectedCategory.post_count === 0) && (
              <Button variant="destructive" onClick={handleDeleteCategory}>
                削除
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Edit Dialog */}
      <Dialog open={isEditCategoryModalOpen} onOpenChange={setIsEditCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カテゴリを編集</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category-name" className="text-right">
                カテゴリ名
              </Label>
              <Input
                id="edit-category-name"
                className="col-span-3"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="カテゴリ名"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category-description" className="text-right">
                説明
              </Label>
              <Textarea
                id="edit-category-description"
                className="col-span-3"
                value={editCategoryDescription}
                onChange={(e) => setEditCategoryDescription(e.target.value)}
                placeholder="カテゴリの説明を入力"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditCategoryModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleUpdateCategory}>
              更新
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
