
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
      console.log('🔍 Visibility changed:', isVisible ? 'visible' : 'hidden');
      handlersRef.current.onVisibilityChange(isVisible);
    };

    // Before unload (page refresh, tab close)
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log('⚠️ Before unload triggered');
      handlersRef.current.onBeforeUnload();
      // Don't prevent the user from leaving, just save state
    };

    // Page hide (more reliable than beforeunload on mobile)
    const handlePageHide = () => {
      console.log('👋 Page hide triggered');
      handlersRef.current.onPageHide();
    };

    // Page show (when returning to tab)
    const handlePageShow = () => {
      console.log('👁️ Page show triggered');
      handlersRef.current.onPageShow();
    };

    // Window focus/blur (tab switching)
    const handleFocus = () => {
      console.log('🎯 Window focus triggered');
      handlersRef.current.onFocus();
    };

    const handleBlur = () => {
      console.log('😴 Window blur triggered');
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
