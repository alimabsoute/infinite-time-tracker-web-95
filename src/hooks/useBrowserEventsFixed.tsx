
import { useEffect, useRef } from 'react';

interface EnhancedBrowserEventHandlers {
  onVisibilityChange: (isVisible: boolean) => void;
  onBeforeUnload: () => void;
  onPageHide: () => void;
  onPageShow: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const useBrowserEventsFixed = (handlers: EnhancedBrowserEventHandlers) => {
  const handlersRef = useRef(handlers);
  
  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    // Enhanced Page Visibility API with better handling
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      console.log('🔍 Enhanced visibility changed:', isVisible ? 'visible' : 'hidden');
      handlersRef.current.onVisibilityChange(isVisible);
    };

    // Enhanced before unload with improved reliability
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log('⚠️ Enhanced before unload triggered');
      handlersRef.current.onBeforeUnload();
      // Don't prevent user from leaving, just save state silently
    };

    // Enhanced page hide (more reliable than beforeunload on mobile)
    const handlePageHide = (event: PageTransitionEvent) => {
      console.log('👋 Enhanced page hide triggered', { persisted: event.persisted });
      handlersRef.current.onPageHide();
    };

    // Enhanced page show (when returning to tab)
    const handlePageShow = (event: PageTransitionEvent) => {
      console.log('👁️ Enhanced page show triggered', { persisted: event.persisted });
      handlersRef.current.onPageShow();
    };

    // Enhanced window focus/blur (tab switching) with debouncing
    let focusTimeout: NodeJS.Timeout;
    const handleFocus = () => {
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        console.log('🎯 Enhanced window focus triggered');
        handlersRef.current.onFocus();
      }, 100); // Debounce to avoid rapid fire events
    };

    let blurTimeout: NodeJS.Timeout;
    const handleBlur = () => {
      clearTimeout(blurTimeout);
      blurTimeout = setTimeout(() => {
        console.log('😴 Enhanced window blur triggered');
        handlersRef.current.onBlur();
      }, 100); // Debounce to avoid rapid fire events
    };

    // Add all enhanced event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Enhanced cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      
      // Clear any pending timeouts
      clearTimeout(focusTimeout);
      clearTimeout(blurTimeout);
    };
  }, []);
};
