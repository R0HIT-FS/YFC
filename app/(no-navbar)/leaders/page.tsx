export const dynamic = "force-dynamic";

import clientPromise from "../../lib/db";
import CreateGroup from "@/components/CreateGroup";
import RefreshHandler from "@/components/RefreshHandler";
import LeaderCard from "@/components/LeaderCard";
import LeaderSearch from "@/components/LeaderSearch";

interface User {
  _id: string;
  name?: string | null;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  churchName?: string | null;
  groupId?: string | null;
  roomId?: string | null;
}

interface Group {
  _id: string;
  name?: string | null;
}


async function getData() {
  try {
    const client = await clientPromise;
    const db = client.db("yfc");

    const [groups, users, rooms] = await Promise.all([
      db.collection("groups").find({}).toArray(),
      db.collection("users").find({}).toArray(),
      db.collection("rooms").find({}).toArray(), // ✅ NEW
    ]);

    // ✅ Create room map
    const roomMap: Record<string, string> = {};
    rooms.forEach((r) => {
      roomMap[r._id?.toString()] = r.name ?? "Unnamed Room";
    });

    // ✅ Create group map
    const groupMap: Record<string, string> = {};
    groups.forEach((g) => {
      groupMap[g._id?.toString()] = g.name ?? "Unnamed Group";
    });

    // 🔥 Group users by groupId
    const usersByGroup: Record<string, User[]> = {};

    users.forEach((u) => {
      const groupId = u.groupId?.toString();
      if (!groupId) return;

      if (!usersByGroup[groupId]) usersByGroup[groupId] = [];

      usersByGroup[groupId].push({
        _id: u._id?.toString() ?? "",
        name: u.name ?? "Unknown User",
        // email: u.email ?? "",
        age: u.age ?? null,
        gender: u.gender ?? "",
        // churchName: u.churchName ?? "",
        groupId,
        roomId: u.roomId ? u.roomId.toString() : null,
      });
    });

    return {
      groups: groups.map((g) => ({
        _id: g._id?.toString() ?? "",
        name: g.name ?? "Unnamed Group",
      })) as Group[],

      usersByGroup,
      roomMap, 
      groupMap, 
    };
  } catch (error) {
    console.error("Database fetch failed:", error);
    return { groups: [], usersByGroup: {}, roomMap: {}, groupMap: {} };
  }
}

export const metadata = {
  title: "Group Leaders - Saviour Of Sinners",
};

export default async function Leaders() {
  const { groups, usersByGroup, roomMap, groupMap } = await getData();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">

      <h2 className="text-3xl font-semibold mb-8">Group Leaders</h2>

      <LeaderSearch
  groups={groups}
  usersByGroup={usersByGroup}
  roomMap={roomMap}
  groupMap={groupMap}
/>

      {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.length > 0 ? (
          groups.map((group) => (
            <LeaderCard
              key={group._id}
              group={group}
              users={usersByGroup[group._id] || []}
                roomMap={roomMap}     // ✅ NEW
                groupMap={groupMap}
            />
          ))
        ) : (
          <p className="text-zinc-500 italic">No Leaders found.</p>
        )}
      </div> */}

      <RefreshHandler />
    </div>
  );
}