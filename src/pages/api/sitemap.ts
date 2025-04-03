import { generateSitemap } from '@/utils/generateSitemap';

/**
 * API endpoint to dynamically generate and serve the sitemap.xml
 */
export default async function handler(req: any, res: any) {
  try {
    // Get base URL from the request or use a default
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   'https://therapist-connectivity.vercel.app';
    
    // Generate the sitemap XML
    const sitemap = await generateSitemap(baseUrl);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    
    // Send the sitemap XML as the response
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
} 