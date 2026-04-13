// "use client";

// import { useEffect, useState } from "react";
// import { AlertCircleIcon } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// export default function SyncButton() {
//   const [loading, setLoading] = useState(false);
//   const [resetLoading, setResetLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [lastSync, setLastSync] = useState(null);

//   const fetchLastSync = async () => {
//     const res = await fetch("/api/last-sync");
//     const data = await res.json();
//     if (data.success) {
//       setLastSync(data.lastSync);
//     }
//   };

//   const handleSync = async () => {
//     setLoading(true);
//     setMessage("");

//     try {
//       const res = await fetch("/api/sync");
//       const data = await res.json();

//       if (data.success) {
//         setMessage(`✅ Synced ${data.count} records successfully 🚀`);
//         setLastSync(data.lastSync);
//       } else {
//         setMessage(`❌ ${data.error}`);
//       }
//     } catch {
//       setMessage("❌ Error syncing");
//     }

//     setLoading(false);
//   };

//   // 🔥 RESET SYNC
//   const handleReset = async () => {
//     const confirmReset = confirm(
//       "⚠️ This will DELETE all users and re-sync fresh data. Continue?",
//     );

//     if (!confirmReset) return;

//     setResetLoading(true);
//     setMessage("");

//     try {
//       const res = await fetch("/api/sync/reset");
//       const data = await res.json();

//       if (data.success) {
//         setMessage(`🔥 Reset & Synced ${data.count} records`);
//         setLastSync(new Date());
//       } else {
//         setMessage(`❌ ${data.error}`);
//       }
//     } catch {
//       setMessage("❌ Error resetting");
//     }

//     setResetLoading(false);
//   };

//   const handleFlush = async () => {
//     const confirmFlush = confirm(
//       "⚠️ This will DELETE EVERYTHING (users, rooms, groups). Continue?",
//     );

//     if (!confirmFlush) return;

//     setResetLoading(true);
//     setMessage("");

//     try {
//       const res = await fetch("/api/flush-db", {
//         method: "POST",
//       });

//       const data = await res.json();

//       if (data.success) {
//         setMessage("🔥 Database flushed successfully");
//         setLastSync(null);
//       } else {
//         setMessage(`❌ ${data.error}`);
//       }
//     } catch {
//       setMessage("❌ Error flushing DB");
//     }

//     setResetLoading(false);
//   };

//   // 🔁 Auto refresh last sync every 30s
//   useEffect(() => {
//     fetchLastSync();

//     const interval = setInterval(fetchLastSync, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   // 🔁 Auto sync every 5 minutes
//   useEffect(() => {
//     const interval = setInterval(
//       () => {
//         handleSync();
//       },
//       5 * 60 * 1000,
//     );

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="h-screen flex items-center justify-center flex-col gap-5 p-5">
//       {/* 🔥 Buttons */}
//       <div className="flex gap-3">
//         {/* Sync */}
//         <button
//           onClick={handleSync}
//           disabled={loading}
//           className="text-white bg-zinc-600 hover:bg-zinc-500 py-2 px-4 rounded-md text-sm cursor-pointer"
//         >
//           {loading ? "Syncing..." : "Sync Google Sheet"}
//         </button>

//         {/* Reset */}
//         <button
//           onClick={handleReset}
//           disabled={resetLoading}
//           className="text-white bg-yellow-600 hover:bg-yellow-500 py-2 px-4 rounded-md text-sm cursor-pointer"
//         >
//           {resetLoading ? "Resetting..." : "Reset & Sync"}
//         </button>

//         {/* Flush DB */}
//         <button
//           onClick={handleFlush}
//           disabled={resetLoading}
//           className="text-white bg-red-800 hover:bg-red-700 py-2 px-4 rounded-md text-sm cursor-pointer"
//         >
//           {resetLoading ? "Flushing..." : "Flush DB"}
//         </button>
//       </div>

//       {/* Message */}
//       {message && <p className="text-white text-sm">{message}</p>}

//       <Alert
//         variant="destructive"
//         className="max-w-md border-[1px] border-yellow-700"
//       >
//         <AlertCircleIcon color="yellow" />
//         <AlertTitle className="text-yellow-500">Reset & Resync</AlertTitle>
//         <AlertDescription className="text-sm text-yellow-600">
//           Proceed with caution when using the reset and resync button as it will permanently delete all existing user data and replace it with fresh data from the Google Sheet. This action is irreversible, so please ensure you have a backup of any important data before proceeding.
//         </AlertDescription>
//       </Alert>
//       <Alert
//         variant="destructive"
//         className="max-w-md border-[1px] border-yellow-700"
//       >
//         <AlertCircleIcon color="red" />
//         <AlertTitle className="text-red-500">Flush DB</AlertTitle>
//         <AlertDescription className="text-sm text-red-600">
//           Proceed with extreme caution when using the flush database button, as it will permanently delete all data including users, rooms, and groups. This action is irreversible and will result in complete data loss. Please ensure you have a secure backup of all important data before proceeding with this operation.
//         </AlertDescription>
//       </Alert>

//       {/* Last Sync */}
//       <p className="text-zinc-400 text-sm">
//         Last Sync: {lastSync ? new Date(lastSync).toLocaleString() : "Never"}
//       </p>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastSync, setLastSync] = useState<string | Date | null>(null); // ✅ explicit type

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
      const res = await fetch("/api/manual-sync");
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

  const handleReset = async () => {
    const confirmReset = confirm(
      "⚠️ This will DELETE all users and re-sync fresh data. Continue?",
    );

    if (!confirmReset) return;

    setResetLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/sync/reset");
      const data = await res.json();

      if (data.success) {
        setMessage(`🔥 Reset & Synced ${data.count} records`);
        setLastSync(new Date());
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("❌ Error resetting");
    }

    setResetLoading(false);
  };

  const handleFlush = async () => {
    const confirmFlush = confirm(
      "⚠️ This will DELETE EVERYTHING (users, rooms, groups). Continue?",
    );

    if (!confirmFlush) return;

    setResetLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/flush-db", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        setMessage("🔥 Database flushed successfully");
        setLastSync(null);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("❌ Error flushing DB");
    }

    setResetLoading(false);
  };

  useEffect(() => {
    fetchLastSync();
    const interval = setInterval(fetchLastSync, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      handleSync();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex items-center justify-center flex-col gap-5 p-5">
      <div className="w-full flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={handleSync}
          disabled={loading}
          className="text-white bg-zinc-600 hover:bg-zinc-500 py-2 px-4 rounded-md text-sm cursor-pointer"
        >
          {loading ? "Syncing..." : "Sync Google Sheet"}
        </button>

        <button
          onClick={handleReset}
          disabled={resetLoading}
          className="text-white bg-yellow-600 hover:bg-yellow-500 py-2 px-4 rounded-md text-sm cursor-pointer"
        >
          {resetLoading ? "Resetting..." : "Reset & Sync"}
        </button>

        <button
          onClick={handleFlush}
          disabled={resetLoading}
          className="text-white bg-red-800 hover:bg-red-700 py-2 px-4 rounded-md text-sm cursor-pointer"
        >
          {resetLoading ? "Flushing..." : "Flush DB"}
        </button>
      </div>

      {message && <p className="text-white text-sm">{message}</p>}

      <Alert variant="destructive" className="max-w-md border-[1px] border-yellow-700">
        <AlertCircleIcon color="yellow" />
        <AlertTitle className="text-yellow-500">Reset & Resync</AlertTitle>
        <AlertDescription className="text-sm text-yellow-600">
          Proceed with caution when using the reset and resync button as it will permanently delete
          all existing user data and replace it with fresh data from the Google Sheet. This action
          is irreversible, so please ensure you have a backup of any important data before
          proceeding.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive" className="max-w-md border-[1px] border-yellow-700">
        <AlertCircleIcon color="red" />
        <AlertTitle className="text-red-500">Flush DB</AlertTitle>
        <AlertDescription className="text-sm text-red-600">
          Proceed with extreme caution when using the flush database button, as it will permanently
          delete all data including users, rooms, and groups. This action is irreversible and will
          result in complete data loss. Please ensure you have a secure backup of all important data
          before proceeding with this operation.
        </AlertDescription>
      </Alert>
        <button
          className="w-full sm:max-w-md text-white bg-slate-600 hover:bg-slate-500 rounded-md text-sm cursor-pointer"
        >
          <a href="/export" className=" block py-2 px-4">Export Excel</a>
          
        </button>

      <p className="text-zinc-400 text-sm">
        Last Sync: {lastSync ? new Date(lastSync).toLocaleString() : "Never"}
      </p>
    </div>
  );
}