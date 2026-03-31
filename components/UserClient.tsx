// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { toast } from "sonner";
// import { Separator } from "@/components/ui/separator";

// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// import { Button } from "@/components/ui/button";
// import { Maximize2 } from "lucide-react";

// export default function UsersClient({ users: initialUsers }) {
//   const [users, setUsers] = useState(initialUsers);
//   const [rooms, setRooms] = useState({});
//   const [groups, setGroups] = useState({});
//   const [loadingUserId, setLoadingUserId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [mode, setMode] = useState("name");

//   // 🔥 Fetch rooms + groups
//   useEffect(() => {
//     const fetchData = async () => {
//       const [roomsRes, groupsRes] = await Promise.all([
//         fetch("/api/rooms/all"),
//         fetch("/api/groups/all"),
//       ]);

//       const roomsData = await roomsRes.json();
//       const groupsData = await groupsRes.json();

//       if (roomsData.success) {
//         const map = {};
//         roomsData.rooms.forEach((r) => (map[r._id] = r.name));
//         setRooms(map);
//       }

//       if (groupsData.success) {
//         const map = {};
//         groupsData.groups.forEach((g) => (map[g._id] = g.name));
//         setGroups(map);
//       }
//     };

//     fetchData();
//   }, []);

//   // 🔥 Assign Room
//   const assignRoom = async (userId, roomId) => {
//     const user = users.find((u) => u._id === userId);
//     if (user?.roomId === roomId) return;

//     setLoadingUserId(userId);

//     const res = await fetch("/api/assign-room", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ userId, roomId }),
//     });

//     const data = await res.json();

//     if (data.success) {
//       toast.success("Room assigned");
//       setUsers((prev) =>
//         prev.map((u) => (u._id === userId ? { ...u, roomId } : u)),
//       );
//     } else {
//       toast.error(data.error);
//     }

//     setLoadingUserId(null);
//   };

//   // 🔥 Assign Group
//   const assignGroup = async (userId, groupId) => {
//     const user = users.find((u) => u._id === userId);
//     if (user?.groupId === groupId) return;

//     setLoadingUserId(userId);

//     const res = await fetch("/api/assign-group", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
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
//   };

//   // 🔍 Filter
//   const processedUsers = useMemo(() => {
//     const q = search.toLowerCase();

//     let result = users.filter(
//       (u) =>
//         u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
//     );

//     switch (mode) {
//       // 🔤 Alphabetical
//       case "name":
//         return [...result].sort((a, b) =>
//           (a.name || "").localeCompare(b.name || ""),
//         );

//       // 🔢 Age
//       case "age":
//         return [...result].sort((a, b) => (a.age || 0) - (b.age || 0));

//       // 🔥 Room OR Group assigned
//       case "assigned-any":
//         return result.filter(
//           (u) =>
//             (u.roomId && rooms[u.roomId]) || (u.groupId && groups[u.groupId]),
//         );

//       // 🔥 Room AND Group assigned
//       case "assigned-both":
//         return result.filter(
//           (u) => u.roomId && rooms[u.roomId] && u.groupId && groups[u.groupId],
//         );

//       // ❌ None assigned
//       case "unassigned":
//         return result.filter(
//           (u) => !u.roomId && !u.groupId && !groups[u.groupId],
//         );

//       case "male":
//         return result.filter((u) => u.gender.toLowerCase() === "male");

//       case "female":
//         return result.filter((u) => u.gender.toLowerCase() === "female");

//       default:
//         return result;
//     }
//   }, [users, search, mode]);

//   return (
//     <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
//       <h1 className="text-3xl font-semibold mb-6">Delegates</h1>

//       <p className="text-xs text-zinc-400 mb-2">
//         {processedUsers.length} members
//       </p>

//       {/* 🔍 Search */}

//       <div className="flex flex-col sm:flex-row gap-3 mb-4">
//         {/* 🔍 Search */}
//         <input
//           type="text"
//           placeholder="Search by name, church..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full max-w-md bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none"
//         />

//         {/* 🔽 Mode Select */}
//         <select
//           value={mode}
//           onChange={(e) => setMode(e.target.value)}
//           className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none"
//         >
//           <option value="name">Sort: Name (A–Z)</option>
//           <option value="age">Sort: Age</option>
//           <option value="assigned-any">Filter: Room OR Group Assigned</option>
//           <option value="assigned-both">Filter: Room AND Group Assigned</option>
//           <option value="unassigned">Filter: None Assigned</option>
//           <option value="male">Filter: Male</option>
//           <option value="female">Filter: Female</option>
//         </select>
//       </div>
//       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//         {processedUsers.length > 0 ? (
//           processedUsers.map((user) => (
//             <div
//               key={user._id}
//               className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative"
//             >
//               {/* Avatar */}
//               <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
//                 {user.name?.charAt(0)?.toUpperCase() || "U"}
//               </div>

//               <p className="font-medium">
//                 {user.name},{" "}
//                 <span className="text-zinc-400">{user.age || "N/A"}</span>
//               </p>

//               <p className="text-sm text-zinc-400 mt-2">{user.churchName || "-"}</p>

//               {/* Labels */}
//               {user.roomId && rooms[user.roomId] && (
//                 <p className="text-xs mt-3 text-zinc-400">
//                   <b>Room:</b> {rooms[user.roomId] || "Unassigned"}
//                 </p>
//               )}

//               {user.groupId && groups[user.groupId] && (
//                 <p className="text-xs mt-2 text-zinc-400">
//                   <b>Group:</b> {groups[user.groupId] || "Unassigned"}
//                 </p>
//               )}

//               {/* 🔥 ASSIGN BUTTON */}
//               <Dialog>
//                 <DialogTrigger asChild>
//                   <button className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-sm py-2 rounded-md">
//                     Assign Room / Group
//                   </button>
//                 </DialogTrigger>

//                 {/* <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100"> */}
//                 <DialogContent
//                   className="
//     bg-zinc-900 
//     border border-zinc-800 
//     text-zinc-100 
//     outline-none 
//     focus:outline-none 
//     focus:ring-0 
//     focus-visible:ring-0 
//     ring-0 
//     shadow-none
//   "
//                 >
//                   <DialogHeader>
//                     <DialogTitle>Assign for {user.name}</DialogTitle>
//                   </DialogHeader>

//                   {/* ROOM */}
//                   <select
//                     value={user.roomId || ""}
//                     onChange={(e) => assignRoom(user._id, e.target.value)}
//                     className="mt-4 w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none"
//                   >
//                     <option value="">Select Room</option>
//                     {Object.entries(rooms).map(([id, name]) => (
//                       <option key={id} value={id}>
//                         {name}
//                       </option>
//                     ))}
//                   </select>

//                   {/* GROUP */}
//                   <select
//                     value={user.groupId || ""}
//                     onChange={(e) => assignGroup(user._id, e.target.value)}
//                     className="mt-2 w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none"
//                   >
//                     <option value="">Select Group</option>
//                     {Object.entries(groups).map(([id, name]) => (
//                       <option key={id} value={id}>
//                         {name}
//                       </option>
//                     ))}
//                   </select>

//                   <DialogClose asChild>
//                     <button className="bg-zinc-800 px-4 py-2 rounded-md text-sm">
//                       Close
//                     </button>
//                   </DialogClose>
//                 </DialogContent>
//               </Dialog>

//               {loadingUserId === user._id && (
//                 <p className="text-xs text-zinc-500 mt-2">Updating...</p>
//               )}

//               {/* <div className="expand absolute top-5 right-5">
//                  <Dialog>
//       <DialogTrigger asChild>
//         <Maximize2 size={'18px'} cursor={'pointer'}/>
//       </DialogTrigger>
//       <DialogContent className="bg-zinc-900 border border-zinc-800">
//         <DialogHeader className="text-white">
//           <DialogTitle className="text-white">Info Card</DialogTitle>
//           <DialogDescription className="text-zinc-400">
//             Details of the delegate.
//           </DialogDescription>
//         </DialogHeader>
//         <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
//             <p className="mb-4 leading-normal text-white">
//               <b>Name: </b> {user.name}
//             </p>
//         </div>
//         <DialogFooter>
//           <DialogClose asChild>
//             <Button variant="outline">Close</Button>
//           </DialogClose>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
                
//               </div> */}
//               <div className="expand absolute top-3 right-3">
//                 <Dialog>
//                   <DialogTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
//                     >
//                       <Maximize2 size={16} />
//                     </Button>
//                   </DialogTrigger>

//                   {/* <DialogContent className="bg-zinc-900 text-zinc-100 focus-visible:ring-0 shadow-none"> */}
//                   <DialogContent className="content-dialog bg-zinc-900 border-zinc-800 text-zinc-100 shadow-none outline-none focus:ring-0 focus-visible:ring-0 focus:outline-none [&>button:last-child]:text-zinc-400 [&>button:last-child]:hover:text-zinc-100 [&>button:last-child]:hover:bg-zinc-800 [&>button:last-child]:border-0 [&>button:last-child]:ring-0 [&>button:last-child]:outline-none shadow-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-[1px] border-zinc-800">
//                     <DialogHeader>
//                       <DialogTitle>Info Card</DialogTitle>
//                       <DialogDescription>
//                         Details of the delegate.
//                       </DialogDescription>
//                     </DialogHeader>

//                     <div className="grid gap-4 py-2">
//                       {/* Personal */}
//                       <div className="grid gap-1">
//                         <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
//                           Personal
//                         </p>
//                         <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
//                           {[
//                             { label: "Name", value: user.name },
//                             { label: "Email", value: user.email },
//                             { label: "Age", value: user.age },
//                             { label: "Church", value: user.churchName },
//                           ].map(({ label, value }) => (
//                             <div
//                               key={label}
//                               className="flex items-center justify-between px-4 py-2.5 text-sm"
//                             >
//                               <span className="text-zinc-400">{label}</span>
//                               <span className="text-zinc-100 font-medium">
//                                 {value || "—"}
//                               </span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Assignment */}
//                       <div className="grid gap-1">
//                         <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
//                           Assignment
//                         </p>
//                         <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
//                           {[
//                             { label: "Room", value: rooms[user.roomId] },
//                             { label: "Group", value: groups[user.groupId] },
//                           ].map(({ label, value }) => (
//                             <div
//                               key={label}
//                               className="flex items-center justify-between px-4 py-2.5 text-sm"
//                             >
//                               <span className="text-zinc-400">{label}</span>
//                               <span
//                                 className={`font-medium ${value ? "text-zinc-100" : "text-zinc-500 italic"}`}
//                               >
//                                 {value || "Unassigned"}
//                               </span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>

//                     <DialogFooter>
//                       <DialogClose asChild>
//                         <Button
//                           variant="outline"
//                           className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
//                         >
//                           Close
//                         </Button>
//                       </DialogClose>
//                     </DialogFooter>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-white text-lg font-semibold">
//             No Delegates Found!
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";

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

import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";

import React from "react";


// 🔥 Memoized User Card (BIG PERFORMANCE WIN)
const UserCard = React.memo(function UserCard({
  user,
  rooms,
  groups,
  roomOptions,
  groupOptions,
  assignRoom,
  assignGroup,
  loadingUserId,
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
        {user.name?.charAt(0)?.toUpperCase() || "U"}
      </div>

      <p className="font-medium">
        {user.name},{" "}
        <span className="text-zinc-400">{user.age || "N/A"}</span>
      </p>

      <p className="text-sm text-zinc-400 mt-2">
        {user.churchName || "-"}
      </p>

      {/* Labels */}
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

      {/* Assign Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-sm py-2 rounded-md">
            Assign Room / Group
          </button>
        </DialogTrigger>

        <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 shadow-none">
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
            {roomOptions}
          </select>

          {/* GROUP */}
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
      </Dialog>

      {/* Loading */}
      {loadingUserId === user._id && (
        <p className="text-xs text-zinc-500 mt-2">Updating...</p>
      )}

      {/* Expand Dialog */}
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
              <DialogDescription>
                Details of the delegate.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
                {[
                  { label: "Name", value: user.name },
                  { label: "Email", value: user.email },
                  { label: "Age", value: user.age },
                  { label: "Gender", value: user.gender },
                  { label: "Church", value: user.churchName },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between px-4 py-2 text-sm"
                  >
                    <span className="text-zinc-400">{label}</span>
                    <span className="text-zinc-100">
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
                {[
                  { label: "Room", value: rooms[user.roomId] },
                  { label: "Group", value: groups[user.groupId] },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between px-4 py-2 text-sm"
                  >
                    <span className="text-zinc-400">{label}</span>
                    <span>
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
export default function UsersClient({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [rooms, setRooms] = useState({});
  const [groups, setGroups] = useState({});
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mode, setMode] = useState("name");

  // 🔥 Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

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

  // 🔥 User Map (O(1))
  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u._id, u));
    return map;
  }, [users]);

  // 🔥 Assign Room
  const assignRoom = useCallback(async (userId, roomId) => {
    const user = userMap.get(userId);
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
        prev.map((u) =>
          u._id === userId ? { ...u, roomId } : u
        )
      );
    } else {
      toast.error(data.error);
    }

    setLoadingUserId(null);
  }, [userMap]);

  // 🔥 Assign Group
  const assignGroup = useCallback(async (userId, groupId) => {
    const user = userMap.get(userId);
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
        prev.map((u) =>
          u._id === userId ? { ...u, groupId } : u
        )
      );
    } else {
      toast.error(data.error);
    }

    setLoadingUserId(null);
  }, [userMap]);

  // 🔥 Options memo
  const roomOptions = useMemo(
    () =>
      Object.entries(rooms).map(([id, name]) => (
        <option key={id} value={id}>{name}</option>
      )),
    [rooms]
  );

  const groupOptions = useMemo(
    () =>
      Object.entries(groups).map(([id, name]) => (
        <option key={id} value={id}>{name}</option>
      )),
    [groups]
  );

  // 🔥 Filter + sort
  const processedUsers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    let result = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );

    switch (mode) {
      case "name":
        result.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
        return result;

      case "age":
        result.sort((a, b) => (a.age || 0) - (b.age || 0));
        return result;

      case "assigned-any":
        return result.filter(
          (u) => u.roomId || u.groupId
        );

      case "assigned-both":
        return result.filter(
          (u) => u.roomId && u.groupId
        );

      case "unassigned":
        return result.filter(
          (u) => !u.roomId && !u.groupId
        );

      case "male":
        return result.filter(
          (u) => u.gender?.toLowerCase() === "male"
        );

      case "female":
        return result.filter(
          (u) => u.gender?.toLowerCase() === "female"
        );

      default:
        return result;
    }
  }, [users, debouncedSearch, mode]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
      <h1 className="text-3xl font-semibold mb-6">Delegates</h1>

      <p className="text-md text-zinc-400 mb-2">
        {processedUsers.length} members
      </p>

      {/* Search + Sort */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, church..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-md"
        />

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-md"
        >
          <option value="name">Sort By : Name (A-Z)</option>
          <option value="age">Sort By : Age</option>
          <option value="assigned-any">Filter : Assigned Any</option>
          <option value="assigned-both">Filter : Assigned Both</option>
          <option value="unassigned">Filter : Unassigned</option>
          <option value="male">Filter : Male</option>
          <option value="female">Filter : Female</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {processedUsers.map((user) => (
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
          />
        ))}
      </div>
    </div>
  );
}