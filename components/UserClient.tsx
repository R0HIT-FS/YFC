"use client";

import { useEffect, useState } from "react";
import CreateRoom from "./CreateRoom";

export default function UsersClient({ users }) {
  const [rooms, setRooms] = useState({});
  const [loadingUserId, setLoadingUserId] = useState(null);

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

  const assignRoom = async (userId, roomId) => {
    if (!roomId) {
      alert("Select a room");
      return;
    }

    setLoadingUserId(userId);

    const res = await fetch("/api/assign-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // ✅ IMPORTANT
      },
      body: JSON.stringify({ userId, roomId }),
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Assigned!");
      window.location.reload(); // ✅ refresh UI
    } else {
      alert("❌ " + data.error);
    }

    setLoadingUserId(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
      <h1 className="text-3xl font-semibold mb-6 tracking-tight">
        Users
      </h1>
      <CreateRoom/>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
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

            {/* Dropdown */}
            <select
              defaultValue=""
              onChange={(e) =>
                assignRoom(user._id, e.target.value)
              }
              className="mt-4 w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              <option value="">Select Room</option>

              {Object.entries(rooms).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>

            {/* Loading */}
            {loadingUserId === user._id && (
              <p className="text-xs text-zinc-400 mt-2">
                Assigning...
              </p>
            )}

            {/* Room label */}
            {user.roomId && rooms[user.roomId] && (
              <p className="text-xs text-zinc-300 mt-2">
                Room: {rooms[user.roomId]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}