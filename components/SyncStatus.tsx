"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SyncStatus() {
  const [data, setData] = useState<any>(null);
  const [prevAdded, setPrevAdded] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch("/api/sync-status");
      const json = await res.json();

      if (json.success) {
        setData(json);

        // 🔥 Show toast only when new users added
        if (json.added > 0 && json.added !== prevAdded) {
          toast.success(`${json.added} new users added`);
          setPrevAdded(json.added);
        }
      }
    };

    fetchStatus();

    const interval = setInterval(fetchStatus, 60000); // 1 min

    return () => clearInterval(interval);
  }, [prevAdded]);

  if (!data) return null;

  return (
    <div className="text-xs text-zinc-400">
      <p>
        Last Sync:{" "}
        {data.lastSync
          ? new Date(data.lastSync).toLocaleTimeString()
          : "Never"}
      </p>

      {data.added > 0 && (
        <p className="text-green-400">
          +{data.added} new users added
        </p>
      )}
    </div>
  );
}