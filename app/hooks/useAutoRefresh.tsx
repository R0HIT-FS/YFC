"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Custom hook to refresh server data at a set interval
 * @param interval - Refresh rate in milliseconds (default 30s)
 */
export function useAutoRefresh(interval: number = 60000) {
  const router = useRouter();

  useEffect(() => {
    // 1. Set up the interval
    const refreshInterval = setInterval(() => {
      // router.refresh() fetches fresh data from the server 
      // without losing client-side state (like input values)
      router.refresh();
    }, interval);

    // 2. Cleanup: Important to prevent memory leaks and 
    // multiple timers running if the user switches pages.
    return () => clearInterval(refreshInterval);
  }, [router, interval]);
}