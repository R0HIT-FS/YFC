// export const dynamic = "force-dynamic"; // Ensures fresh data on every request

// import clientPromise from "../lib/db";
// import GroupCard from "../../components/GroupCard";
// import CreateGroup from "@/components/CreateGroup";

// async function getData() {
//   const client = await clientPromise;
//   const db = client.db("yfc");

//   const groups = await db.collection("groups").find({}).toArray();
//   const users = await db.collection("users").find({}).toArray();

//   return {
//     // ✅ Convert ALL ObjectIds → string
//     groups: groups.map((g) => ({
//       ...g,
//       _id: g._id.toString(),
//     })),

//     users: users.map((u) => ({
//       ...u,
//       _id: u._id.toString(),
//       groupId: u.groupId ? u.groupId.toString() : null,
//       roomId: u.roomId ? u.roomId.toString() : null,
//     })),
//   };
// }

// export default async function GroupsPage() {
//   const { groups, users } = await getData();

//   return (
//     <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
//       <h2 className="text-3xl font-semibold mb-8"> Create A Group</h2>

//       {/* Create Group */}
//       <CreateGroup />

//       <h2 className="text-3xl font-semibold mb-8 mt-10">
//         Groups
//       </h2>

//       {/* Groups Grid */}
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {groups.map((group) => (
//           <GroupCard
//             key={group._id}
//             group={group}
//             users={users}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }


export const dynamic = "force-dynamic";

import clientPromise from "../lib/db";
import GroupCard from "../../components/GroupCard";
import CreateGroup from "@/components/CreateGroup";

async function getData() {
  const client = await clientPromise;
  const db = client.db("yfc");

  // Parallel fetching for max speed
  const [groups, users] = await Promise.all([
    db.collection("groups").find({}).toArray(),
    db.collection("users").find({}).toArray(),
  ]);

  return {
    groups: groups.map((g) => ({
      ...g,
      _id: g._id.toString(),
    })),
    users: users.map((u) => ({
      ...u,
      _id: u._id.toString(),
      groupId: u.groupId ? u.groupId.toString() : null,
      roomId: u.roomId ? u.roomId.toString() : null,
    })),
  };
}

export default async function GroupsPage() {
  const { groups, users } = await getData();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
      <h2 className="text-3xl font-semibold mb-8">Create A Group</h2>
      <CreateGroup />

      <h2 className="text-3xl font-semibold mb-8 mt-10">Groups</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <GroupCard 
            key={group._id} 
            group={group} 
            users={users} // Passes the full list to be filtered locally
          />
        ))}
      </div>
    </div>
  );
}