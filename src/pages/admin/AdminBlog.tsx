
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        <Button>
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
    </div>
  );
};

export default AdminBlog;
