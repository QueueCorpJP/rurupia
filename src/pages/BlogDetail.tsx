import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import BlogSidebar from '../components/BlogSidebar';
import BlogCard from '../components/BlogCard';
import { BlogPost } from '../utils/types';
import { ArrowLeft, Heart, Share, MessageSquare, CalendarDays, Clock, Link2, TrendingUp, Search } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/use-toast';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<BlogPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    const fetchPostAndRelated = async () => {
      setIsLoading(true);
      try {
        if (!slug) return;
        
        // 1. Fetch the specific post
        const { data: postData, error: postError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();
        
        if (postError) {
          console.error('Error fetching blog post:', postError);
          setIsLoading(false);
          return;
        }
        
        if (!postData) {
          setIsLoading(false);
          return;
        }
        
        // 2. Transform the post data
        const transformedPost: BlogPost = {
          id: postData.id,
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          content: postData.content,
          publishedAt: new Date(postData.published_at).toLocaleDateString('ja-JP'),
          category: postData.category,
          tags: postData.tags || [],
          coverImage: postData.cover_image || 'https://placehold.co/600x400/png',
          readTime: postData.read_time,
          views: postData.views,
          author_name: postData.author_name,
          author_avatar: postData.author_avatar
        };
        
        setPost(transformedPost);
        
        // 3. Increment view count
        try {
          await supabase.rpc('increment_blog_view', { slug_param: slug });
        } catch (error) {
          console.error('Error incrementing view count:', error);
        }
        
        // 4. Fetch related posts (same category or tags)
        const { data: relatedData, error: relatedError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .neq('slug', slug)
          .or(`category.eq.${postData.category},tags.cs.{${postData.tags?.join(',')}}`)
          .limit(3);
        
        if (!relatedError && relatedData) {
          const transformedRelated: BlogPost[] = relatedData.map(post => ({
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
          setRelatedPosts(transformedRelated);
        }
        
        // 5. Fetch popular posts
        const { data: popularData, error: popularError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('views', { ascending: false })
          .limit(5);
        
        if (!popularError && popularData) {
          const transformedPopular: BlogPost[] = popularData.map(post => ({
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
          setPopularPosts(transformedPopular);
        }
        
        // 6. Fetch recent posts
        const { data: recentData, error: recentError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .neq('slug', slug)
          .order('published_at', { ascending: false })
          .limit(3);
        
        if (!recentError && recentData) {
          const transformedRecent: BlogPost[] = recentData.map(post => ({
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
          setRecentPosts(transformedRecent);
        }
        
        // 7. Get unique categories and tags
        const { data: allPosts, error: allPostsError } = await supabase
          .from('blog_posts')
          .select('category, tags')
          .eq('published', true);
        
        if (!allPostsError && allPosts) {
          const allCategories = [...new Set(allPosts.map(p => p.category))];
          const allTags = [...new Set(allPosts.flatMap(p => p.tags || []))];
          setCategories(allCategories);
          setTags(allTags);
        }
        
        // 8. Log page view
        try {
          await supabase.rpc('log_page_view', {
            page_path: `/blog/${slug}`,
            ip: '0.0.0.0', // We don't track user IP
            user_agent: navigator.userAgent
          });
        } catch (error) {
          console.error('Error logging page view:', error);
        }
        
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPostAndRelated();
  }, [slug]);
  
  // Create structured data for BlogPosting
  const getBlogPostSchema = () => {
    if (!post) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "image": post.coverImage,
      "author": {
        "@type": "Person",
        "name": post.author_name || "るぴぴあ"
      },
      "publisher": {
        "@type": "Organization",
        "name": "るぴぴあ",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      },
      "datePublished": post.publishedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "keywords": post.tags.join(","),
      "articleSection": post.category
    };
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "リンクをコピーしました",
        description: "ブログ記事のリンクがクリップボードにコピーされました。",
      });
    }
  };
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      toast({
        title: "投稿をいいねしました",
        description: "この記事をお気に入りとして保存しました。",
      });
    }
  };
  
  // Filter posts based on search term
  const filteredPosts = () => {
    if (!searchTerm) return [];
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allBlogPosts.filter(post => 
      post.title.toLowerCase().includes(lowerSearchTerm) ||
      post.excerpt.toLowerCase().includes(lowerSearchTerm) ||
      post.content.toLowerCase().includes(lowerSearchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) ||
      post.category.toLowerCase().includes(lowerSearchTerm)
    );
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
    
    // If we don't have all blog posts yet, fetch them
    if (allBlogPosts.length === 0) {
      fetchAllBlogPosts();
    }
  };
  
  const fetchAllBlogPosts = async () => {
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
        console.error('Error fetching all blog posts:', error);
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
        
        setAllBlogPosts(transformedPosts);
      }
    } catch (err) {
      console.error('Unexpected error fetching all blog posts:', err);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <SEO 
          title="ブログ記事を読み込み中..."
          description="ブログ記事を読み込んでいます。少々お待ちください。"
        />
        <div className="flex justify-center items-center h-96">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!post) {
    return (
      <Layout>
        <SEO 
          title="記事が見つかりません"
          description="お探しのブログ記事は存在しないか、削除された可能性があります。"
        />
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">ブログ記事が見つかりません</h2>
          <p className="text-muted-foreground mt-2">
            お探しの記事は存在しないか、削除された可能性があります。
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center mt-4 text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ブログ一覧に戻る
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <SEO 
        title={post.title}
        description={post.excerpt}
        image={post.coverImage}
        type="article"
        publishedAt={post.publishedAt}
        author={post.author_name}
        schemaJson={getBlogPostSchema()}
        keywords={post.tags.join(', ')}
      />
      <div className="px-4 sm:px-6 md:px-8 lg:px-12">
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ブログ一覧に戻る
        </button>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {isSearching ? (
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  "{searchTerm}" の検索結果: {filteredPosts().length}件
                </h2>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearching(false);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  検索をクリア
                </button>
              </div>
              
              {filteredPosts().length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <h3 className="text-lg font-medium mb-2">検索結果が見つかりませんでした</h3>
                  <p className="text-muted-foreground mb-4">
                    別のキーワードで検索するか、以下のカテゴリやタグを参照してください。
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setIsSearching(false);
                    }}
                    className="text-primary hover:underline"
                  >
                    記事に戻る
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {filteredPosts().map(post => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="lg:col-span-2">
              <article className="space-y-6">
                <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg">
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 px-3 py-1">
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>{post.publishedAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}分で読めます</span>
                  </div>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  {post.title}
                </h1>
                
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
                
                <div className="flex flex-wrap gap-2 pt-4">
                  {post.tags.map((tag, idx) => (
                    <Link 
                      key={idx} 
                      to={`/blog/tag/${encodeURIComponent(tag)}`}
                      className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={handleLike}>
                    <Heart className={`mr-1 h-4 w-4 ${isLiked ? 'fill-destructive text-destructive' : ''}`} />
                    いいね
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share className="mr-1 h-4 w-4" />
                    シェア
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    コメント
                  </Button>
                </div>
              </article>
              
              {/* Popular Posts Section */}
              {popularPosts.length > 0 && (
                <div className="mt-12 border-t pt-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                    人気の記事
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {popularPosts.map(popularPost => (
                      <Card key={popularPost.id} className="overflow-hidden">
                        <div className="h-40 overflow-hidden">
                          <img 
                            src={popularPost.coverImage} 
                            alt={popularPost.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <Badge className="mb-2">{popularPost.views || 0} 閲覧</Badge>
                          <h3 className="font-semibold line-clamp-2">
                            <Link to={`/blog/${popularPost.slug}`} className="hover:underline">{popularPost.title}</Link>
                          </h3>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Related Posts Section */}
              {relatedPosts.length > 0 && (
                <div className="mt-12 border-t pt-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Link2 className="mr-2 h-5 w-5 text-primary" />
                    関連記事
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {relatedPosts.map(relatedPost => (
                      <BlogCard 
                        key={relatedPost.id} 
                        post={relatedPost} 
                        isRelated={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
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

export default BlogDetail;
