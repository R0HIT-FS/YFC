import clientPromise from "../lib/db";

async function getData() {
  const client = await clientPromise;
  const db = client.db("yfc");

  const rooms = await db.collection("rooms").find({}).toArray();
  const users = await db.collection("users").find({}).toArray();

  return {
    rooms: rooms.map((r) => ({
      ...r,
      _id: r._id.toString(),
    })),
    users: users.map((u) => ({
      ...u,
      _id: u._id.toString(),
      roomId: u.roomId ? u.roomId.toString() : null,
    })),
  };
}

export default async function RoomsPage() {
  const { rooms, users } = await getData();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
      <h1 className="text-3xl font-semibold mb-8">
        Rooms
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => {
          const roomUsers = users.filter(
            (user) => user.roomId === room._id
          );

          return (
            <div
              key={room._id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
            >
              {/* Room Name */}
              <h2 className="text-lg font-semibold mb-3">
                {room.name}
              </h2>

              {/* Users in room */}
              <div className="space-y-2">
                {roomUsers.length > 0 ? (
                  roomUsers.map((user) => (
                    <div
                      key={user._id}
                      className="text-sm text-zinc-300 bg-zinc-800 px-3 py-2 rounded-md"
                    >
                      {user.name}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">
                    No users in this room
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}