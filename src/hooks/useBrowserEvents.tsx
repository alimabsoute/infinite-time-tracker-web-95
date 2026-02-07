
import { useEffect, useRef } from 'react';

interface BrowserEventHandlers {
  onVisibilityChange: (isVisible: boolean) => void;
  onBeforeUnload: () => void;
  onPageHide: () => void;
  onPageShow: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const useBrowserEvents = (handlers: BrowserEventHandlers) => {
  const handlersRef = useRef(handlers);
  
  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    // Page Visibility API
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      handlersRef.current.onVisibilityChange(isVisible);
    };

    // Before unload (page refresh, tab close)
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      handlersRef.current.onBeforeUnload();
      // Don't prevent the user from leaving, just save state
    };

    // Page hide (more reliable than beforeunload on mobile)
    const handlePageHide = () => {
      handlersRef.current.onPageHide();
    };

    // Page show (when returning to tab)
    const handlePageShow = () => {
      handlersRef.current.onPageShow();
    };

    // Window focus/blur (tab switching)
    const handleFocus = () => {
      handlersRef.current.onFocus();
    };

    const handleBlur = () => {
      handlersRef.current.onBlur();
    };

    // Add all event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);
};
