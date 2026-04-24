"use client";

import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
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
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set(),
  );
  const [groupAgeRange, setGroupAgeRange] = useState<[number, number]>([
    0, 100,
  ]);

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);

      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }

      return next;
    });
  };

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

  const visibleGroups = groups
    .filter((g) => g.name?.toLowerCase().includes(groupSearch.toLowerCase()))
    .filter((group) => {
      const groupUsers = users.filter((u) => assignments[u._id] === group._id);

      if (groupUsers.length === 0) return true;

      return groupUsers.some(
        (u) => u.age >= groupAgeRange[0] && u.age <= groupAgeRange[1],
      );
    });

  const handleAutoAssign = () => {
    const targetGroups = groups.filter((g) => selectedGroupIds.has(g._id));

    if (!targetGroups.length) {
      toast.error("Please select at least one group");
      return;
    }

    const nextAssignments = { ...assignments };

    const churchesByGroup: Record<string, Set<string>> = {};
    const groupCounts: Record<string, number> = {};

    targetGroups.forEach((group) => {
      churchesByGroup[group._id] = new Set();
      groupCounts[group._id] = 0;
    });

    // Seed with existing assignments
    users.forEach((user) => {
      const assignedGroupId = nextAssignments[user._id];

      if (assignedGroupId && churchesByGroup[assignedGroupId]) {
        churchesByGroup[assignedGroupId].add(user.churchName);
        groupCounts[assignedGroupId] += 1;
      }
    });

    // Only assign currently unassigned users in selected age range
    const eligibleUsers = users
      .filter(
        (u) =>
          !nextAssignments[u._id] &&
          u.age >= ageRange[0] &&
          u.age <= ageRange[1],
      )
      .sort((a, b) => a.age - b.age);

    for (const user of eligibleUsers) {
      // Prefer groups without the same church, sorted by smallest size
      const sortedGroups = [...targetGroups].sort(
        (a, b) => groupCounts[a._id] - groupCounts[b._id],
      );

      let selectedGroup = sortedGroups.find(
        (group) => !churchesByGroup[group._id].has(user.churchName),
      );

      // If every group already has that church, assign to smallest group
      if (!selectedGroup) {
        selectedGroup = sortedGroups[0];
      }

      nextAssignments[user._id] = selectedGroup._id;
      churchesByGroup[selectedGroup._id].add(user.churchName);
      groupCounts[selectedGroup._id] += 1;
    }

    setAssignments(nextAssignments);
    toast.success("Users auto-assigned successfully!");
    // setGroupView('all');
  };

  const selectAllFilteredGroups = () => {
    setSelectedGroupIds(new Set(visibleGroups.map((g) => g._id)));
  };

  const clearSelectedGroups = () => {
    setSelectedGroupIds(new Set());
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="hidden md:block min-h-screen bg-zinc-950 text-white p-10">
        <h1 className="text-3xl font-semibold mb-6">Drag & Assign</h1>

        <button
          onClick={handleSave}
          className="mb-6 bg-white text-black px-4 py-2 rounded cursor-pointer hover:bg-zinc-100"
        >
          Save Assignments
        </button>

        <button
          onClick={handleAutoAssign}
          className="ml-3 mb-6 mr-3 bg-zinc-600 px-4 py-2 rounded cursor-pointer hover:bg-zinc-700"
        >
          Auto Assign
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
            <h2 className="mb-4">Groups ({visibleGroups.length})</h2>

            <input
              type="text"
              placeholder="Search groups..."
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              className="mb-4 w-full max-w-md bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-md text-sm focus:outline-none"
            />

            <div className="flex items-start justify-start gap-2">
              <div className="mb-6 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Group Age Filter</span>
                  <span>
                    {groupAgeRange[0]} - {groupAgeRange[1]}
                  </span>
                </div>

                <Slider
                  value={groupAgeRange}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) =>
                    setGroupAgeRange(value as [number, number])
                  }
                  className="
      [&>.relative]:h-1
      [&>.relative]:bg-zinc-700
      [&>.relative]:rounded-full
      [&>.relative>span]:bg-white
      [&>.relative>span]:rounded-full
      [&_[role=slider]]:h-3
      [&_[role=slider]]:w-3
      [&_[role=slider]]:bg-white
      [&_[role=slider]]:border
      [&_[role=slider]]:border-zinc-900
      [&_[role=slider]]:rounded-full
    "
                />
              </div>
            </div>

            <button
              className="px-2 py-1 rounded-xl bg-zinc-500 text-white text-xs mr-3 mb-3 cursor-pointer hover:bg-zinc-600"
              onClick={() =>
                setSelectedGroupIds(new Set(visibleGroups.map((g) => g._id)))
              }
            >
              Select Visible
            </button>

            <button
              className="px-2 py-1 rounded-xl bg-zinc-600 text-white text-xs mr-3 mb-3 cursor-pointer hover:bg-zinc-500"
              onClick={() => setSelectedGroupIds(new Set())}
            >
              Clear Selection
            </button>

            <div className="grid gap-4">
              {visibleGroups.map((g) => (
                <GroupCard
                  key={g._id}
                  group={g}
                  users={users}
                  assignments={assignments}
                  removeUser={removeUser}
                  ageRange={ageRange}
                  isSelected={selectedGroupIds.has(g._id)}
                  onToggleSelect={toggleGroupSelection}
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
      <p className="font-medium">
        {user.name}, <span className="text-zinc-300">{user.age}</span>
      </p>
      <p className="text-xs text-zinc-400">
        {user.churchName}{" "}
        {user.reportedToVenue ? (
          <Badge className="ml-2 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
            Reported
          </Badge>
        ) : (
          <Badge className="ml-2 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
            Not Reported
          </Badge>
        )}
        {user.paymentVerified ? (
          <Badge className="ml-2 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
            Verified
          </Badge>
        ) : (
          <Badge className="ml-2 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
            Not Verified
          </Badge>
        )}
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
  isSelected,
  onToggleSelect,
}: {
  group: Group;
  users: User[];
  assignments: Record<string, string>;
  removeUser: (userId: string) => void;
  ageRange: [number, number];
  isSelected?: boolean;
  onToggleSelect: (groupId: string) => void;
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
      {/* <h3 className="font-semibold mb-2">
        {group.name} ({assignedUsers.length})
      </h3> */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">
          {group.name} ({assignedUsers.length})
        </h3>

        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(group._id)}
          className="h-4 w-4 accent-green-300"
        />
      </div>

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
              {u.name} ({u.age}) - {u.churchName}
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
