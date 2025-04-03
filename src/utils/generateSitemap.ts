import { supabase } from '@/integrations/supabase/client';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generates a complete sitemap XML string for the website
 */
export async function generateSitemap(baseUrl: string): Promise<string> {
  const urls: SitemapUrl[] = [];
  
  // Add static pages
  const staticPages = [
    { url: '', priority: 1.0, changefreq: 'weekly' },
    { url: 'about', priority: 0.8, changefreq: 'monthly' },
    { url: 'contact', priority: 0.8, changefreq: 'monthly' },
    { url: 'faq', priority: 0.7, changefreq: 'monthly' },
    { url: 'terms', priority: 0.5, changefreq: 'yearly' },
    { url: 'privacy', priority: 0.5, changefreq: 'yearly' },
    { url: 'blog', priority: 0.9, changefreq: 'daily' },
    { url: 'therapists', priority: 0.9, changefreq: 'daily' },
  ];
  
  for (const page of staticPages) {
    urls.push({
      loc: `${baseUrl}/${page.url}`,
      changefreq: page.changefreq as any,
      priority: page.priority,
    });
  }
  
  // Add blog posts
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, published_at')
      .eq('published', true);
    
    if (!error && posts) {
      for (const post of posts) {
        urls.push({
          loc: `${baseUrl}/blog/${post.slug}`,
          lastmod: post.published_at,
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }
  
  // Add therapist profiles
  try {
    const { data: therapists, error } = await supabase
      .from('therapists')
      .select('id');
    
    if (!error && therapists) {
      for (const therapist of therapists) {
        urls.push({
          loc: `${baseUrl}/therapist/${therapist.id}`,
          changefreq: 'weekly',
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching therapists for sitemap:', error);
  }
  
  // Generate the XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  
  for (const url of urls) {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${url.loc}</loc>\n`;
    if (url.lastmod) sitemap += `    <lastmod>${url.lastmod}</lastmod>\n`;
    if (url.changefreq) sitemap += `    <changefreq>${url.changefreq}</changefreq>\n`;
    if (url.priority !== undefined) sitemap += `    <priority>${url.priority}</priority>\n`;
    sitemap += '  </url>\n';
  }
  
  sitemap += '</urlset>';
  
  return sitemap;
} 