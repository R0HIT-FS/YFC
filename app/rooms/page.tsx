// app/rooms/page.tsx
export const dynamic = "force-dynamic"; 

import CreateRoom from "@/components/CreateRoom";
import clientPromise from "../lib/db";
import RoomCard from "@/components/RoomCard";

async function getData() {
  const client = await clientPromise;
  const db = client.db("yfc");

  // Parallel fetching: Rooms and Users load at the same time
  const [rooms, users] = await Promise.all([
    db.collection("rooms").find({}).toArray(),
    db.collection("users").find({}).toArray(),
  ]);

  return {
    rooms: rooms.map((r) => ({ ...r, _id: r._id.toString() })),
    users: users.map((u) => ({
      ...u,
      _id: u._id.toString(),
      roomId: u.roomId ? u.roomId.toString() : null,
      groupId: u.groupId ? u.groupId.toString() : null,
    })),
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
          <RoomCard key={room._id} room={room} users={users} />
        ))}
      </div>
    </div>
  );
}