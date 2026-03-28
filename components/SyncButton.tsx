"use client";

import { useEffect, useState } from "react";

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastSync, setLastSync] = useState(null);

  const fetchLastSync = async () => {
    const res = await fetch("/api/last-sync");
    const data = await res.json();
    if (data.success) {
      setLastSync(data.lastSync);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/sync");
      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Synced ${data.count} records successfully 🚀`);
        setLastSync(data.lastSync);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("❌ Error syncing");
    }

    setLoading(false);
  };

  // 🔁 Auto refresh last sync every 30s
  useEffect(() => {
    fetchLastSync();

    const interval = setInterval(fetchLastSync, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🔁 Auto sync every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleSync();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px" }} className="h-screen flex items-center justify-center flex-col gap-[20px]">
      <button onClick={handleSync} disabled={loading} className="text-white bg-zinc-500 py-1 px-2 rounded-sm">
        {loading ? "Syncing..." : "Sync Google Sheet"}
      </button>

      {message && <p className="text-white">{message}</p>}

      <p style={{ marginTop: "10px" }} className="text-zinc-400">
        Last Sync:{" "}
        {lastSync
          ? new Date(lastSync).toLocaleString()
          : "Never"}
      </p>
    </div>
  );
}