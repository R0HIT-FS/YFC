// app/rooms/page.tsx
export const dynamic = "force-dynamic";

import CreateRoom from "@/components/CreateRoom";
import clientPromise from "../lib/db";
import RoomCard from "@/components/RoomCard";
import RefreshHandler from "@/components/RefreshHandler";

// 1. Define Interfaces to match your DB schema and RoomCard props
interface User {
  _id: string;
  name?: string | null;
  roomId?: string | null;
  groupId?: string | null;
}

interface Room {
  _id: string;
  name?: string | null;
  limit?: number | null;
}

async function getData() {
  const client = await clientPromise;
  const db = client.db("yfc");

  const [rooms, users] = await Promise.all([
    db.collection("rooms").find({}).toArray(),
    db.collection("users").find({}).toArray(),
  ]);

  return {
    // Ensure we handle missing fields with fallbacks here as well
    rooms: rooms.map((r) => ({ 
      ...r, 
      _id: r._id.toString(),
      name: r.name ?? "Unnamed Room",
      limit: r.limit ?? 0 
    })) as Room[],
    
    users: users.map((u) => ({
      ...u,
      _id: u._id.toString(),
      name: u.name ?? "Anonymous",
      roomId: u.roomId ? u.roomId.toString() : null,
      groupId: u.groupId ? u.groupId.toString() : null,
    })) as User[],
  };
}

export default async function RoomsPage() {
  const { rooms, users } = await getData();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
      <h2 className="text-3xl font-semibold mb-8">Create A Room</h2>
      <CreateRoom />
      
      <h2 className="text-3xl font-semibold mb-8 mt-10">Rooms</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard 
            key={room._id} 
            room={room} 
            users={users} // Pass the typed users array
          />
        ))}
      </div>
      <RefreshHandler />
    </div>
  );
}