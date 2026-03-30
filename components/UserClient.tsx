"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function UsersClient({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [rooms, setRooms] = useState({});
  const [groups, setGroups] = useState({});
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("name");

  // 🔥 Fetch rooms + groups
  useEffect(() => {
    const fetchData = async () => {
      const [roomsRes, groupsRes] = await Promise.all([
        fetch("/api/rooms/all"),
        fetch("/api/groups/all"),
      ]);

      const roomsData = await roomsRes.json();
      const groupsData = await groupsRes.json();

      if (roomsData.success) {
        const map = {};
        roomsData.rooms.forEach((r) => (map[r._id] = r.name));
        setRooms(map);
      }

      if (groupsData.success) {
        const map = {};
        groupsData.groups.forEach((g) => (map[g._id] = g.name));
        setGroups(map);
      }
    };

    fetchData();
  }, []);

  // 🔥 Assign Room
  const assignRoom = async (userId, roomId) => {
    const user = users.find((u) => u._id === userId);
    if (user?.roomId === roomId) return;

    setLoadingUserId(userId);

    const res = await fetch("/api/assign-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, roomId }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Room assigned");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, roomId } : u)),
      );
    } else {
      toast.error(data.error);
    }

    setLoadingUserId(null);
  };

  // 🔥 Assign Group
  const assignGroup = async (userId, groupId) => {
    const user = users.find((u) => u._id === userId);
    if (user?.groupId === groupId) return;

    setLoadingUserId(userId);

    const res = await fetch("/api/assign-group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, groupId }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Group assigned");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, groupId } : u)),
      );
    } else {
      toast.error(data.error);
    }

    setLoadingUserId(null);
  };

  // 🔍 Filter
  const processedUsers = useMemo(() => {
    const q = search.toLowerCase();

    let result = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
    );

    switch (mode) {
      // 🔤 Alphabetical
      case "name":
        return [...result].sort((a, b) =>
          (a.name || "").localeCompare(b.name || ""),
        );

      // 🔢 Age
      case "age":
        return [...result].sort((a, b) => (a.age || 0) - (b.age || 0));

      // 🔥 Room OR Group assigned
      case "assigned-any":
        return result.filter((u) => (u.roomId && rooms[u.roomId]) || (u.groupId && groups[u.groupId]));

      // 🔥 Room AND Group assigned
      case "assigned-both":
        return result.filter((u) => (u.roomId && rooms[u.roomId]) && (u.groupId && groups[u.groupId]));

      // ❌ None assigned
      case "unassigned":
        return result.filter((u) => !u.roomId && !u.groupId && !groups[u.groupId]);

      case "male":
        return result.filter((u) => u.gender.toLowerCase() === 'male');

      case "female":
        return result.filter((u) => u.gender.toLowerCase() === 'female');

      default:
        return result;
    }
  }, [users, search, mode]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
      <h1 className="text-3xl font-semibold mb-6">Delegates</h1>

      <p className="text-xs text-zinc-400 mb-2">
        {processedUsers.length} members
      </p>

      {/* 🔍 Search */}
      {/* <input
        type="text"
        placeholder="Search by name, email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none"
      /> */}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* 🔍 Search */}
        <input
          type="text"
          placeholder="Search by name, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none"
        />

        {/* 🔽 Mode Select */}
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none"
        >
          <option value="name">Sort: Name (A–Z)</option>
          <option value="age">Sort: Age</option>
          <option value="assigned-any">Filter: Room OR Group Assigned</option>
          <option value="assigned-both">Filter: Room AND Group Assigned</option>
          <option value="unassigned">Filter: None Assigned</option>
          <option value="male">Filter: Male</option>
          <option value="female">Filter: Female</option>
        </select>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {processedUsers.length > 0 ? (
          processedUsers.map((user) => (
            <div
              key={user._id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <p className="font-medium">
                {user.name},{" "}
                <span className="text-zinc-400">{user.age || "N/A"}</span>
              </p>

              <p className="text-sm text-zinc-400 mt-2">{user.email || '-'}</p>

              {/* Labels */}
              {user.roomId && rooms[user.roomId] && (
                <p className="text-xs mt-3 text-zinc-400">
                  <b>Room:</b> {rooms[user.roomId] || "Unassigned"}
                </p>
              )}

              {user.groupId && groups[user.groupId] && (
                <p className="text-xs text-zinc-400">
                  <b>Group:</b> {groups[user.groupId] || "Unassigned"}
                </p>
              )}

              {/* 🔥 ASSIGN BUTTON */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-sm py-2 rounded-md">
                    Assign Room / Group
                  </button>
                </DialogTrigger>

                {/* <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100"> */}
                <DialogContent
                  className="
    bg-zinc-900 
    border border-zinc-800 
    text-zinc-100 
    outline-none 
    focus:outline-none 
    focus:ring-0 
    focus-visible:ring-0 
    ring-0 
    shadow-none
  "
                >
                  <DialogHeader>
                    <DialogTitle>Assign for {user.name}</DialogTitle>
                  </DialogHeader>

                  {/* ROOM */}
                  <select
                    value={user.roomId || ""}
                    onChange={(e) => assignRoom(user._id, e.target.value)}
                    className="mt-4 w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="">Select Room</option>
                    {Object.entries(rooms).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>

                  {/* GROUP */}
                  <select
                    value={user.groupId || ""}
                    onChange={(e) => assignGroup(user._id, e.target.value)}
                    className="mt-2 w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="">Select Group</option>
                    {Object.entries(groups).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <DialogClose asChild>
                    <button className="bg-zinc-800 px-4 py-2 rounded-md text-sm">
                      Close
                    </button>
                  </DialogClose>
                </DialogContent>
              </Dialog>

              {loadingUserId === user._id && (
                <p className="text-xs text-zinc-500 mt-2">Updating...</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-white text-lg font-semibold">
            No Delegates Found!
          </p>
        )}
      </div>
    </div>
  );
}
