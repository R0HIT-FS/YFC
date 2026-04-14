"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Maximize2,
  RotateCw,
  SlidersHorizontal,
} from "lucide-react";
import React from "react";
import RefreshHandler from "./RefreshHandler";
import SyncStatus from "./SyncStatus";

interface User {
  _id: string;
  name: string;
  age: number | null;
  email: string;
  gender: string;
  phone?: string | number;
  churchName: string;
  paymentStatus?: string | number;
  transactionId?: string | number;
  paymentDate?: string | number;
  roomId: string | null;
  groupId: string | null;
  reportedToVenue?: boolean;
}

interface UserCardProps {
  user: User;
  rooms: Record<string, string>;
  groups: Record<string, string>;
  roomOptions: React.ReactNode;
  groupOptions: React.ReactNode;
  assignRoom: (userId: string, roomId: string) => Promise<void>;
  assignGroup: (userId: string, groupId: string) => Promise<void>;
  loadingUserId: string | null;
  toggleReported: (userId: string, reported: boolean) => void;
}

interface UsersClientProps {
  users: User[];
}

// 🔥 Memoized User Card
const UserCard = React.memo(function UserCard({
  user,
  rooms,
  groups,
  roomOptions,
  groupOptions,
  assignRoom,
  assignGroup,
  loadingUserId,
  toggleReported,
}: UserCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
        {user.name?.charAt(0)?.toUpperCase() || "U"}
      </div>

      <p className="font-medium">
        {user.name}, <span className="text-zinc-400">{user.age || "N/A"}</span>
      </p>

      <p className="text-sm text-zinc-400 mt-2">{user.churchName || "-"}</p>

      {user.roomId && rooms[user.roomId] && (
        <p className="text-xs mt-3 text-zinc-400">
          <b>Room:</b> {rooms[user.roomId]}
        </p>
      )}

      {user.groupId && groups[user.groupId] && (
        <p className="text-xs mt-2 text-zinc-400">
          <b>Group:</b> {groups[user.groupId]}
        </p>
      )}

      {user.reportedToVenue && (
        <p className="text-xs mt-2 text-zinc-400">
          <b>Reported To Venue:</b> Yes
        </p>
      )}

      {/* <Dialog>
        <DialogTrigger asChild>
          <button className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-sm py-2 rounded-md">
            Assign Room / Group
          </button>
        </DialogTrigger>

        <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 shadow-none">
          <DialogHeader>
            <DialogTitle>Assign for {user.name}</DialogTitle>
          </DialogHeader>

          <select
            value={user.roomId || ""}
            onChange={(e) => assignRoom(user._id, e.target.value)}
            className="mt-4 w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none"
          >
            <option value="">Select Room</option>
            {roomOptions}
          </select>

          <select
            value={user.groupId || ""}
            onChange={(e) => assignGroup(user._id, e.target.value)}
            className="mt-2 w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none"
          >
            <option value="">Select Group</option>
            {groupOptions}
          </select>

          <DialogClose asChild>
            <button className="bg-zinc-800 px-4 py-2 rounded-md text-sm">
              Close
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog> */}

      <Dialog>
        <DialogTrigger asChild>
          <button className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-sm py-2 rounded-md">
            Assign Room / Group
          </button>
        </DialogTrigger>

        <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none outline-none focus:ring-0 focus-visible:ring-0 ring-0 shadow-none">
          <DialogHeader>
            <DialogTitle>Assign for {user.name}</DialogTitle>
          </DialogHeader>

          {/* Room */}
          <p>Room :</p>
          <select
            value={user.roomId || ""}
            onChange={(e) => assignRoom(user._id, e.target.value)}
            className="mt-0 w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Select Room</option>
            {roomOptions}
          </select>

          {/* Group */}
          <p>Group :</p>
          <select
            value={user.groupId || ""}
            onChange={(e) => assignGroup(user._id, e.target.value)}
            className="mt-0 w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Select Group</option>
            {groupOptions}
          </select>

          {/* ✅ Report Toggle */}
          <div className="mt-4 flex items-center justify-between border border-zinc-800 rounded-md px-3 py-2">
            <span className="text-sm text-zinc-300">Reported to Venue</span>

            <button
              onClick={() => toggleReported(user._id, !user.reportedToVenue)}
              className={`px-3 py-1 rounded-md text-xs transition ${
                user.reportedToVenue
                  ? "bg-green-700 hover:bg-green-600 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              }`}
            >
              {user.reportedToVenue ? "Reported" : "Mark"}
            </button>
          </div>

          <DialogClose asChild>
            <button className="mt-4 bg-zinc-800 px-4 py-2 rounded-md text-sm">
              Close
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {loadingUserId === user._id && (
        <p className="text-xs text-zinc-500 mt-2">Updating...</p>
      )}

      <div className="absolute top-3 right-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <Maximize2 size={16} />
            </Button>
          </DialogTrigger>

          <DialogContent className="content-dialog bg-zinc-900 border-zinc-800 text-zinc-100 shadow-none outline-none focus:ring-0 focus-visible:ring-0 focus:outline-none [&>button:last-child]:text-zinc-400 [&>button:last-child]:hover:text-zinc-100 [&>button:last-child]:hover:bg-zinc-800 [&>button:last-child]:border-0 [&>button:last-child]:ring-0 [&>button:last-child]:outline-none shadow-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-[1px] border-zinc-800">
            <DialogHeader>
              <DialogTitle>Info Card</DialogTitle>
              <DialogDescription>Details of the delegate.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
                {[
                  { label: "Name", value: user.name },
                  { label: "Email", value: user.email },
                  { label: "Age", value: user.age },
                  { label: "Gender", value: user.gender },
                  { label: "Phone", value: user.phone },
                  { label: "Church", value: user.churchName },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between px-4 py-2 text-sm"
                  >
                    <span className="text-zinc-400">{label}</span>
                    <span
                      className="text-zinc-100"
                      onClick={() => {
                        navigator.clipboard.writeText(String(value));
                        toast.success("Copied to Clipboard");
                      }}
                    >
                      {value || "-"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
                {[
                  { label: "Payment Status", value: user.paymentStatus },
                  { label: "Transaction ID", value: user.transactionId },
                  { label: "Payment Date", value: user.paymentDate },
                ].map(({ label, value }) => {
                  const isStatus = label === "Payment Status";

                  return (
                    <div
                      key={label}
                      className="flex justify-between px-4 py-2 text-sm"
                    >
                      <span className="text-zinc-400">{label}</span>

                      <span
                        onClick={() => {
                          navigator.clipboard.writeText(String(value));
                          toast.success("Copied to Clipboard");
                        }}
                        className={
                          isStatus
                            ? value === "Yes"
                              ? "text-green-500"
                              : "text-red-500"
                            : "text-zinc-100"
                        }
                      >
                        {value || "-"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
                {[
                  {
                    label: "Room",
                    value: user.roomId ? rooms[user.roomId] : null,
                  },
                  {
                    label: "Group",
                    value: user.groupId ? groups[user.groupId] : null,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between px-4 py-2 text-sm"
                  >
                    <span className="text-zinc-400">{label}</span>
                    <span
                      onClick={() => {
                        navigator.clipboard.writeText(String(value));
                        toast.success("Copied to Clipboard");
                      }}
                    >
                      {value || "Unassigned"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
});

// 🔥 MAIN COMPONENT
export default function UsersClient({ users: initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [rooms, setRooms] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<Record<string, string>>({});
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mode, setMode] = useState("name");
  const [lastSync, setLastSync] = useState(new Date().toISOString());
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [modes, setModes] = useState<string[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const toggleMode = (mode: string) => {
    setModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const fetchData = async () => {
      const [roomsRes, groupsRes] = await Promise.all([
        fetch("/api/rooms/all"),
        fetch("/api/groups/all"),
      ]);

      const roomsData = await roomsRes.json();
      const groupsData = await groupsRes.json();

      if (roomsData.success) {
        const map: Record<string, string> = {};
        roomsData.rooms.forEach(
          (r: { _id: string; name: string }) => (map[r._id] = r.name),
        );
        setRooms(map);
      }

      if (groupsData.success) {
        const map: Record<string, string> = {};
        groupsData.groups.forEach(
          (g: { _id: string; name: string }) => (map[g._id] = g.name),
        );
        setGroups(map);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let lastSyncRef = new Date().toISOString();
    // let lastSyncRef = "";

    const poll = async () => {
      if (document.hidden) return;

      try {
        const res = await fetch(`/api/users/updates?lastSync=${lastSyncRef}`);
        const data = await res.json();

        if (!data.success || !data.users.length) return;

        setUsers((prev) => {
          const map = new Map(prev.map((u) => [u._id, u]));

          // data.users.forEach((updated: any) => {
          //   const existing = map.get(updated._id);

          //   if (existing) {
          //     map.set(updated._id, {
          //       ...existing,
          //       ...updated, // 🔥 merge only changed fields
          //     });
          //   }

          // });

          data.users.forEach((updated: any) => {
            const existing = map.get(updated._id);

            if (existing) {
              // ✅ update existing
              map.set(updated._id, {
                ...existing,
                ...updated,
              });
            } else {
              // 🔥 ADD NEW USER
              map.set(updated._id, updated);
            }
          });

          return Array.from(map.values());
        });

        lastSyncRef = new Date().toISOString();
      } catch (err) {
        console.error(err);
      }
    };

    const interval = setInterval(poll, 5000);

    return () => clearInterval(interval);
  }, []);

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((u) => map.set(u._id, u));
    return map;
  }, [users]);

  // const assignRoom = useCallback(
  //   async (userId: string, roomId: string) => {
  //     const user = userMap.get(userId);
  //     if (user?.roomId === roomId) return;

  //     setLoadingUserId(userId);

  //     const res = await fetch("/api/assign-room", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ userId, roomId }),
  //     });

  //     const data = await res.json();

  //     if (data.success) {
  //       toast.success("Room assigned");
  //       setUsers((prev) =>
  //         prev.map((u) => (u._id === userId ? { ...u, roomId } : u)),
  //       );
  //     } else {
  //       toast.error(data.error); // 🔥 THIS WAS MISSING
  //     }

  //     setLoadingUserId(null);
  //   },
  //   [userMap],
  // );

  const assignRoom = useCallback(
    async (userId: string, roomId: string) => {
      const user = userMap.get(userId);
      if (user?.roomId === roomId) return;

      setLoadingUserId(userId);

      try {
        const res = await fetch("/api/assign-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, roomId }),
        });

        const data = await res.json();

        if (!data.success) {
          toast.error(data.error);
          return;
        }

        // 🔥 optimistic update ONLY if needed
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId && u.roomId !== roomId ? { ...u, roomId } : u,
          ),
        );

        toast.success("Room assigned");
        // router.refresh();
      } catch {
        toast.error("Something went wrong");
      } finally {
        setLoadingUserId(null);
      }
    },
    [userMap],
  );

  // const assignGroup = useCallback(
  //   async (userId: string, groupId: string) => {
  //     const user = userMap.get(userId);
  //     if (user?.groupId === groupId) return;

  //     setLoadingUserId(userId);

  //     const res = await fetch("/api/assign-group", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ userId, groupId }),
  //     });

  //     const data = await res.json();

  //     if (data.success) {
  //       toast.success("Group assigned");
  //       setUsers((prev) =>
  //         prev.map((u) => (u._id === userId ? { ...u, groupId } : u)),
  //       );
  //     } else {
  //       toast.error(data.error);
  //     }

  //     setLoadingUserId(null);
  //   },
  //   [userMap],
  // );

  const assignGroup = useCallback(
    async (userId: string, groupId: string) => {
      const user = userMap.get(userId);
      if (user?.groupId === groupId) return;

      setLoadingUserId(userId);

      try {
        const res = await fetch("/api/assign-group", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, groupId }),
        });

        const data = await res.json();

        if (!data.success) {
          toast.error(data.error);
          return;
        }

        // 🔥 Optimized optimistic update (only if needed)
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId && u.groupId !== groupId ? { ...u, groupId } : u,
          ),
        );

        toast.success("Group assigned");
        // router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      } finally {
        setLoadingUserId(null);
      }
    },
    [userMap],
  );

  const roomOptions = useMemo(
    () =>
      Object.entries(rooms).map(([id, name]) => (
        <option key={id} value={id}>
          {name}
        </option>
      )),
    [rooms],
  );

  const groupOptions = useMemo(
    () =>
      Object.entries(groups).map(([id, name]) => (
        <option key={id} value={id}>
          {name}
        </option>
      )),
    [groups],
  );

  const toggleReported = useCallback(
    async (userId: string, reported: boolean) => {
      try {
        const res = await fetch("/api/report-to-venue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, reported }),
        });

        const data = await res.json();

        if (!data.success) {
          toast.error(data.error);
          return;
        }

        // 🔥 optimistic UI update
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, reportedToVenue: reported } : u,
          ),
        );

        toast.success(reported ? "Marked as reported" : "Unmarked");
        // router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Failed");
      }
    },
    [],
  );

  const processedUsers = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

    let result = users;

    // 🔍 search
    if (q) {
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.churchName?.toLowerCase().includes(q) ||
          u.age?.toString().includes(q),
      );
    }

    // 🔥 apply ALL selected filters
    if (modes.length > 0) {
      result = result.filter((u) => {
        return modes.some((mode) => {
          switch (mode) {
            case "unassigned-group":
              return !u.groupId;
            case "unassigned-room":
              return !u.roomId;
            case "assigned-both":
              return u.roomId && u.groupId;
            case "unassigned":
              return !u.roomId && !u.groupId;
            case "male":
              return u.gender?.toLowerCase() === "male";
            case "female":
              return u.gender?.toLowerCase() === "female";
            case "reported":
              return u.reportedToVenue === true;
            case "not-reported":
              return !u.reportedToVenue;
            case "age-range":
              return (
                u.age !== null && u.age >= ageRange[0] && u.age <= ageRange[1]
              );
            default:
              return true;
          }
        });
      });
    }

    if (modes.includes("age")) {
      result = [...result].sort((a, b) => (a.age || 0) - (b.age || 0));
    }

    return result;
  }, [users, debouncedSearch, modes, ageRange]);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
      <SyncStatus />
      <h1 className="text-3xl font-semibold mb-6">Delegates</h1>

      <p className="text-md text-zinc-400 mb-2">
        {processedUsers.length} members
      </p>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, church..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-max bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-md w-full max-w-md focus:outline-none"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex gap-2 items-center justify-center text-[16px] bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-md text-sm hover:bg-zinc-800">
              Filters <SlidersHorizontal size={"18px"} />{" "}
              {modes.length > 0 && `(${modes.length})`}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-56 bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none outline-none focus:ring-0 focus-visible:ring-0 ring-0 shadow-none"
          >
            <DropdownMenuLabel>Filter Users</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
              Age
            </DropdownMenuLabel>

            <DropdownMenuCheckboxItem
              className="cursor-pointer hover:bg-zinc-800 data-[state=checked]:bg-zinc-800
    data-[state=checked]:text-white"
              checked={modes.includes("age")}
              onCheckedChange={() => toggleMode("age")}
            >
              Age (Ascending)
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              className="cursor-pointer hover:bg-zinc-800 data-[state=checked]:bg-zinc-800
    data-[state=checked]:text-white"
              checked={modes.includes("age-range")}
              onCheckedChange={() => toggleMode("age-range")}
            >
              Age Range
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
              Rooms and Groups
            </DropdownMenuLabel>

            <DropdownMenuCheckboxItem
              className="cursor-pointer hover:bg-zinc-800 data-[state=checked]:bg-zinc-800
    data-[state=checked]:text-white"
              checked={modes.includes("unassigned-group")}
              onCheckedChange={() => toggleMode("unassigned-group")}
            >
              Unassigned Group
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              className="cursor-pointer hover:bg-zinc-800 data-[state=checked]:bg-zinc-800
    data-[state=checked]:text-white"
              checked={modes.includes("unassigned-room")}
              onCheckedChange={() => toggleMode("unassigned-room")}
            >
              Unassigned Room
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              className="cursor-pointer hover:bg-zinc-800 data-[state=checked]:bg-zinc-800
    data-[state=checked]:text-white"
              checked={modes.includes("assigned-both")}
              onCheckedChange={() => toggleMode("assigned-both")}
            >
              Assigned Both
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              className="cursor-pointer hover:bg-zinc-800 data-[state=checked]:bg-zinc-800
    data-[state=checked]:text-white"
              checked={modes.includes("unassigned")}
              onCheckedChange={() => toggleMode("unassigned")}
            >
              Unassigned
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
              Gender
            </DropdownMenuLabel>

            <DropdownMenuCheckboxItem
              className="cursor-pointer hover:bg-zinc-800 data-[state=checked]:bg-zinc-800
    data-[state=checked]:text-white"
              checked={modes.includes("male")}
              onCheckedChange={() => toggleMode("male")}
            >
              Male
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              className="cursor-pointer hover:bg-zinc-800 data-[state=checked]:bg-zinc-800
    data-[state=checked]:text-white"
              checked={modes.includes("female")}
              onCheckedChange={() => toggleMode("female")}
            >
              Female
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
              Report To Venue
            </DropdownMenuLabel>

            <DropdownMenuCheckboxItem
              className="cursor-pointer hover:bg-zinc-800 data-[state=checked]:bg-zinc-800
    data-[state=checked]:text-white"
              checked={modes.includes("reported")}
              onCheckedChange={() => toggleMode("reported")}
            >
              Reported
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              className="cursor-pointer hover:bg-zinc-800 data-[state=checked]:bg-zinc-800
    data-[state=checked]:text-white"
              checked={modes.includes("not-reported")}
              onCheckedChange={() => toggleMode("not-reported")}
            >
              Not Reported
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {modes.includes("age-range") && (
          <div className="w-full md:w-[200px] md:max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 gap-8">
              <p className="text-xs text-zinc-400 mb-2">Age Range</p>
              <span className="text-xs text-zinc-200 mb-2">
                {ageRange[0]} - {ageRange[1]}
              </span>
            </div>

            <Slider
              value={ageRange}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setAgeRange(value as [number, number])}
              className="
    w-full

    /* Track (full line) */
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
        )}

        <div>
          <a
            href="/analytics"
            target="_blank"
            className="block flex gap-2 items-center justify-center text-[16px] bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-md text-sm hover:bg-zinc-800"
          >
            Chart Analytics <ExternalLink size={"18px"} />
          </a>
        </div>
        <div>
          <button
            onClick={() => router.refresh()}
            className="block w-full flex gap-2 items-center justify-center text-[16px] bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-md text-sm hover:bg-zinc-800 cursor-pointer"
          >
            Refresh <RotateCw size={"18px"} />
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {processedUsers && processedUsers.length > 0 ? (
          processedUsers.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              rooms={rooms}
              groups={groups}
              roomOptions={roomOptions}
              groupOptions={groupOptions}
              assignRoom={assignRoom}
              assignGroup={assignGroup}
              loadingUserId={loadingUserId}
              toggleReported={toggleReported}
            />
          ))
        ) : (
          <p className="text-zinc-500 italic">No delegates found.</p>
        )}
      </div>
      <RefreshHandler />
    </div>
  );
}
