
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const sortOptions = [
  { label: '全て表示', value: 'all' },
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
  { label: '閲覧数順', value: 'views' },
];

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    author_name: ''
  });

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;

      const formattedPosts = data.map(post => ({
        id: post.id,
        title: post.title,
        author: post.author_name,
        date: new Date(post.published_at).toLocaleDateString('ja-JP'),
        category: post.category,
        views: post.views
      }));

      setPosts(formattedPosts);
      setFilteredPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('ブログ記事の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term) => {
    if (!term.trim()) {
      setFilteredPosts(posts);
      return;
    }
    
    const filtered = posts.filter(
      post => 
        post.title.toLowerCase().includes(term.toLowerCase()) || 
        post.author.toLowerCase().includes(term.toLowerCase()) ||
        post.category.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredPosts(filtered);
  };

  const handleSortChange = (value) => {
    let sorted = [...posts];
    
    switch(value) {
      case 'all':
        setFilteredPosts(posts);
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        setFilteredPosts(sorted);
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        setFilteredPosts(sorted);
        break;
      case 'views':
        sorted.sort((a, b) => b.views - a.views);
        setFilteredPosts(sorted);
        break;
      default:
        setFilteredPosts(posts);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPost = async () => {
    try {
      // Validate inputs
      if (!newPost.title || !newPost.content || !newPost.excerpt || !newPost.category || !newPost.author_name) {
        toast.error('全ての必須項目を入力してください');
        return;
      }

      // Generate a slug from the title
      const slug = newPost.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');

      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title: newPost.title,
          content: newPost.content,
          excerpt: newPost.excerpt,
          category: newPost.category,
          author_name: newPost.author_name,
          slug: slug,
          tags: []
        })
        .select();

      if (error) throw error;

      // Reset form and close dialog
      setNewPost({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        author_name: ''
      });
      setIsDialogOpen(false);

      // Add new post to the list
      if (data && data.length > 0) {
        const newPostData = {
          id: data[0].id,
          title: data[0].title,
          author: data[0].author_name,
          date: new Date(data[0].published_at).toLocaleDateString('ja-JP'),
          category: data[0].category,
          views: data[0].views || 0
        };

        setPosts(prev => [newPostData, ...prev]);
        setFilteredPosts(prev => [newPostData, ...prev]);
      }

      toast.success('記事を追加しました');
      fetchBlogPosts(); // Refresh the list
    } catch (error) {
      console.error('Error adding post:', error);
      toast.error('記事の追加に失敗しました');
    }
  };

  const handleEdit = (post) => {
    toast.info(`編集: ${post.title}`);
    // Implement edit functionality here
  };

  const handleDelete = async (post) => {
    if (window.confirm(`「${post.title}」を削除してもよろしいですか？`)) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', post.id);

        if (error) throw error;

        setPosts(prevPosts => prevPosts.filter(p => p.id !== post.id));
        setFilteredPosts(prevFiltered => prevFiltered.filter(p => p.id !== post.id));
        toast.success('記事を削除しました');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('記事の削除に失敗しました');
      }
    }
  };

  const columns = [
    { key: 'title', label: 'タイトル' },
    { key: 'author', label: '著者' },
    { key: 'date', label: '公開日' },
    { key: 'category', label: 'カテゴリ' },
    { key: 'views', label: '閲覧数' },
  ];

  const actionMenuItems = [
    { label: '編集する', onClick: handleEdit },
    { label: '削除する', onClick: handleDelete },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ブログ管理</h1>
          <p className="text-muted-foreground mt-2">ブログ記事の作成と管理</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </div>
      
      <DataTable 
        columns={columns}
        data={filteredPosts}
        searchPlaceholder="タイトルや著者で検索"
        sortOptions={sortOptions}
        onSearchChange={handleSearch}
        onSortChange={handleSortChange}
        actionMenuItems={actionMenuItems}
        isLoading={isLoading}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>新規記事作成</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                name="title"
                value={newPost.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="author_name">著者名</Label>
              <Input
                id="author_name"
                name="author_name"
                value={newPost.author_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">カテゴリ</Label>
              <Input
                id="category"
                name="category"
                value={newPost.category}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="excerpt">抜粋</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                value={newPost.excerpt}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">本文</Label>
              <Textarea
                id="content"
                name="content"
                rows={5}
                value={newPost.content}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleAddPost}>登録する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
