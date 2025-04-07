import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BlogCard from '../components/BlogCard';
import BlogSidebar from '../components/BlogSidebar';
import { BlogPost } from '../utils/types';
import { Trophy, Award, Medal, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';

const Blog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch blog posts from Supabase
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setIsLoading(true);
      try {
        // Get current date in ISO format for filtering scheduled posts
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .or(`scheduled_for.is.null,scheduled_for.lte.${now}`)
          .order('published_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching blog posts:', error);
          return;
        }
        
        // Transform data to match BlogPost type
        if (data) {
          const transformedPosts: BlogPost[] = data.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            publishedAt: new Date(post.published_at).toLocaleDateString('ja-JP'),
            category: post.category,
            tags: post.tags || [],
            coverImage: post.cover_image || 'https://placehold.co/600x400/png',
            readTime: post.read_time,
            views: post.views,
            author_name: post.author_name,
            author_avatar: post.author_avatar
          }));
          
          setBlogPosts(transformedPosts);
        }
      } catch (err) {
        console.error('Unexpected error fetching blog posts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogPosts();
  }, []);
  
  // Log page view
  useEffect(() => {
    const logPageView = async () => {
      try {
        // Call the RPC function to log the page view
        await supabase.rpc('log_page_view', {
          page_path: '/blog',
          ip: '0.0.0.0', // We don't actually track user IP
          user_agent: navigator.userAgent
        });
      } catch (error) {
        console.error('Error logging page view:', error);
      }
    };
    
    logPageView();
  }, []);
  
  // Get unique categories and tags
  const categories = useMemo(() => 
    [...new Set(blogPosts.map(post => post.category))], 
    [blogPosts]
  );
  
  const tags = useMemo(() => 
    [...new Set(blogPosts.flatMap(post => post.tags))],
    [blogPosts]
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
  }, [searchTerm, blogPosts]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  // Get featured and recent posts
  const featuredPost = blogPosts.length > 0 ? blogPosts[0] : null;
  const mainPosts = featuredPost ? filteredPosts.filter(post => post.id !== featuredPost.id) : filteredPosts;
  const recentPosts = [...blogPosts].slice(0, 3);
  
  // Sort posts by views to get the most popular ones
  const popularPosts = useMemo(() => 
    [...blogPosts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5), 
    [blogPosts]
  );
  
  // Rank icons for popular posts
  const rankIcons = [
    <Trophy className="text-yellow-500" key="rank-1" />,
    <Award className="text-gray-400" key="rank-2" />,
    <Medal className="text-amber-700" key="rank-3" />,
    <Star className="text-blue-400" key="rank-4" />,
    <Star className="text-purple-400" key="rank-5" />
  ];
  
  // Create schema.org structured data for Blog listing
  const blogListingSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "headline": "SerenitySageブログ",
    "description": "健康的な体と心を保つためのヒントやマッサージ技術、リラクゼーションに関する最新の情報をお届けします。",
    "url": window.location.href,
    "author": {
      "@type": "Organization",
      "name": "SerenitySage"
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "author": {
        "@type": "Person",
        "name": post.author_name || "SerenitySage"
      },
      "datePublished": post.publishedAt,
      "image": post.coverImage,
      "url": `${window.location.origin}/blog/${post.slug}`
    }))
  };
  
  if (isLoading) {
    return (
      <Layout>
        <SEO 
          title="ブログ" 
          description="健康的な体と心を保つためのヒントやマッサージ技術、リラクゼーションに関する最新の情報をお届けします。"
          keywords={tags.join(', ')}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
              SerenitySageブログ
            </h1>
            <p className="text-muted-foreground">
              ブログ記事を読み込み中...
            </p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <SEO 
        title="ブログ" 
        description="健康的な体と心を保つためのヒントやマッサージ技術、リラクゼーションに関する最新の情報をお届けします。"
        keywords={tags.join(', ')}
        schemaJson={blogListingSchema}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
            SerenitySageブログ
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            健康的な体と心を保つためのヒントやマッサージ技術、リラクゼーションに関する最新の情報をお届けします。
          </p>
        </div>
        
        {/* Featured post */}
        {featuredPost && (
          <section className="mb-12">
            <BlogCard post={featuredPost} variant="featured" />
          </section>
        )}
        
        {/* Popular posts section with ranking */}
        {popularPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">人気の記事</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popularPosts.map((post, index) => (
                <div key={`popular-${post.id}`} className="relative">
                  <div className="absolute -top-3 -left-3 z-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full w-10 h-10 shadow-md">
                    {rankIcons[index]}
                  </div>
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          </section>
        )}
        
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
      </div>
    </Layout>
  );
};

export default Blog;
