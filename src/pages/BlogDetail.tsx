import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import BlogSidebar from '../components/BlogSidebar';
import BlogCard from '../components/BlogCard';
import { BlogPost } from '../utils/types';
import { ArrowLeft, Heart, Share, MessageSquare, CalendarDays, Clock, Link2, TrendingUp, Search } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import DOMPurify from 'dompurify';

// Inline styles for balloon and box elements to ensure they load
const inlineStyles = `
  .prose .balloon-left,
  .prose .balloon-right, 
  .prose .balloon-both,
  .blog-content .balloon-left,
  .blog-content .balloon-right,
  .blog-content .balloon-both,
  .balloon-left,
  .balloon-right,
  .balloon-both {
    position: relative !important;
    background-color: var(--balloon-color, #e3f2fd) !important;
    border-radius: 12px !important;
    padding: 16px 20px !important;
    margin: 16px 0 !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    display: block !important;
  }
  
  .prose .balloon-left::before,
  .blog-content .balloon-left::before,
  .balloon-left::before {
    content: '' !important;
    position: absolute !important;
    left: -10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 10px 10px 10px 0 !important;
    border-color: transparent var(--balloon-color, #e3f2fd) transparent transparent !important;
  }

  .prose .balloon-right::before,
  .blog-content .balloon-right::before,
  .balloon-right::before {
    content: '' !important;
    position: absolute !important;
    right: -10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 10px 0 10px 10px !important;
    border-color: transparent transparent transparent var(--balloon-color, #e3f2fd) !important;
  }

  .prose .balloon-both::before,
  .blog-content .balloon-both::before,
  .balloon-both::before {
    content: '' !important;
    position: absolute !important;
    left: -10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 10px 10px 10px 0 !important;
    border-color: transparent var(--balloon-color, #e3f2fd) transparent transparent !important;
  }

  .prose .balloon-both::after,
  .blog-content .balloon-both::after,
  .balloon-both::after {
    content: '' !important;
    position: absolute !important;
    right: -10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 10px 0 10px 10px !important;
    border-color: transparent transparent transparent var(--balloon-color, #e3f2fd) !important;
  }

  .prose .box-alert,
  .prose .box-info,
  .prose .box-tip,
  .prose .box-warning,
  .prose .box-good,
  .prose .box-bad,
  .blog-content .box-alert,
  .blog-content .box-info,
  .blog-content .box-tip,
  .blog-content .box-warning,
  .blog-content .box-good,
  .blog-content .box-bad,
  .box-alert,
  .box-info,
  .box-tip,
  .box-warning,
  .box-good,
  .box-bad {
    border-radius: 8px !important;
    padding: 16px !important;
    margin: 16px 0 !important;
    border-left: 4px solid !important;
    position: relative !important;
    display: block !important;
  }

  .prose .box-alert,
  .blog-content .box-alert,
  .box-alert {
    background-color: var(--box-color, #fff3cd) !important;
    border-left-color: #ff9800 !important;
    color: #856404 !important;
  }

  .prose .box-info,
  .blog-content .box-info,
  .box-info {
    background-color: var(--box-color, #d1ecf1) !important;
    border-left-color: #17a2b8 !important;
    color: #0c5460 !important;
  }

  .prose .box-tip,
  .blog-content .box-tip,
  .box-tip {
    background-color: var(--box-color, #d4edda) !important;
    border-left-color: #28a745 !important;
    color: #155724 !important;
  }

  .prose .box-warning,
  .blog-content .box-warning,
  .box-warning {
    background-color: var(--box-color, #f8d7da) !important;
    border-left-color: #dc3545 !important;
    color: #721c24 !important;
  }

  .prose .box-good,
  .blog-content .box-good,
  .box-good {
    background-color: var(--box-color, #d1f2eb) !important;
    border-left-color: #00d4aa !important;
    color: #0c6e54 !important;
  }

  .prose .box-bad,
  .blog-content .box-bad,
  .box-bad {
    background-color: var(--box-color, #f5c6cb) !important;
    border-left-color: #e74c3c !important;
    color: #721c24 !important;
  }

  .prose .box-alert::before,
  .blog-content .box-alert::before,
  .box-alert::before {
    content: '⚠️' !important;
    position: absolute !important;
    left: 12px !important;
    top: 16px !important;
    font-size: 16px !important;
  }

  .prose .box-info::before,
  .blog-content .box-info::before,
  .box-info::before {
    content: 'ℹ️' !important;
    position: absolute !important;
    left: 12px !important;
    top: 16px !important;
    font-size: 16px !important;
  }

  .prose .box-tip::before,
  .blog-content .box-tip::before,
  .box-tip::before {
    content: '💡' !important;
    position: absolute !important;
    left: 12px !important;
    top: 16px !important;
    font-size: 16px !important;
  }

  .prose .box-warning::before,
  .blog-content .box-warning::before,
  .box-warning::before {
    content: '⚠️' !important;
    position: absolute !important;
    left: 12px !important;
    top: 16px !important;
    font-size: 16px !important;
  }

  .prose .box-good::before,
  .blog-content .box-good::before,
  .box-good::before {
    content: '✅' !important;
    position: absolute !important;
    left: 12px !important;
    top: 16px !important;
    font-size: 16px !important;
  }

  .prose .box-bad::before,
  .blog-content .box-bad::before,
  .box-bad::before {
    content: '❌' !important;
    position: absolute !important;
    left: 12px !important;
    top: 16px !important;
    font-size: 16px !important;
  }

  .prose .box-alert p,
  .prose .box-info p,
  .prose .box-tip p,
  .prose .box-warning p,
  .prose .box-good p,
  .prose .box-bad p,
  .blog-content .box-alert p,
  .blog-content .box-info p,
  .blog-content .box-tip p,
  .blog-content .box-warning p,
  .blog-content .box-good p,
  .blog-content .box-bad p,
  .box-alert p,
  .box-info p,
  .box-tip p,
  .box-warning p,
  .box-good p,
  .box-bad p {
    margin-left: 28px !important;
    margin-bottom: 0 !important;
  }
`;

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
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
        // Get current date in ISO format for filtering scheduled posts
        const now = new Date().toISOString();
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
          .from('published_blog_posts')
          .select('*')
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
          .from('published_blog_posts')
          .select('*')
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
          .from('published_blog_posts')
          .select('category, tags');
        
        if (!allPostsError && allPosts) {
          const allCategories = [...new Set(allPosts.map(p => p.category))];
          const allTags = [...new Set(allPosts.flatMap(p => p.tags || []))];
          setCategories(allCategories);
          setTags(allTags);
        }
        
        // 8. Log page view
        try {
          await supabase.rpc('log_page_view_text', {
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
    checkAuthAndLikes();
  }, [slug]);
  
  const checkAuthAndLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user && slug) {
        // Check if user has already liked this post
        const { data: likeData, error: likeError } = await supabase
          .from('blog_likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_slug', slug)
          .maybeSingle();
        
        if (likeError) {
          console.error('Error checking like status:', likeError);
        } else {
          setIsLiked(!!likeData);
        }
        
        // Get total likes count for this post
        const { count, error: countError } = await supabase
          .from('blog_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_slug', slug);
        
        if (countError) {
          console.error('Error getting likes count:', countError);
        } else {
          setLikesCount(count || 0);
        }
      }
    } catch (error) {
      console.error('Error in checkAuthAndLikes:', error);
    }
  };
  
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
  

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "ログインが必要です",
        description: "いいねするにはログインしてください。",
        variant: "destructive"
      });
      return;
    }
    
    if (isLikeProcessing) return;
    
    try {
      setIsLikeProcessing(true);
      
      if (isLiked) {
        // Unlike: Remove from database
        // First, find the record to delete
        const { data: existingLike, error: findError } = await supabase
          .from('blog_likes')
          .select('id')
          .eq('user_id', currentUser.id)
          .eq('post_slug', slug)
          .single();
        
        if (findError || !existingLike) {
          console.error('Error finding like to delete:', findError);
          throw new Error('いいねが見つかりませんでした');
        }
        
        // Now delete the specific record
        const { error } = await supabase
          .from('blog_likes')
          .delete()
          .eq('id', existingLike.id);
        
        if (error) throw error;
        
        // Update UI immediately for better UX
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        
        toast.success("この記事のいいねを削除しました。");
        
        // Re-fetch to ensure consistency
        setTimeout(() => {
          checkAuthAndLikes();
        }, 1000);
      } else {
        // Like: Add to database
        const { error } = await supabase
          .from('blog_likes')
          .insert({
            user_id: currentUser.id,
            post_slug: slug,
            created_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        // Update UI immediately for better UX
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        
        toast.success("この記事をお気に入りとして保存しました。");
        
        // Re-fetch to ensure consistency
        setTimeout(() => {
          checkAuthAndLikes();
        }, 1000);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLikeProcessing(false);
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
      <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
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
                
                <div 
                  className="prose prose-lg max-w-none blog-content" 
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(post.content, {
                      ALLOWED_TAGS: ['div', 'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span'],
                      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'style'],
                      ALLOW_DATA_ATTR: false,
                      FORBID_TAGS: [],
                      FORBID_ATTR: [],
                      KEEP_CONTENT: true
                    })
                  }} 
                />
                
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLike}
                    disabled={isLikeProcessing}
                    className={isLiked ? 'bg-red-50 border-red-200' : ''}
                  >
                    <Heart className={`mr-1 h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {isLikeProcessing ? '処理中...' : `いいね ${likesCount > 0 ? `(${likesCount})` : ''}`}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share className="mr-1 h-4 w-4" />
                    シェア
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
