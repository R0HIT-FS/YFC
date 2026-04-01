"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

// 1. Define Interfaces
interface User {
  _id?: string | null | undefined;
  name?: string | null | undefined;
  groupId?: string | null;
  roomId?: string | null;
}

interface Group {
  _id?: string | null | undefined;
  name?: string | null | undefined;
}

interface GroupCardProps {
  group: Group;
  users: User[];
}

export default function GroupCard({ group, users: initialUsers }: GroupCardProps) {
  const router = useRouter();

  // 2. Type the local state
  const [localUsers, setLocalUsers] = useState<User[]>(initialUsers);

  useEffect(() => {
    setLocalUsers(initialUsers);
  }, [initialUsers]);

  const groupUsers = localUsers.filter((u) => u.groupId === group._id);

  // 3. Type the parameter and handle potential errors
  const removeUser = async (userId: string | null | undefined) => {
    const originalUsers = localUsers;

    setLocalUsers((prev) => prev.filter((u) => u._id !== userId));
    toast.success("Member removed", { position: "bottom-right" });

    try {
      const res = await fetch("/api/remove-from-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      router.refresh(); 
    } catch (err: any) {
      setLocalUsers(originalUsers);
      toast.error(err.message || "Failed to sync with server", { 
        position: "bottom-right" 
      });
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-3">Group: {group.name}</h2>
      <div className="space-y-2">
        {groupUsers.length > 0 ? (
          groupUsers.map((user) => (
            <div key={user._id} className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded-md">
              <span className="text-sm">{user.name}</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
                    Remove
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {user.name}?</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                      This will remove the user from this group immediately.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-zinc-800 text-zinc-100 border-zinc-700">
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
          <p className="text-sm text-zinc-500 italic">No members in this group</p>
        )}
      </div>
    </div>
  );
}