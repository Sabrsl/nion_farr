import { useState, useEffect } from 'react';

/**
 * Hook to check if a media query matches
 * @param query - CSS media query string
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Default to false on the server
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (i.e., we're in the browser)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Set initial state
      setMatches(media.matches);
      
      // Define callback function
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // Add listener
      if (media.addEventListener) {
        // Modern browsers
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
      } else {
        // Older browsers (Safari < 14)
        media.addListener(listener);
        return () => media.removeListener(listener);
      }
    }
    
    // Empty dependency array for server-side
    return () => {};
  }, [query]);

  return matches;
} 