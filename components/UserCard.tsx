"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserCard({ user }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      const res = await fetch("/api/rooms/all");
      const data = await res.json();

      if (data.success) {
        setRooms(data.rooms);
      }
    };

    fetchRooms();
  }, []);

  // ✅ Assign user to selected room
  const assignRoom = async () => {
    if (!selectedRoom) {
      // alert("Please select a room");
      toast.info(`Select A Room!`,{position:'bottom-right', duration:3000})
      return;
    }

    setLoading(true);

    const res = await fetch("/api/assign-room", {
      method: "POST",
      body: JSON.stringify({
        userId: user._id,
        roomId: selectedRoom,
      }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success(`Room assigned!`,{position:'bottom-right', duration:3000})
    } else {
      toast.error(data.error,{position:'bottom-right', duration:3000})
    }

    setLoading(false);
  };

  return (
    <div className="card">
      {/* Avatar */}
      <div className="avatar">
        {user.name?.charAt(0)?.toUpperCase() || "U"}
      </div>

      {/* Name */}
      <div className="name">{user?.name}, {user?.age}</div>

      {/* Info */}
      <div className="info">
        <div>{user?.email}</div>
      </div>

      {/* 🔽 Room Dropdown */}
      <select
        value={selectedRoom}
        onChange={(e) => setSelectedRoom(e.target.value)}
        style={{ marginTop: "10px", padding: "6px" }}
      >
        <option value="">Select Room</option>

        {rooms.map((room) => (
          <option key={room._id} value={room._id}>
            {room.name}
          </option>
        ))}
      </select>

      {/* 🔘 Assign Button */}
      <button
        onClick={assignRoom}
        disabled={loading}
        style={{
          marginTop: "10px",
          padding: "6px 10px",
          cursor: "pointer",
        }}
      >
        {loading ? "Assigning..." : "Assign Room"}
      </button>
    </div>
  );
}