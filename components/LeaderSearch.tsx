"use client";

import { useMemo, useState } from "react";
import LeaderCard from "../components/LeaderCard";

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

export default function LeaderSearch({
  groups,
  usersByGroup,
  roomMap,
  groupMap,
}: {
  groups: Group[];
  usersByGroup: Record<string, User[]>;
  roomMap: Record<string, string>;
  groupMap: Record<string, string>;
}) {
  const [search, setSearch] = useState("");

  //logic to search groups based on users
//   const filteredGroups = useMemo(() => {
//     const q = search.trim().toLowerCase();

//     if (!q) return groups;

//     return groups.filter((group) => {
//       const users = usersByGroup[group._id] || [];

//       // 🔥 match ANY user in group (leader assumed inside users)
//       return users.some((u) =>
//         u.name?.toLowerCase().includes(q)
//       );
//     });
//   }, [search, groups, usersByGroup]);


const filteredGroups = useMemo(() => {
  const q = search.trim().toLowerCase();

  if (!q) return groups;

  return groups.filter((group) =>
    group.name?.toLowerCase().includes(q)
  );
}, [search, groups]);
  return (
    <>
      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="Search leader by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-md mb-6 focus:outline-none"
      />

      {/* Results */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <LeaderCard
              key={group._id}
              group={group}
              users={usersByGroup[group._id] || []}
              roomMap={roomMap}
              groupMap={groupMap}
            />
          ))
        ) : (
          <p className="text-zinc-500 italic">No matching leaders found.</p>
        )}
      </div>
    </>
  );
}