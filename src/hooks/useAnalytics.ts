import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SystemLogger, LogEventType } from '../lib/monitoring/SystemLogger';

/**
 * Fires a page_view event on every route change.
 * Call once at the AppContent level.
 */
export function usePageViewTracking(userId?: string) {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (path === prevPath.current) return;
    prevPath.current = path;

    SystemLogger.info('page_view', `Page view: ${path}`, userId, { path, search: location.search });

    // Also fire gtag if available (Google Analytics)
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
      (window as unknown as { gtag: Function }).gtag('event', 'page_view', {
        page_path: path,
        page_search: location.search,
      });
    }
  }, [location.pathname, location.search, userId]);
}

/**
 * Returns a `track` function for firing named conversion events.
 */
export function useAnalytics(userId?: string) {
  const track = useCallback(
    (event: LogEventType, message: string, metadata?: Record<string, unknown>) => {
      SystemLogger.info(event, message, userId, metadata);

      // Mirror to gtag if available
      if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
        (window as unknown as { gtag: Function }).gtag('event', event, {
          user_id:  userId,
          ...metadata,
        });
      }
    },
    [userId],
  );

  return { track };
}
