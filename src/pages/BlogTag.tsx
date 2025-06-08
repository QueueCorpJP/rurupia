import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import BlogCard from '../components/BlogCard';
import BlogSidebar from '../components/BlogSidebar';
import { BlogPost } from '../utils/types';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';

const BlogTag = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Fetch blog posts from Supabase filtered by tag
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setIsLoading(true);
      try {
        // Get current date in ISO format for filtering scheduled posts
        const now = new Date().toISOString();
        const decodedTag = decodeURIComponent(tag || '');
        
        const { data, error } = await supabase
          .from('published_blog_posts')
          .select('*')
          .order('published_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching blog posts:', error);
          return;
        }
        
        // Transform data to match BlogPost type and filter by tag
        if (data) {
          const transformedPosts: BlogPost[] = data
            .filter(post => (post.tags || []).includes(decodedTag))
            .map(post => ({
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
        
        // Fetch all categories and tags for the sidebar
        const { data: allPostsData, error: allPostsError } = await supabase
          .from('published_blog_posts')
          .select('category, tags');
        
        if (!allPostsError && allPostsData) {
          const categories = [...new Set(allPostsData.map(p => p.category))];
          const tags = [...new Set(allPostsData.flatMap(p => p.tags || []))];
          setAllCategories(categories);
          setAllTags(tags);
        }
      } catch (err) {
        console.error('Unexpected error fetching blog posts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogPosts();
  }, [tag]);
  
  // Get recent posts for sidebar
  const recentPosts = useMemo(() => 
    [...blogPosts].sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    ).slice(0, 3), 
    [blogPosts]
  );
  
  if (isLoading) {
    return (
      <Layout>
        <SEO 
          title={`${decodeURIComponent(tag || '')} に関する記事`}
          description={`${decodeURIComponent(tag || '')} タグの最新記事一覧。`}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
              {decodeURIComponent(tag || '')}
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
        title={`${decodeURIComponent(tag || '')} に関する記事`}
        description={`${decodeURIComponent(tag || '')} タグの最新記事一覧。`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ブログ一覧に戻る
        </button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
            タグ: {decodeURIComponent(tag || '')}
          </h1>
          <p className="text-muted-foreground">
            {blogPosts.length}件の記事が見つかりました
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {blogPosts.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">記事が見つかりませんでした</h3>
                <p className="text-muted-foreground mb-4">
                  このタグには記事がまだありません。
                </p>
                <Link to="/blog" className="text-primary hover:underline">
                  すべての記事を表示
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {blogPosts.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
          
          <BlogSidebar 
            recentPosts={recentPosts}
            categories={allCategories}
            tags={allTags}
          />
        </div>
      </div>
    </Layout>
  );
};

export default BlogTag; 