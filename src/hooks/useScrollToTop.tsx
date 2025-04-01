import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * A custom hook that scrolls the window to the top when the route changes
 */
export function useScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's a hash in the URL (like #section), don't scroll to top
    if (hash) return;
    
    // Otherwise, scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: "instant" // Using "instant" instead of "smooth" to avoid jarring effects on navigation
    });
  }, [pathname, hash]);
}
