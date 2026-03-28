"use client";

import { useState } from "react";

export default function CreateRoom() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
    setMessage("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Room created");
        setName("");
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("❌ Error creating room");
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Enter room name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: "8px",
          marginRight: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          color: "gray",
        }}
      />

      <button onClick={handleCreate} className="bg-green-500 text-white px-4 py-2 rounded-sm">
        Create Room
      </button>

      {message && <p className="text-white">{message}</p>}
    </div>
  );
}