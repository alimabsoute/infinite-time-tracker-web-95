
// Analytics utility for tracking user interactions
// Add your Google Analytics tracking ID to enable analytics

export const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || '';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    // Google Analytics will be loaded via gtag script in index.html
    console.log('Analytics initialized');
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: path,
    });
  }
};

// Track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track timer events specifically
export const trackTimerEvent = (action: 'start' | 'stop' | 'pause' | 'reset' | 'create', timerName?: string) => {
  trackEvent(action, 'timer', timerName);
};

// Track user engagement
export const trackEngagement = (event: 'signup' | 'login' | 'upgrade' | 'feature_use') => {
  trackEvent(event, 'engagement');
};
