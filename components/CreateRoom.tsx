"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateRoom() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [limit, setLimit] = useState("");

  const router = useRouter();

  const handleCreate = async () => {
    setMessage("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          limit,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Room created", {
        position: 'bottom-right',
        duration: 3000,
      });
        setName("");
        setLimit("");
        router.refresh();
      } else {
                toast.error(`${data.error}`, {
        position: 'bottom-right',
        duration: 3000,
      });
      }
    } catch {
        toast("Error creating room", {
        position: 'bottom-right',
        duration: 3000,
      });
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Room name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: "8px",
          marginRight: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          color: "white",
        }}
      />

      <input
        type="number"
        placeholder="Room limit"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        style={{
          padding: "8px",
          marginRight: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          color: "white",
        }}
      />

      <button
        onClick={handleCreate}
        className="bg-white text-black px-4 py-2 rounded-sm"
      >
        Create Room
      </button>

      {message && <p className="text-white">{message}</p>}
    </div>
  );
}
