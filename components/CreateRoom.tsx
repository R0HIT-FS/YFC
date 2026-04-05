// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { toast } from "sonner";

// export default function CreateRoom() {
//   const [name, setName] = useState("");
//   const [message, setMessage] = useState("");
//   const [limit, setLimit] = useState("");

//   const router = useRouter();

//   const handleCreate = async () => {
//     setMessage("");

//     try {
//       const res = await fetch("/api/rooms", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name,
//           limit,
//         }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         toast.success("Room created", {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//         setName("");
//         setLimit("");
//         router.refresh();
//       } else {
//                 toast.error(`${data.error}`, {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//       }
//     } catch {
//         toast("Error creating room", {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//     }
//   };

//   return (
//     <div style={{ marginBottom: "20px" }} className="flex flex-col md:flex-row gap-3 items-center">
//       <input
//         type="text"
//         placeholder="Room name"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         style={{
//           padding: "8px",
//           borderRadius: "6px",
//           border: "1px solid #ccc",
//           color: "white",
//         }}
//         className="w-full md:w-max"
//       />

//       <input
//         type="number"
//         placeholder="Room limit"
//         value={limit}
//         onChange={(e) => setLimit(e.target.value)}
//         style={{
//           padding: "8px",
//           borderRadius: "6px",
//           border: "1px solid #ccc",
//           color: "white",
//         }}
//         className="w-full md:w-max"
//       />

//       <button
//         onClick={handleCreate}
//         className="w-full md:w-max bg-white text-black px-4 py-2 rounded-sm"
//       >
//         Create Room
//       </button>

//       {message && <p className="text-white">{message}</p>}
//     </div>
//   );
// }



"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export default function CreateRoom() {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);

  const handleCreate = useCallback(async () => {
    // 🔥 Prevent spam clicks
    if (loading) return;

    const trimmedName = name.trim();
    const parsedLimit = Number(limit);

    // 🔥 Validation (cheap but important)
    if (!trimmedName) {
      toast.error("Room name is required", { position: "bottom-right" });
      return;
    }

    if (!parsedLimit || parsedLimit <= 0) {
      toast.error("Enter a valid room limit", { position: "bottom-right" });
      return;
    }

    setLoading(true);

    // 🔥 Cancel any previous request (rare but powerful)
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          limit: parsedLimit,
        }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Room created", {
          position: "bottom-right",
          duration: 3000,
        });

        // 🔥 Reset state
        setName("");
        setLimit("");

        // 🔥 Fast UI update
        router.refresh();
      } else {
        toast.error(data.error || "Failed to create room", {
          position: "bottom-right",
          duration: 3000,
        });
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Error creating room", {
          position: "bottom-right",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [name, limit, loading, router]);

  return (
    <div
      style={{ marginBottom: "20px" }}
      className="flex flex-col md:flex-row gap-3 items-center"
    >
      <input
        type="text"
        placeholder="Room name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full md:w-max px-2 py-2 rounded-md border border-zinc-700 bg-zinc-900 text-white focus:outline-none"
      />

      <input
        type="number"
        placeholder="Room limit"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        className="w-full md:w-max px-2 py-2 rounded-md border border-zinc-700 bg-zinc-900 text-white focus:outline-none"
      />

      <button
        onClick={handleCreate}
        disabled={loading}
        className={`w-full md:w-max px-4 py-2 rounded-sm transition ${
          loading
            ? "bg-zinc-500 cursor-not-allowed"
            : "bg-white text-black hover:bg-zinc-200"
        }`}
      >
        {loading ? "Creating..." : "Create Room"}
      </button>
    </div>
  );
}