/**
 * Simple analytics module for tracking user events
 */

// Initialize analytics (would connect to a real analytics service in production)
let initialized = false;

const initAnalytics = () => {
  if (initialized) return;
  
  if (typeof window !== 'undefined') {
    // In a real app, this would initialize analytics SDK
    // Example: window.gtag = window.gtag || function(){};
    
    console.info('Analytics initialized');
    initialized = true;
  }
};

/**
 * Track a user event
 * @param eventName - Name of the event to track
 * @param properties - Optional properties to include with the event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Initialize if not already done
  if (!initialized) {
    initAnalytics();
  }
  
  // In development, log to console
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] Event: ${eventName}`, properties);
  }
  
  // In a real app, this would send the event to your analytics service
  // Example: window.gtag('event', eventName, properties);
};

/**
 * Track a page view
 * @param url - URL of the page being viewed
 * @param title - Title of the page
 */
export const trackPageView = (url: string, title?: string) => {
  trackEvent('page_view', { 
    url,
    title: title || document.title
  });
};

/**
 * Set user properties for analytics
 * @param userId - ID of the current user
 * @param properties - User properties to track
 */
export const setUserProperties = (userId: string, properties?: Record<string, any>) => {
  if (!initialized) {
    initAnalytics();
  }
  
  // In development, log to console
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] Set user properties for ${userId}`, properties);
  }
  
  // In a real app, this would set user properties in your analytics service
  // Example: window.gtag('set', 'user_properties', { user_id: userId, ...properties });
}; 