"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateGroup() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Group name required", { position: "bottom-right" });
      return;
    }

    try {
      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Group created", { position: "bottom-right" });
        setName("");
        router.refresh(); // Updates the list instantly
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Error creating group");
    }
  };

  return (
    <div className="mb-6 flex gap-3 items-center">
      <input
        type="text"
        placeholder="Group name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
      />
      <button
        onClick={handleCreate}
        className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors"
      >
        Create Group
      </button>
    </div>
  );
}