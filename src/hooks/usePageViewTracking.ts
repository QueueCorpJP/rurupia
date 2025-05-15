import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const usePageViewTracking = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Only track views in browser environment
    if (typeof window === 'undefined') return;
    
    const trackPageView = async () => {
      try {
        // Skip tracking for auth pages
        const excludedPaths = ['/login', '/signup', '/admin/login'];
        if (excludedPaths.includes(location.pathname)) return;
        
        // Create a unique key for this page in this session
        const viewKey = `pv_${location.pathname}_${Date.now().toString().slice(0, 10)}`;
        
        // Check if we've already tracked this page in the last 30 minutes
        const lastViewed = localStorage.getItem(viewKey);
        if (lastViewed && (Date.now() - parseInt(lastViewed)) < 1800000) {
          return; // Skip if viewed recently
        }

        // Get user's IP address
        let ipAddress = '';
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          const data = await response.json();
          ipAddress = data.ip;
        } catch (ipErr) {
          console.error('Error fetching IP address:', ipErr);
          // Continue with empty IP if fetch fails
        }
        
        // Try using the RPC function first
        const { error } = await supabase.rpc('log_page_view_text', {
          page_path: location.pathname,
          ip: ipAddress,
          user_agent: navigator.userAgent
        });
        
        // If there's an error with the RPC function (like function resolution conflicts),
        // fall back to direct table insertion
        if (error) {
          console.error('Error logging page view via RPC:', error);
          console.log('Falling back to direct table insertion');
          
          // Insert directly into the page_views table
          const { error: insertError } = await supabase
            .from('page_views')
            .insert({
              page: location.pathname,
              ip_address: ipAddress,
              user_agent: navigator.userAgent,
              view_date: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Error inserting page view directly:', insertError);
            return;
          }
        }
        
        // For blog posts, increment view counter using the RPC function
        if (location.pathname.startsWith('/blog/') && location.pathname.length > 6) {
          const slug = location.pathname.substring(6);
          
          // Use the increment_blog_view function
          const { error: incrementError } = await supabase.rpc('increment_blog_view', {
            slug_param: slug
          });
          
          if (incrementError) {
            console.error('Error incrementing blog view:', incrementError);
            
            // Fall back to direct update if RPC fails
            if (incrementError) {
              // Fetch current views first
              const { data: post, error: fetchError } = await supabase
                .from('blog_posts')
                .select('views')
                .eq('slug', slug)
                .single();
                
              if (!fetchError && post) {
                const currentViews = post.views || 0;
                
                // Update with incremented value
                await supabase
                  .from('blog_posts')
                  .update({ views: currentViews + 1 })
                  .eq('slug', slug);
              }
            }
          }
        }
        
        // Mark this page as viewed
        localStorage.setItem(viewKey, Date.now().toString());
        
      } catch (err) {
        console.error('Error tracking page view:', err);
      }
    };
    
    // Small delay to ensure page has loaded
    const timer = setTimeout(trackPageView, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);
}; 