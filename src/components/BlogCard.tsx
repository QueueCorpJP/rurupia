
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
  
  return (
    <article className={`group overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md ${
      isFeatured ? 'lg:grid lg:grid-cols-2 gap-6' : ''
    }`}>
      <Link 
        to={`/blog/${post.slug}`} 
        className={`block overflow-hidden ${isFeatured ? 'h-full' : 'h-48 sm:h-52'}`}
      >
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {isRelated && (
            <Badge variant="secondary" className="px-2 py-0">
              関連記事
            </Badge>
          )}
          <Badge variant="outline" className="px-2 py-0">
            {post.category}
          </Badge>
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            <span>{post.publishedAt}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
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
        
        <div className="mt-4 flex items-center gap-2">
          {post.authorAvatar ? (
            <img 
              src={post.authorAvatar} 
              alt={post.authorName} 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-xs font-medium text-primary-foreground">
                {post.authorName.charAt(0)}
              </span>
            </div>
          )}
          <span className="text-sm font-medium">{post.authorName}</span>
        </div>
        
        {isFeatured && (
          <Link 
            to={`/blog/${post.slug}`}
            className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            <span>続きを読む</span>
            <BookOpen className="ml-1 h-4 w-4" />
          </Link>
        )}
      </div>
    </article>
  );
};

export default BlogCard;
