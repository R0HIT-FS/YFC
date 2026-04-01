"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoomHover } from "./RoomHover";
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
import { toast } from "sonner";

// Define the User interface
interface User {
  _id?: string | null | undefined;
  name?: string | null | undefined;
  roomId?: string | null;
  groupId?: string | null;
}

// Define the Room interface
interface Room {
  _id?: string | null | undefined;
  name?: string | null | undefined;
  limit?: number | null | undefined;
}

interface RoomCardProps {
  room: Room;
  users: User[];
}

export default function RoomCard({ room, users: initialUsers }: RoomCardProps) {
  const router = useRouter();
  
  // Local state for instant UI updates
  const [localUsers, setLocalUsers] = useState<User[]>(initialUsers);

  // Sync local state when the page data refreshes
  useEffect(() => {
    setLocalUsers(initialUsers);
  }, [initialUsers]);

  const roomUsers = localUsers.filter((user) => user.roomId === room._id);

  const removeUser = async (userId: string | null | undefined) => {
    const originalUsers = localUsers;

    // 🔥 1. Instant UI Update (Optimistic)
    setLocalUsers((prev) => prev.filter((u) => u._id !== userId));
    toast.success("Member removed", { position: "bottom-right" });

    try {
      const res = await fetch("/api/remove-from-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // 2. Refresh the server data in the background
      router.refresh(); 
    } catch (err: any) {
      // 3. Rollback if something goes wrong
      setLocalUsers(originalUsers);
      toast.error(err.message || "Failed to remove member on server", { 
        position: "bottom-right" 
      });
    }
  };

  const deleteRoom = async () => {
    try {
      const res = await fetch("/api/rooms/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: room._id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Room Deleted", { position: "bottom-right" });
        router.refresh();
      }
    } catch (err) {
      toast.error("Failed to delete room");
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-3">Room : {room.name}</h2>
      <p className="text-xs text-zinc-400 mb-2">
        {roomUsers.length} / {room.limit}
      </p>

      <div className="space-y-2">
        {roomUsers.length > 0 ? (
          roomUsers.map((user) => (
            <div key={user._id} className="flex items-center justify-between text-sm text-zinc-300 bg-zinc-800 px-3 py-2 rounded-md">
              <span>{user.name}</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
                    Remove
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove {user.name}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-500 hover:bg-red-600" 
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
          <p className="text-sm text-zinc-500">No users in this room</p>
        )}
      </div>

      {roomUsers.length === 0 ? (
        <button 
          onClick={deleteRoom} 
          className="mt-4 text-xs text-red-400 hover:text-red-300 cursor-pointer"
        >
          Delete Room
        </button>
      ) : (
        <RoomHover />
      )}
    </div>
  );
}