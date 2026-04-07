"use client";
import React from "react";
import { useState, useEffect } from "react";
import { RoomHover } from "./RoomHover";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Interfaces
interface User {
  _id?: string | null;
  name?: string | null;
  roomId?: string | null;
  groupId?: string | null;
}

interface Room {
  _id?: string | null;
  name?: string | null;
  limit?: number | null;
}

interface RoomCardProps {
  room: Room;
  users: User[];
}

function RoomCard({ room, users: initialUsers }: RoomCardProps) {
  const [localUsers, setLocalUsers] = useState<User[]>(initialUsers);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(room.name || "");
  const [editLimit, setEditLimit] = useState(room.limit || 0);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  // 🔥 Sync ONLY when needed
  useEffect(() => {
    if (initialUsers !== localUsers) {
      setLocalUsers(initialUsers);
    }
  }, [initialUsers]);

  // 🔥 No filtering needed anymore
  const roomUsers = localUsers;

  // 🔥 Optimized remove
  const removeUser = async (userId: string | null | undefined) => {
    if (!userId) return;

    // optimistic update
    setLocalUsers((prev) => prev.filter((u) => u._id !== userId));
    toast.success("Member removed", { position: "bottom-right" });

    try {
      const res = await fetch("/api/remove-from-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member");
    }
  };

  // 🔥 Optimized delete (no refresh)
  const deleteRoom = async () => {
    try {
      const res = await fetch("/api/rooms/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId: room._id }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Failed to delete room");
        return;
      }

      toast.success("Room Deleted", { position: "bottom-right" });
      router.refresh();
    } catch {
      toast.error("An error occurred while deleting the room");
    }
  };

  const updateRoom = async () => {
    if (saving) return;

    if (!editName.trim()) {
      toast.error("Room name required");
      return;
    }

    if (!editLimit || editLimit <= 0) {
      toast.error("Invalid limit");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/rooms/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: room._id,
          name: editName,
          limit: editLimit,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success("Room updated", { position: "bottom-right" });

      setEditOpen(false);

      // 🔥 instant UI update without waiting
      room.name = editName;
      room.limit = editLimit;

      router.refresh(); // keep SSR consistent
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-3 text-zinc-100">
        Room: {room.name}
      </h2>

      <p className="text-xs text-zinc-400 mb-2">
        {roomUsers.length} / {room.limit}
      </p>

      <div className="space-y-2">
        {roomUsers.length > 0 ? (
          roomUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between text-sm text-zinc-300 bg-zinc-800 px-3 py-2 rounded-md"
            >
              <span>{user.name}</span>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-xs text-red-400 hover:text-red-300 cursor-pointer transition-colors">
                    Remove
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove User</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                      Are you sure you want to remove {user.name} from this
                      room?
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-zinc-800 border-zinc-700">
                      Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => removeUser(user._id)}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500 italic">No users in this room</p>
        )}
      </div>

      <div className="mt-6 border-t border-zinc-800 pt-4">
        {roomUsers.length === 0 ? (
          <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="block text-xs text-red-400 hover:text-red-300 cursor-pointer transition-colors">
                Delete Room
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-500">
                  Delete Room
                </AlertDialogTitle>

                <AlertDialogDescription className="text-zinc-400">
                  This action cannot be undone. This will permanently delete the
                  room{" "}
                  <span className="text-zinc-200 font-medium">{room.name}</span>
                  .
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-800 border-zinc-700">
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={deleteRoom}
                >
                  Delete Room
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
          
        ) : (
          <RoomHover />
        )}
        <Dialog>
  <DialogTrigger asChild>
    <button className="block text-xs text-yellow-400 hover:text-yellow-300 cursor-pointer mt-2">
      Edit Room
    </button>
  </DialogTrigger>

  <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none outline-none">
    <DialogHeader>
      <DialogTitle>Edit Room</DialogTitle>
    </DialogHeader>

    <div className="space-y-3 mt-2">
      <p>Room Name:</p>
      <input
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="Room name"
        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-md text-sm"
      />

      <p>Room Limit:</p>
      <input
        type="number"
        value={editLimit}
        onChange={(e) => setEditLimit(Number(e.target.value))}
        placeholder="Limit"
        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-md text-sm"
      />
    </div>

    <DialogFooter className="mt-4">
      <DialogClose asChild>
        <button className="bg-zinc-800 px-4 py-2 rounded-md text-sm cursor-pointer">
          Cancel
        </button>
      </DialogClose>

      <button
        disabled={saving}
        onClick={updateRoom}
        className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-md text-white text-sm cursor-pointer"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      </div>
    </div>
  );
}

// 🔥 Prevent unnecessary re-renders
export default React.memo(RoomCard);
