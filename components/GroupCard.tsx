"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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

// --- Type Definitions ---
interface User {
  _id: string;
  name?: string | null;
  groupId?: string | null;
  roomId?: string | null;
}

interface Group {
  _id: string;
  name?: string | null;
}

interface GroupCardProps {
  group: Group;
  users: User[];
}

export default function GroupCard({ group, users: initialUsers }: GroupCardProps) {
  const router = useRouter();
  
  // Initialize state with a fallback empty array
  const [localUsers, setLocalUsers] = useState<User[]>(initialUsers || []);

  useEffect(() => {
    setLocalUsers(initialUsers || []);
  }, [initialUsers]);

  /**
   * PERFORMANCE: useMemo prevents re-filtering the entire user list 
   * unless localUsers or the group ID actually changes.
   */
  const groupUsers = useMemo(() => {
    return localUsers.filter((u) => u.groupId === group._id);
  }, [localUsers, group._id]);

  /**
   * PERFORMANCE: useCallback memoizes the function reference, 
   * preventing child component re-renders if this were passed down.
   */
  const removeUser = useCallback(async (userId: string) => {
    const originalUsers = localUsers;

    // Optimistic UI Update
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
      toast.error(err.message || "Failed to sync with server");
    }
  }, [localUsers, router]);

  const deleteGroup = useCallback(async () => {
    try {
      const res = await fetch("/api/groups/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: group._id }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Group Deleted", { position: "bottom-right" });
        router.refresh();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to delete group");
    }
  }, [group._id, router]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-3 text-zinc-100">
        Group: {group?.name ?? "Unnamed"}
      </h2>
      
      <div className="space-y-2">
        {groupUsers.length > 0 ? (
          groupUsers.map((user) => (
            <div key={user._id} className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded-md">
              <span className="text-sm text-zinc-300">{user?.name ?? "Anonymous"}</span>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
                    Remove
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove User</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                      Are you sure you want to remove {user?.name ?? "this user"}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300">
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

      {groupUsers.length === 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="text-xs text-red-400 hover:text-red-300 cursor-pointer transition-colors">
                Delete Group
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-500">Delete Group</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  This action cannot be undone. This will permanently delete{" "}
                  <span className="text-zinc-200 font-medium">{group?.name ?? "this group"}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-600 hover:bg-red-700 text-white" 
                  onClick={deleteGroup}
                >
                  Delete Group
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}