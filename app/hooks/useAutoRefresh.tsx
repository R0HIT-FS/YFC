"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Smart auto refresh hook (production optimized)
 */
export function useAutoRefresh(interval: number = 60000) {
  const router = useRouter();
  const idleRef = useRef(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    // 🔥 Track user activity
    const markActive = () => {
      idleRef.current = false;

      // user becomes idle again after 5s
      setTimeout(() => {
        idleRef.current = true;
      }, 5000);
    };

    window.addEventListener("mousemove", markActive);
    window.addEventListener("keydown", markActive);

    // 🔥 Smart interval
    timer = setInterval(() => {
      // ✅ Only refresh when:
      // 1. Tab is visible
      // 2. User is idle
      if (!document.hidden && idleRef.current) {
        router.refresh();
      }
    }, interval);

    return () => {
      clearInterval(timer);
      window.removeEventListener("mousemove", markActive);
      window.removeEventListener("keydown", markActive);
    };
  }, [router, interval]);
}