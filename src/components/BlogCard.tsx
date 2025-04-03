import { Link } from 'react-router-dom';
import { Clock, CalendarDays, BookOpen } from 'lucide-react';
import { BlogPost } from '../utils/types';
import { Badge } from './ui/badge';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured';
  isRelated?: boolean;
}

const BlogCard = ({ post, variant = 'default', isRelated = false }: BlogCardProps) => {
  const isFeatured = variant === 'featured';
  
  // Create descriptive alt text for better accessibility and SEO
  const imageAltText = `${post.title} - ${post.category}カテゴリの記事のサムネイル画像`;
  
  return (
    <article className={`group overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md ${
      isFeatured ? 'lg:grid lg:grid-cols-2 gap-6' : ''
    }`}>
      <Link 
        to={`/blog/${post.slug}`} 
        className={`block overflow-hidden ${isFeatured ? 'h-full' : 'h-48 sm:h-52'}`}
        aria-label={`${post.title}の記事を読む`}
      >
        <img 
          src={post.coverImage} 
          alt={imageAltText} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy" // Add lazy loading for better performance
        />
      </Link>
      
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {isRelated && (
            <Badge variant="secondary" className="px-2 py-0">
              関連記事
            </Badge>
          )}
          <Badge variant="primary" className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 px-2 py-0">
            {post.category}
          </Badge>
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" aria-hidden="true" />
            <span>{post.publishedAt}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{post.readTime}分で読めます</span>
          </div>
        </div>
        
        <Link to={`/blog/${post.slug}`}>
          <h2 className={`font-bold text-card-foreground transition-colors group-hover:text-primary ${
            isFeatured ? 'text-xl sm:text-2xl' : 'text-lg'
          }`}>
            {post.title}
          </h2>
        </Link>
        
        <p className={`mt-2 text-muted-foreground ${isFeatured ? 'text-sm sm:text-base' : 'text-sm line-clamp-2'}`}>
          {post.excerpt}
        </p>
        
        {isFeatured && (
          <Link 
            to={`/blog/${post.slug}`}
            className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
            aria-label={`${post.title}の続きを読む`}
          >
            <span>続きを読む</span>
            <BookOpen className="ml-1 h-4 w-4" aria-hidden="true" />
          </Link>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4" aria-label="記事のタグ">
            {post.tags.map((tag, idx) => (
              <Link 
                key={idx} 
                to={`/blog/tag/${encodeURIComponent(tag)}`}
                className="inline-flex items-center rounded-full bg-gray-100 border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                aria-label={`${tag}タグの記事一覧を見る`}
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogCard;
