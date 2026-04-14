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

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";


type SyncResponse = {
  success: boolean;
  lastSync: string;
  total?: number;
  inserted?: number;
  updated?: number;
  deleted?: number;
  type?: string;
};

export default function SyncStatus() {
  const prevSyncRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchSync = async () => {
      try {
        const res = await fetch("/api/last-sync");
        const data: SyncResponse = await res.json();

        if (!data.success || !isMounted) return;

        const currentSync = data.lastSync;

        // first run baseline
        if (!prevSyncRef.current) {
          prevSyncRef.current = currentSync;
          return;
        }

        // no change
        if (currentSync === prevSyncRef.current) return;

        // update ref
        prevSyncRef.current = currentSync;

        // build message based on backend meta
        const inserted = data.inserted ?? 0;
        const updated = data.updated ?? 0;
        const deleted = data.deleted ?? 0;

        if (inserted || updated || deleted) {
          const parts: string[] = [];

          if (inserted) parts.push(`${inserted} added`);
          if (updated) parts.push(`${updated} updated`);
          if (deleted) parts.push(`${deleted} removed`);

          toast.success(`Sync completed: ${parts.join(", ")}`);
          router.refresh();
        } else {
          toast.info("Sync completed");
        }
      } catch (err) {
        console.error("SyncStatus error:", err);
      }
    };

    // initial fetch
    fetchSync();

    // polling
    intervalRef.current = setInterval(fetchSync, 5000);

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return null;
}