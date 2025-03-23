
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const PageViewTracker = () => {
  const location = useLocation();
  const prevPathRef = useRef<string>('');

  useEffect(() => {
    const trackPageView = async () => {
      // Check if the path has changed to avoid duplicate tracking on re-renders
      if (prevPathRef.current === location.pathname) return;
      
      try {
        // Call our edge function to track the page view
        await supabase.functions.invoke('track-pageview', {
          body: {
            page: location.pathname,
            referrer: document.referrer,
          },
        });
        
        // Update the previous path
        prevPathRef.current = location.pathname;
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default PageViewTracker;
