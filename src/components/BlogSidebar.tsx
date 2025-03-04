
import { Link } from 'react-router-dom';
import { BlogPost } from '../utils/types';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { Input } from './ui/input';

interface BlogSidebarProps {
  recentPosts: BlogPost[];
  categories: string[];
  tags: string[];
  onSearch?: (term: string) => void;
}

const BlogSidebar = ({ recentPosts, categories, tags, onSearch }: BlogSidebarProps) => {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const searchTerm = formData.get('search') as string;
    
    if (onSearch && searchTerm) {
      onSearch(searchTerm);
    }
  };
  
  return (
    <aside className="space-y-8">
      {/* Search */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-medium mb-3">ブログ検索</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            type="search" 
            name="search" 
            placeholder="キーワードを入力..." 
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
      
      {/* Recent Posts */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-medium mb-3">最新の投稿</h3>
        <div className="space-y-4">
          {recentPosts.map(post => (
            <div key={post.id} className="flex gap-3">
              <Link to={`/blog/${post.slug}`} className="shrink-0">
                <img 
                  src={post.coverImage} 
                  alt={post.title} 
                  className="h-16 w-16 rounded-md object-cover"
                />
              </Link>
              <div className="flex flex-col">
                <Link 
                  to={`/blog/${post.slug}`}
                  className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                >
                  {post.title}
                </Link>
                <span className="text-xs text-muted-foreground mt-1">
                  {post.publishedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Categories */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-medium mb-3">カテゴリー</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <Link 
              key={index} 
              to={`/blog/category/${encodeURIComponent(category)}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Tags */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-medium mb-3">タグ</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Link 
              key={index} 
              to={`/blog/tag/${encodeURIComponent(tag)}`}
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-secondary"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default BlogSidebar;
