// export const dynamic = "force-dynamic";

// import clientPromise from "../lib/db";
// import GroupCard from "../../components/GroupCard";
// import CreateGroup from "@/components/CreateGroup";
// import RefreshHandler from "@/components/RefreshHandler";

// async function getData() {
//   try {
//     const client = await clientPromise;
//     const db = client.db("yfc");

//     // Parallel fetching for max speed
//     const [groups, users] = await Promise.all([
//       db.collection("groups").find({}).toArray(),
//       db.collection("users").find({}).toArray(),
//     ]);

//     return {
//       // Use optional chaining and fallbacks during mapping to prevent crashes
//       groups: groups.map((g) => ({
//         ...g,
//         _id: g._id?.toString() ?? "",
//         name: g.name ?? "Unnamed Group", // Fallback for missing names
//       })),
//       users: users.map((u) => ({
//         ...u,
//         _id: u._id?.toString() ?? "",
//         name: u.name ?? "Unknown User", // Fallback for missing names
//         groupId: u.groupId ? u.groupId.toString() : null,
//         roomId: u.roomId ? u.roomId.toString() : null,
//       })),
//     };
//   } catch (error) {
//     console.error("Database fetch failed:", error);
//     return { groups: [], users: [] };
//   }
// }

// export default async function GroupsPage() {
//   const { groups, users } = await getData();

//   return (
//     <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
//       <h2 className="text-3xl font-semibold mb-8">Create A Group</h2>
//       <CreateGroup />

//       <h2 className="text-3xl font-semibold mb-8 mt-10">Groups</h2>

//       {/* Safety check: Only map if groups exists */}
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {groups && groups.length > 0 ? (
//           groups.map((group) => (
//             <GroupCard
//               key={group._id}
//               group={group}
//               users={users ?? []} // Ensure users is never undefined
//             />
//           ))
//         ) : (
//           <p className="text-zinc-500 italic">No groups found.</p>
//         )}
//       </div>
//       <RefreshHandler />
//     </div>
//   );
// }

export const dynamic = "force-dynamic";

import clientPromise from "../../lib/db";
import GroupCard from "../../../components/GroupCard";
import CreateGroup from "@/components/CreateGroup";
import RefreshHandler from "@/components/RefreshHandler";
import ExportPDFButton from "@/components/ExportPdfButton";

interface User {
  _id: string;
  name?: string | null;
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

    const [groups, users] = await Promise.all([
      db.collection("groups").find({}).toArray(),
      db.collection("users").find({}).toArray(),
    ]);

    // 🔥 GROUP USERS BY GROUP (BIG WIN)
    const usersByGroup: Record<string, User[]> = {};

    users.forEach((u) => {
      const groupId = u.groupId?.toString();
      if (!groupId) return;

      if (!usersByGroup[groupId]) usersByGroup[groupId] = [];

      usersByGroup[groupId].push({
        ...u,
        _id: u._id?.toString() ?? "",
        name: u.name ?? "Unknown User",
        groupId,
        roomId: u.roomId ? u.roomId.toString() : null,
      });
    });

    return {
      groups: groups.map((g) => ({
        ...g,
        _id: g._id?.toString() ?? "",
        name: g.name ?? "Unnamed Group",
      })) as Group[],

      usersByGroup, // 🔥 NEW
    };
  } catch (error) {
    console.error("Database fetch failed:", error);
    return { groups: [], usersByGroup: {} };
  }
}

export const metadata = {
  title: "Groups - Saviour Of Sinners",
};

export default async function GroupsPage() {
  const { groups, usersByGroup } = await getData();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
      <h2 className="text-3xl font-semibold mb-8">Create A Group</h2>
      <CreateGroup />

      <h2 className="text-3xl font-semibold mb-8 mt-10">Groups</h2>

      <div className="flex items-center justify-between mb-8 mt-10">
        <ExportPDFButton groups={groups} usersByGroup={usersByGroup} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.length > 0 ? (
          groups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              users={usersByGroup[group._id] || []} // 🔥 only relevant users
            />
          ))
        ) : (
          <p className="text-zinc-500 italic">No groups found.</p>
        )}
      </div>

      <RefreshHandler />
    </div>
  );
}
