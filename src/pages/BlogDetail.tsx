
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import BlogSidebar from '../components/BlogSidebar';
import { blogPosts } from '../utils/blogData';
import { BlogPost } from '../utils/types';
import { ArrowLeft, Heart, Share, MessageSquare, CalendarDays, Clock } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/use-toast';

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      if (slug) {
        const foundPost = blogPosts.find(p => p.slug === slug);
        setPost(foundPost || null);
      }
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [slug]);
  
  // Get categories and tags for the sidebar
  const categories = [...new Set(blogPosts.map(post => post.category))];
  const tags = [...new Set(blogPosts.flatMap(post => post.tags))];
  
  // Get recent posts excluding current post
  const recentPosts = [...blogPosts]
    .filter(p => p.slug !== slug)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);
  
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
  
  if (isLoading) {
    return (
      <Layout>
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
      <button
        onClick={() => navigate('/blog')}
        className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        ブログ一覧に戻る
      </button>
      
      <div className="grid gap-8 lg:grid-cols-3">
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
              <Badge variant="outline" className="px-2.5 py-0.5">
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
            
            <div className="flex items-center gap-4">
              {post.authorAvatar ? (
                <img 
                  src={post.authorAvatar} 
                  alt={post.authorName} 
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <span className="text-sm font-medium text-primary-foreground">
                    {post.authorName.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <div className="font-medium">{post.authorName}</div>
                <div className="text-sm text-muted-foreground">セラピスト</div>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
            
            <div className="flex flex-wrap gap-2 pt-4">
              {post.tags.map((tag, idx) => (
                <Link 
                  key={idx} 
                  to={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-secondary"
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
          
          <div className="mt-12 border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">関連記事</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {blogPosts
                .filter(p => p.slug !== post.slug && (
                  p.category === post.category ||
                  p.tags.some(tag => post.tags.includes(tag))
                ))
                .slice(0, 2)
                .map(relatedPost => (
                  <div key={relatedPost.id} className="group flex flex-col rounded-lg border overflow-hidden">
                    <Link 
                      to={`/blog/${relatedPost.slug}`} 
                      className="block h-40 overflow-hidden"
                    >
                      <img 
                        src={relatedPost.coverImage} 
                        alt={relatedPost.title} 
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                    <div className="flex flex-col p-4">
                      <Link 
                        to={`/blog/${relatedPost.slug}`}
                        className="font-medium group-hover:text-primary transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                      <span className="text-xs text-muted-foreground mt-1">
                        {relatedPost.publishedAt}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        <BlogSidebar 
          recentPosts={recentPosts}
          categories={categories}
          tags={tags}
        />
      </div>
    </Layout>
  );
};

export default BlogDetail;
