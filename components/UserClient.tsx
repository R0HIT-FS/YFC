// "use client";

// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";

// export default function UsersClient({ users }) {
//   const [rooms, setRooms] = useState({});
//   const [loadingUserId, setLoadingUserId] = useState(null);
//   const [search, setSearch] = useState("");

//   const router = useRouter();

//   useEffect(() => {
//     const fetchRooms = async () => {
//       const res = await fetch("/api/rooms/all");
//       const data = await res.json();

//       if (data.success) {
//         const roomMap = {};
//         data.rooms.forEach((room) => {
//           roomMap[room._id] = room.name;
//         });

//         setRooms(roomMap);
//       }
//     };

//     fetchRooms();
//   }, []);

//   const assignRoom = async (userId, roomId) => {
//     if (!roomId) {
//       toast.warning(`Select a room!`,{ position: "top-right", duration: 3000});
//       return;
//     }

//     setLoadingUserId(userId);

//     const res = await fetch("/api/assign-room", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json", // ✅ IMPORTANT
//       },
//       body: JSON.stringify({ userId, roomId }),
//     });

//     const data = await res.json();

//     if (data.success) {
//       toast.success(`Room assigned.`,{ position: "top-right", duration: 3000});
//       router.refresh();
//     } else {
//       toast.error(data.error ,{ position: "top-right", duration: 3000});
//     }

//     setLoadingUserId(null);
//   };

//   const filteredUsers = users.filter((user) => {
//     const query = search.toLowerCase();

//     return (
//       user.name?.toLowerCase().includes(query) ||
//       user.email?.toLowerCase().includes(query)
//     );
//   });

//   return (
//     <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
//       <h1 className="text-3xl font-semibold mb-6 tracking-tight">
//         Delegates
//       </h1>
//       {/* <CreateRoom/> */}
//       <p className="text-xs text-zinc-400 mb-2">{filteredUsers.length} members found</p>
//             {/* 🔍 Search Bar */}
//       <input
//         type="text"
//         placeholder="Search by name, email etc...."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="mb-4 w-full max-w-md bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
//       />
      
//       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//         {filteredUsers.map((user) => (
//           <div
//             key={user._id}
//             className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm transition-all duration-300"
//           >
//             {/* Avatar */}
//             <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium mb-3">
//               {user.name?.charAt(0)?.toUpperCase() || "U"}
//             </div>

//             {/* Name */}
//             <div className="text-base font-medium text-zinc-100">
//               {user.name || "No Name"}
//             </div>

//             {/* Email */}
//             <div className="text-sm text-zinc-400 mt-1">
//               {user.email || "No Email"}
//             </div>

//             {/* Dropdown */}
//             <select
//               defaultValue=""
//               onChange={(e) =>
//                 assignRoom(user._id, e.target.value)
//               }
//               className="mt-4 w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
//             >
//               <option value="">Select Room</option>

//               {Object.entries(rooms).map(([id, name]) => (
//                 <option key={id} value={id}>
//                   {name}
//                 </option>
//               ))}
//             </select>

//             {/* Loading */}
//             {loadingUserId === user._id && (
//               <p className="text-xs text-zinc-400 mt-2">
//                 Assigning...
//               </p>
//             )}

//             {/* Room label */}
//             {user.roomId && rooms[user.roomId] && (
//               <p className="text-xs text-zinc-300 mt-2">
//                 Room: {rooms[user.roomId]}
//               </p>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UsersClient({ users }) {
  const [rooms, setRooms] = useState({});
  const [groups, setGroups] = useState({});
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [search, setSearch] = useState("");

  const router = useRouter();

  // 🔹 Fetch Rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const res = await fetch("/api/rooms/all");
      const data = await res.json();

      if (data.success) {
        const roomMap = {};
        data.rooms.forEach((room) => {
          roomMap[room._id] = room.name;
        });
        setRooms(roomMap);
      }
    };

    fetchRooms();
  }, []);

  // 🔹 Fetch Groups
  useEffect(() => {
    const fetchGroups = async () => {
      const res = await fetch("/api/groups/all");
      const data = await res.json();

      if (data.success) {
        const groupMap = {};
        data.groups.forEach((group) => {
          groupMap[group._id] = group.name;
        });
        setGroups(groupMap);
      }
    };

    fetchGroups();
  }, []);

  // 🔹 Assign Room
  const assignRoom = async (userId, roomId) => {
    if (!roomId) {
      toast.warning("Select a room!", { position: "top-right" });
      return;
    }

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
      toast.success("Room assigned", { position: "top-right" });
      router.refresh();
    } else {
      toast.error(data.error, { position: "top-right" });
    }

    setLoadingUserId(null);
  };

  // 🔹 Assign Group
  const assignGroup = async (userId, groupId) => {
    if (!groupId) {
      toast.warning("Select a group!", { position: "top-right" });
      return;
    }

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
      toast.success("Group assigned", { position: "top-right" });
      router.refresh();
    } else {
      toast.error(data.error, { position: "top-right" });
    }

    setLoadingUserId(null);
  };

  // 🔍 Search Filter
  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();

    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
      <h1 className="text-3xl font-semibold mb-6 tracking-tight">
        Delegates
      </h1>

      <p className="text-xs text-zinc-400 mb-2">
        {filteredUsers.length} members found
      </p>

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search by name, email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm transition-all duration-300"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium mb-3">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* Name */}
            <div className="text-base font-medium text-zinc-100">
              {user.name || "No Name"}
            </div>

            {/* Email */}
            <div className="text-sm text-zinc-400 mt-1">
              {user.email || "No Email"}
            </div>

            {/* 🔽 ROOM DROPDOWN */}
            <select
              defaultValue=""
              onChange={(e) =>
                assignRoom(user._id, e.target.value)
              }
              className="mt-4 w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select Room</option>

              {Object.entries(rooms).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>

            {/* 🔽 GROUP DROPDOWN */}
            <select
              defaultValue=""
              onChange={(e) =>
                assignGroup(user._id, e.target.value)
              }
              className="mt-2 w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select Group</option>

              {Object.entries(groups).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>

            {/* ⏳ Loading */}
            {loadingUserId === user._id && (
              <p className="text-xs text-zinc-400 mt-2">
                Updating...
              </p>
            )}

            {/* 🏷 Room */}
            {user.roomId && rooms[user.roomId] && (
              <p className="text-xs text-zinc-300 mt-2">
                Room: {rooms[user.roomId]}
              </p>
            )}

            {/* 🏷 Group */}
            {user.groupId && groups[user.groupId] && (
              <p className="text-xs text-zinc-300 mt-1">
                Group: {groups[user.groupId]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}