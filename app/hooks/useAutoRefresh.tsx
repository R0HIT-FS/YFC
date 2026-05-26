// "use client";

// import { useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";

// /**
//  * Smart auto refresh hook (production optimized)
//  */
// export function useAutoRefresh(interval: number = 60000) {
//   const router = useRouter();
//   const idleRef = useRef(true);

//   useEffect(() => {
//     let timer: NodeJS.Timeout;

//     // 🔥 Track user activity
//     const markActive = () => {
//       idleRef.current = false;

//       // user becomes idle again after 5s
//       setTimeout(() => {
//         idleRef.current = true;
//       }, 5000);
//     };

//     window.addEventListener("mousemove", markActive);
//     window.addEventListener("keydown", markActive);

//     // 🔥 Smart interval
//     timer = setInterval(() => {
//       // ✅ Only refresh when:
//       // 1. Tab is visible
//       // 2. User is idle
//       if (!document.hidden && idleRef.current) {
//         router.refresh();
//       }
//     }, interval);

//     return () => {
//       clearInterval(timer);
//       window.removeEventListener("mousemove", markActive);
//       window.removeEventListener("keydown", markActive);
//     };
//   }, [router, interval]);
// }



"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Smart auto refresh hook (production optimized)
 */
export function useAutoRefresh(interval: number = 60000) {
  const router = useRouter();

  const idleRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    // 🔥 Track user activity
    const markActive = () => {
      idleRef.current = false;

      // clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // user becomes idle again after 5s
      timeoutRef.current = setTimeout(() => {
        idleRef.current = true;
      }, 5000);
    };

    window.addEventListener("mousemove", markActive);
    window.addEventListener("keydown", markActive);

    // 🔥 Smart interval
    timer = setInterval(() => {
      const dialogOpen = (window as any).__ROOM_DIALOG_OPEN__;

      // ✅ Only refresh when:
      // 1. Tab visible
      // 2. User idle
      // 3. Dialog NOT open
      if (
        !document.hidden &&
        idleRef.current &&
        !dialogOpen
      ) {
        router.refresh();
      }
    }, interval);

    return () => {
      clearInterval(timer);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      window.removeEventListener("mousemove", markActive);
      window.removeEventListener("keydown", markActive);
    };
  }, [router, interval]);
}