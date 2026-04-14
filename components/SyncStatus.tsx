// "use client";

// import { useEffect, useState } from "react";
// import { toast } from "sonner";

// type SyncResponse = {
//   success: boolean;
//   lastSync: string;
//   added: number;
// };

// export default function SyncStatus() {
//   const [lastSync, setLastSync] = useState<string | null>(null);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchSync = async () => {
//       try {
//         const res = await fetch("/api/last-sync");
//         const data: SyncResponse = await res.json();

//         if (!data.success || !isMounted) return;

//         // first run → just store baseline
//         if (!lastSync) {
//           setLastSync(data.lastSync);
//           return;
//         }

//         // detect change
//         if (data.lastSync !== lastSync) {
//           setLastSync(data.lastSync);

//           if (data.added > 0) {
//             toast.success(`${data.added} new users added`);
//           } else {
//             toast.info("Auto Syncing");
//           }
//         }
//       } catch (err) {
//         console.error("SyncStatus error:", err);
//       }
//     };

//     fetchSync();
//     const interval = setInterval(fetchSync, 60000);

//     return () => {
//       isMounted = false;
//       clearInterval(interval);
//     };
//   }, [lastSync]);

//   return null;
// }


"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type SyncResponse = {
  success: boolean;
  lastSync: string;
  added: number;
};

export default function SyncStatus() {
  const prevSyncRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSync = async () => {
      try {
        const res = await fetch("/api/last-sync");
        const data: SyncResponse = await res.json();

        if (!data.success || !isMounted) return;

        // first run
        if (!prevSyncRef.current) {
          prevSyncRef.current = data.lastSync;
          return;
        }

        // detect change
        if (data.lastSync !== prevSyncRef.current) {
          prevSyncRef.current = data.lastSync;

          if (data.added > 0) {
            toast.success(`${data.added} new ${data.added > 1 ? 'users' : 'user' } added`);
          } else {
            toast.info("Auto Syncing Data"); // 🔥 optional
          }
        }
      } catch (err) {
        console.error("SyncStatus error:", err);
      }
    };

    fetchSync();
    const interval = setInterval(fetchSync, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return null;
}