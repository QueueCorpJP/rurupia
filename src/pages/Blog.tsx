
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BlogCard from '../components/BlogCard';
import BlogSidebar from '../components/BlogSidebar';
import { blogPosts } from '../utils/blogData';
import { BlogPost } from '../utils/types';

const Blog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get unique categories and tags
  const categories = useMemo(() => 
    [...new Set(blogPosts.map(post => post.category))], 
    []
  );
  
  const tags = useMemo(() => 
    [...new Set(blogPosts.flatMap(post => post.tags))],
    []
  );
  
  // Filter posts based on search term
  const filteredPosts = useMemo(() => {
    if (!searchTerm) return blogPosts;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return blogPosts.filter(post => 
      post.title.toLowerCase().includes(lowerSearchTerm) ||
      post.excerpt.toLowerCase().includes(lowerSearchTerm) ||
      post.content.toLowerCase().includes(lowerSearchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) ||
      post.category.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const featuredPost = blogPosts[0]; // Use the first post as featured
  const mainPosts = filteredPosts.filter(post => post.id !== featuredPost.id);
  const recentPosts = [...blogPosts].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  ).slice(0, 3);
  
  // Sort posts by views to get the most popular ones
  const popularPosts = [...blogPosts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);
  
  return (
    <Layout>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
          SerenitySageブログ
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          健康的な体と心を保つためのヒントやマッサージ技術、リラクゼーションに関する最新の情報をお届けします。
        </p>
      </div>
      
      {/* Featured post */}
      <section className="mb-12">
        <BlogCard post={featuredPost} variant="featured" />
      </section>
      
      {/* Popular posts section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">人気の記事</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularPosts.map(post => (
            <BlogCard key={`popular-${post.id}`} post={post} />
          ))}
        </div>
      </section>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {searchTerm && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                "{searchTerm}" の検索結果: {filteredPosts.length}件
              </h2>
              <button 
                onClick={() => setSearchTerm('')}
                className="text-sm text-primary hover:underline"
              >
                検索をクリア
              </button>
            </div>
          )}
          
          {!searchTerm && (
            <h2 className="text-2xl font-bold mb-6">最新の記事</h2>
          )}
          
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">検索結果が見つかりませんでした</h3>
              <p className="text-muted-foreground mb-4">
                別のキーワードで検索するか、以下のカテゴリやタグを参照してください。
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-primary hover:underline"
              >
                すべての記事を表示
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {mainPosts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
        
        <BlogSidebar 
          recentPosts={recentPosts}
          categories={categories}
          tags={tags}
          onSearch={handleSearch}
        />
      </div>
    </Layout>
  );
};

export default Blog;
