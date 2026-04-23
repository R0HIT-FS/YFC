"use client";

import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  age: number;
  churchName: string;
  groupId?: string | null;
  reportedToVenue?: boolean;
  paymentVerified?: boolean;
}

interface Group {
  _id: string;
  name: string;
}

export default function DragAssignPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [removedUsers, setRemovedUsers] = useState<Set<string>>(new Set());
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [groupSearch, setGroupSearch] = useState("");

  const router = useRouter();

  // ✅ FETCH + HYDRATE ASSIGNMENTS
  useEffect(() => {
    const fetchData = async () => {
      const [uRes, gRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/groups/all"),
      ]);

      const uData = await uRes.json();
      const gData = await gRes.json();

      if (uData.success) {
        setUsers(uData.users);

        // 🔥 hydrate assignments from DB
        const initialAssignments: Record<string, string> = {};

        uData.users.forEach((u: User) => {
          if (u.groupId) {
            initialAssignments[u._id] = String(u.groupId);
          }
        });

        setAssignments(initialAssignments);
      }

      if (gData.success) {
        setGroups(gData.groups);
      }
    };

    fetchData();
  }, []);

  // ✅ DRAG
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const userId = String(active.id);
    const groupId = String(over.id);

    setAssignments((prev) => ({
      ...prev,
      [userId]: groupId,
    }));

    // 🔥 if reassigned, remove from removed list
    setRemovedUsers((prev) => {
      const updated = new Set(prev);
      updated.delete(userId);
      return updated;
    });
  };

  // ✅ REMOVE USER
  const removeUser = (userId: string) => {
    setAssignments((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });

    setRemovedUsers((prev) => new Set(prev).add(userId));
  };

  // ✅ SAVE
  const handleSave = async () => {
    const assignedPayload = Object.entries(assignments).map(
      ([userId, groupId]) => ({
        userId,
        groupId,
      }),
    );

    // 🔥 OPTIONAL IMPROVEMENT (skip if reassigned)
    const removedPayload = Array.from(removedUsers)
      .filter((id) => !assignments[id])
      .map((userId) => ({
        userId,
        groupId: null,
      }));

    const payload = [...assignedPayload, ...removedPayload];

    const res = await fetch("/api/drag-assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assignments: payload }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Assignments saved successfully!");
    //   window.location.reload();
    router.refresh();
    }
  };

  // ✅ USERS PANEL (FILTERED)
  const unassignedUsers = users
    .filter(
      (u) =>
        !assignments[u._id] && u.age >= ageRange[0] && u.age <= ageRange[1],
    )
    .sort((a, b) => (a.age || 0) - (b.age || 0));

  const filteredGroups = groups.filter((g) =>
    g.name?.toLowerCase().includes(groupSearch.toLowerCase()),
  );

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="hidden md:block min-h-screen bg-zinc-950 text-white p-10">
        <h1 className="text-3xl font-semibold mb-6">Drag & Assign</h1>

        <button
          onClick={handleSave}
          className="mb-6 bg-green-600 px-4 py-2 rounded cursor-pointer hover:bg-green-700"
        >
          Save Assignments
        </button>

        <div className="grid grid-cols-2 gap-10">
          {/* USERS */}
          <div>
            <h2 className="mb-4">Users ({unassignedUsers.length})</h2>

            {/* SLIDER */}
            <div className="mb-6 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Age Range</span>
                <span>
                  {ageRange[0]} - {ageRange[1]}
                </span>
              </div>

              <Slider
                value={ageRange}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) =>
                  setAgeRange(value as [number, number])
                }
                className="
                [&>.relative]:h-1
    [&>.relative]:bg-zinc-700
    [&>.relative]:rounded-full

    /* Range (active part) */
    [&>.relative>span]:bg-white
    [&>.relative>span]:rounded-full

    /* Thumb */
    [&_[role=slider]]:h-3
    [&_[role=slider]]:w-3
    [&_[role=slider]]:bg-white
    [&_[role=slider]]:border
    [&_[role=slider]]:border-zinc-900
    [&_[role=slider]]:rounded-full
    [&_[role=slider]]:shadow-sm
                "
              />
            </div>

            <div className="grid gap-3">
              {unassignedUsers.map((u) => (
                <UserCard key={u._id} user={u} />
              ))}
            </div>
          </div>

          {/* GROUPS */}
          <div>
            <h2 className="mb-4">Groups ({filteredGroups.length})</h2>

            <input
              type="text"
              placeholder="Search groups..."
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              className="mb-4 w-full max-w-md bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-md text-sm focus:outline-none"
            />

            <div className="grid gap-4">
              {filteredGroups.map((g) => (
                <GroupCard
                  key={g._id}
                  group={g}
                  users={users}
                  assignments={assignments}
                  removeUser={removeUser}
                  ageRange={ageRange}
                />
              ))}
            </div>
          </div>
        </div>


      </div>
    </DndContext>
  );
}

// 🔥 USER CARD
function UserCard({ user }: { user: User }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: String(user._id),
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="bg-zinc-900 p-3 rounded cursor-grab border border-zinc-700"
    >
      <p className="font-medium">{user.name}, <span className="text-zinc-300">{user.age}</span></p>
      <p className="text-xs text-zinc-400">
        {user.churchName} {user.reportedToVenue ? <Badge className="ml-2 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
            Reported
      </Badge> :  <Badge className="ml-2 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
        Not Reported
      </Badge>}
      {user.paymentVerified ? <Badge className="ml-2 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
            Verified
      </Badge> :    <Badge className="ml-2 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
        Not Verified
      </Badge>}
      </p>
    </div>
  );
}

// 🔥 GROUP CARD
function GroupCard({
  group,
  users,
  assignments,
  removeUser,
  ageRange,
}: {
  group: Group;
  users: User[];
  assignments: Record<string, string>;
  removeUser: (userId: string) => void;
  ageRange: [number, number];
}) {
  const { setNodeRef } = useDroppable({
    id: String(group._id),
  });

  const assignedUsers = users.filter(
    (u) => String(assignments[u._id]) === String(group._id),
  );

  return (
    <div
      ref={setNodeRef}
      className="bg-zinc-900 p-4 rounded-lg min-h-[150px] border border-zinc-700"
    >
      <h3 className="font-semibold mb-2">
        {group.name} ({assignedUsers.length})
      </h3>

      {assignedUsers.length === 0 && (
        <p className="text-xs text-zinc-500">Drop users here</p>
      )}

      {assignedUsers.map((u) => {
        const isOutOfRange = u.age < ageRange[0] || u.age > ageRange[1];

        return (
          <div
            key={u._id}
            className={`flex justify-between items-center text-sm px-2 py-1 rounded mt-1 ${
              isOutOfRange
                ? "bg-red-900 text-red-300"
                : "bg-zinc-800 text-zinc-300"
            }`}
          >
            <span>
              {u.name} ({u.age})
            </span>

            <button
              onClick={() => removeUser(u._id)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        );
      })}
    </div>
  );
}
