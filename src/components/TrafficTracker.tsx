'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'react-router-dom';
import { logVisitAction } from '@/app/actions/traffic';

/**
 * Invisible component that tracks site visits.
 * Mounted in root layout to monitor all organic traffic.
 */
export function TrafficTracker() {
  const pathname = useLocation().pathname;
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Prevent double tracking of the same path in one session unless changed
    if (pathname === lastTrackedPath.current) return;
    
    // Ignore admin and internal paths from organic traffic stats
    if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/r/')) {
      return;
    }

    const timer = setTimeout(() => {
      logVisitAction(pathname);
      lastTrackedPath.current = pathname;
    }, 1000); // Small delay to ensure page load

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
