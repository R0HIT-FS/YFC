// "use client";

// import { useEffect, useMemo, useState } from "react";

// import { Slider } from "@/components/ui/slider";
// import { Tooltip } from "recharts";

// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuCheckboxItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";

// import { TrendingUp } from "lucide-react";
// import {
//   Label,
//   PolarGrid,
//   PolarRadiusAxis,
//   RadialBar,
//   RadialBarChart,
//   PolarAngleAxis,
// } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   type ChartConfig,
// } from "@/components/ui/chart";

// interface User {
//   _id: string;
//   name: string;
//   age: number | null;
//   gender: string;
//   roomId: string | null;
//   groupId: string | null;
//   reportedToVenue?: boolean;
// }

// export default function AnalyticsPage() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [modes, setModes] = useState<string[]>([]);
//   const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);

//   // 🔥 fetch users
//   useEffect(() => {
//     const fetchUsers = async () => {
//       const res = await fetch("/api/users");
//       const data = await res.json();
//       if (data.success) setUsers(data.users);
//     };

//     fetchUsers();
//   }, []);

//   const toggleMode = (mode: string) => {
//     setModes((prev) =>
//       prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
//     );
//   };

//   // ✅ FILTER LOGIC (FIXED)
//   const processedUsers = useMemo(() => {
//     let result = users;

//     if (modes.length > 0) {
//       const genderModes = modes.filter((m) => m === "male" || m === "female");

//       const otherModes = modes.filter((m) => m !== "male" && m !== "female");

//       result = result.filter((u) => {
//         // OR for gender
//         const genderMatch =
//           genderModes.length === 0 ||
//           genderModes.some((mode) => u.gender?.toLowerCase() === mode);

//         // AND for others
//         const otherMatch = otherModes.every((mode) => {
//           switch (mode) {
//             case "unassigned-group":
//               return !u.groupId;
//             case "unassigned-room":
//               return !u.roomId;
//             case "assigned-both":
//               return u.roomId && u.groupId;
//             case "unassigned":
//               return !u.roomId && !u.groupId;
//             case "reported":
//               return u.reportedToVenue === true;
//             case "not-reported":
//               return !u.reportedToVenue;
//             case "age-range":
//               return (
//                 u.age !== null && u.age >= ageRange[0] && u.age <= ageRange[1]
//               );
//             default:
//               return true;
//           }
//         });

//         return genderMatch && otherMatch;
//       });
//     }

//     return result;
//   }, [users, modes, ageRange]);

//   // ✅ GENDER STATS
//   const { male, female } = useMemo(() => {
//     let male = 0;
//     let female = 0;

//     processedUsers.forEach((u) => {
//       if (u.gender?.toLowerCase() === "male") male++;
//       if (u.gender?.toLowerCase() === "female") female++;
//     });

//     return { male, female };
//   }, [processedUsers]);

//   const total = male + female;

//   return (
//     <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
//       <h1 className="text-3xl font-semibold mb-6">Analytics</h1>

//       {/* 🔽 FILTERS */}
//       <div className="flex flex-col md:flex-row gap-3 mb-6">
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <button className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-md">
//               Filters {modes.length > 0 && `(${modes.length})`}
//             </button>
//           </DropdownMenuTrigger>

//           <DropdownMenuContent className="w-56 bg-zinc-900 border border-zinc-800 text-zinc-100">
//             <DropdownMenuLabel>Filter Users</DropdownMenuLabel>
//             <DropdownMenuSeparator />

//             <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
//               Age
//             </DropdownMenuLabel>

//             <DropdownMenuCheckboxItem
//               checked={modes.includes("age-range")}
//               onCheckedChange={() => toggleMode("age-range")}
//             >
//               Age Range
//             </DropdownMenuCheckboxItem>

//             <DropdownMenuSeparator />

//             <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
//               Rooms and Groups
//             </DropdownMenuLabel>

//             <DropdownMenuCheckboxItem
//               checked={modes.includes("unassigned-group")}
//               onCheckedChange={() => toggleMode("unassigned-group")}
//             >
//               Unassigned Group
//             </DropdownMenuCheckboxItem>

//             <DropdownMenuCheckboxItem
//               checked={modes.includes("unassigned-room")}
//               onCheckedChange={() => toggleMode("unassigned-room")}
//             >
//               Unassigned Room
//             </DropdownMenuCheckboxItem>

//             <DropdownMenuCheckboxItem
//               checked={modes.includes("assigned-both")}
//               onCheckedChange={() => toggleMode("assigned-both")}
//             >
//               Assigned Both
//             </DropdownMenuCheckboxItem>

//             <DropdownMenuCheckboxItem
//               checked={modes.includes("unassigned")}
//               onCheckedChange={() => toggleMode("unassigned")}
//             >
//               Unassigned
//             </DropdownMenuCheckboxItem>

//             <DropdownMenuSeparator />

//             <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
//               Gender
//             </DropdownMenuLabel>

//             <DropdownMenuCheckboxItem
//               checked={modes.includes("male")}
//               onCheckedChange={() => toggleMode("male")}
//             >
//               Male
//             </DropdownMenuCheckboxItem>

//             <DropdownMenuCheckboxItem
//               checked={modes.includes("female")}
//               onCheckedChange={() => toggleMode("female")}
//             >
//               Female
//             </DropdownMenuCheckboxItem>

//             <DropdownMenuSeparator />

//             <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
//               Report To Venue
//             </DropdownMenuLabel>

//             <DropdownMenuCheckboxItem
//               checked={modes.includes("reported")}
//               onCheckedChange={() => toggleMode("reported")}
//             >
//               Reported
//             </DropdownMenuCheckboxItem>

//             <DropdownMenuCheckboxItem
//               checked={modes.includes("not-reported")}
//               onCheckedChange={() => toggleMode("not-reported")}
//             >
//               Not Reported
//             </DropdownMenuCheckboxItem>
//           </DropdownMenuContent>
//         </DropdownMenu>

//         {/* 🎯 AGE RANGE */}
//         {modes.includes("age-range") && (
//           <div className="w-[220px] bg-zinc-900 border border-zinc-800 rounded-md p-3">
//             <div className="flex justify-between text-xs mb-2">
//               <span>Age Range</span>
//               <span>
//                 {ageRange[0]} - {ageRange[1]}
//               </span>
//             </div>

//             <Slider
//               value={ageRange}
//               min={0}
//               max={100}
//               step={1}
//               onValueChange={(v) => setAgeRange(v as [number, number])}
//             />
//           </div>
//         )}
//       </div>

//       {/* 📊 CHART */}
//       <Card className="bg-zinc-900 border-zinc-800 w-full mx-auto focus:outline-none outline-none focus:ring-0 focus-visible:ring-0 ring-0 shadow-none">
//         <CardContent className="p-6 flex flex-col items-center ">
//           <h2 className="text-lg font-medium mb-1">Gender Distribution</h2>

//           <p className="text-xs text-zinc-400 mb-6">
//             Based on selected filters
//           </p>

//           <RadialBarChart
//             width={300}
//             height={180}
//             data={[
//               { name: "Male", value: male, fill: "#3b82f6" },
//               { name: "Female", value: female, fill: "#93c5fd" },
//             ]}
//             startAngle={180}
//             endAngle={0}
//             innerRadius="70%"
//             outerRadius="100%"

//           >
//             <PolarAngleAxis
//               type="number"
//               domain={[0, total || 1]}
//               tick={false}
//             />

//             <Tooltip
//               content={({ active, payload }) => {
//                 if (active && payload && payload.length) {
//                   const data = payload[0].payload;
//                   return (
//                     <div className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-md text-xs">
//                       <p className="font-medium">{data.name}</p>
//                       <p className="text-zinc-400">Count: {data.value}</p>
//                     </div>
//                   );
//                 }
//                 return null;
//               }}
//             />

//             <RadialBar dataKey="value" cornerRadius={10} background />
//           </RadialBarChart>

//           {/* CENTER */}
//           <div className="-mt-16 text-center">
//             <p className="text-3xl font-semibold">{total}</p>
//             <p className="text-xs text-zinc-400">Delegates</p>
//           </div>

//           {/* FOOTER */}
//           {/* <p className="mt-6 text-sm text-zinc-400">
//             Male: {male} • Female: {female}
//           </p> */}

//           <div className="flex items-center justify-center gap-6 mt-6 text-sm">
//             {/* Male */}
//             <div className="flex items-center gap-2">
//               <span className="w-3 h-3 rounded-full bg-blue-500" />
//               <span className="text-zinc-300">Male : {male}</span>
//             </div>

//             {/* Female */}
//             <div className="flex items-center gap-2">
//               <span className="w-3 h-3 rounded-full bg-blue-300" />
//               <span className="text-zinc-300">Female : {female}</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";

import { Slider } from "@/components/ui/slider";
import { Tooltip } from "recharts";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { RotateCw } from "lucide-react";

interface User {
  _id: string;
  name: string;
  age: number | null;
  gender: string;
  roomId: string | null;
  groupId: string | null;
  reportedToVenue?: boolean;
  paymentVerified?: boolean;
}

const AGE_BUCKETS = [
  { label: "0–17", min: 0, max: 17 },
  { label: "18–24", min: 18, max: 24 },
  { label: "25–34", min: 25, max: 34 },
  { label: "35–44", min: 35, max: 44 },
  { label: "45–59", min: 45, max: 59 },
  { label: "60+", min: 60, max: 999 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-md text-xs">
        <p className="font-medium text-zinc-100">{label}</p>
        <p className="text-zinc-400">Count: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modes, setModes] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    };
    fetchUsers();
  }, []);

  const toggleMode = (mode: string) => {
    setModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  const processedUsers = useMemo(() => {
    let result = users;

    if (modes.length > 0) {
      const genderModes = modes.filter((m) => m === "male" || m === "female");
      const otherModes = modes.filter((m) => m !== "male" && m !== "female");

      result = result.filter((u) => {
        const genderMatch =
          genderModes.length === 0 ||
          genderModes.some((mode) => u.gender?.toLowerCase() === mode);

        const otherMatch = otherModes.every((mode) => {
          switch (mode) {
            case "unassigned-group":
              return !u.groupId;
            case "unassigned-room":
              return !u.roomId;
            case "assigned-both":
              return u.roomId && u.groupId;
            case "unassigned":
              return !u.roomId && !u.groupId;
            case "reported":
              return u.reportedToVenue === true;
            case "not-reported":
              return !u.reportedToVenue;
            case "payment-verified":
              return u.paymentVerified === true;
            case "payment-unverified":
              return !u.paymentVerified;
            case "age-range":
              return (
                u.age !== null && u.age >= ageRange[0] && u.age <= ageRange[1]
              );
            default:
              return true;
          }
        });

        return genderMatch && otherMatch;
      });
    }

    return result;
  }, [users, modes, ageRange]);

  // Gender stats
  const { male, female } = useMemo(() => {
    let male = 0;
    let female = 0;
    processedUsers.forEach((u) => {
      if (u.gender?.toLowerCase() === "male") male++;
      if (u.gender?.toLowerCase() === "female") female++;
    });
    return { male, female };
  }, [processedUsers]);

  const total = male + female;

  // Age distribution
  const ageData = useMemo(() => {
    return AGE_BUCKETS.map((bucket) => ({
      label: bucket.label,
      count: processedUsers.filter(
        (u) => u.age !== null && u.age >= bucket.min && u.age <= bucket.max,
      ).length,
    }));
  }, [processedUsers]);

  // Assignment status
  const assignmentData = useMemo(() => {
    const assignedBoth = processedUsers.filter(
      (u) => u.roomId && u.groupId,
    ).length;
    const roomOnly = processedUsers.filter(
      (u) => u.roomId && !u.groupId,
    ).length;
    const groupOnly = processedUsers.filter(
      (u) => !u.roomId && u.groupId,
    ).length;
    const neitherAssigned = processedUsers.filter(
      (u) => !u.roomId && !u.groupId,
    ).length;

    return [
      { label: "Both", count: assignedBoth, color: "#22c55e" },
      { label: "Room Only", count: roomOnly, color: "#3b82f6" },
      { label: "Group Only", count: groupOnly, color: "#a855f7" },
      { label: "Neither", count: neitherAssigned, color: "#f97316" },
    ];
  }, [processedUsers]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
      <h1 className="text-3xl font-semibold mb-6">Analytics</h1>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-md">
              Filters {modes.length > 0 && `(${modes.length})`}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 bg-zinc-900 border border-zinc-800 text-zinc-100">
            <DropdownMenuLabel>Filter Users</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
              Age
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={modes.includes("age-range")}
              onCheckedChange={() => toggleMode("age-range")}
            >
              Age Range
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
              Rooms and Groups
            </DropdownMenuLabel>

            {[
              "unassigned-group",
              "unassigned-room",
              "assigned-both",
              "unassigned",
            ].map((m) => (
              <DropdownMenuCheckboxItem
                key={m}
                checked={modes.includes(m)}
                onCheckedChange={() => toggleMode(m)}
              >
                {m.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
              Gender
            </DropdownMenuLabel>

            {["male", "female"].map((m) => (
              <DropdownMenuCheckboxItem
                key={m}
                checked={modes.includes(m)}
                onCheckedChange={() => toggleMode(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
              Report To Venue
            </DropdownMenuLabel>

            {["reported", "not-reported"].map((m) => (
              <DropdownMenuCheckboxItem
                key={m}
                checked={modes.includes(m)}
                onCheckedChange={() => toggleMode(m)}
              >
                {m.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
              Payment Verification
            </DropdownMenuLabel>

            {["payment-verified", "payment-unverified"].map((m) => (
              <DropdownMenuCheckboxItem
                key={m}
                checked={modes.includes(m)}
                onCheckedChange={() => toggleMode(m)}
              >
                {m.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {modes.includes("age-range") && (
          <div className="w-[220px] bg-zinc-900 border border-zinc-800 rounded-md p-3">
            <div className="flex justify-between text-xs mb-2">
              <span>Age Range</span>
              <span>
                {ageRange[0]} - {ageRange[1]}
              </span>
            </div>
            <Slider
              value={ageRange}
              min={0}
              max={100}
              step={1}
              onValueChange={(v) => setAgeRange(v as [number, number])}
              className="
    w-full

    /* Track (full line) */
    [&>.relative]:h-1
    [&>.relative]:bg-zinc-700
    [&>.relative]:rounded-full

    /* Range (active part) */
    [&>.relative>span]:bg-white
    [&>.relative>span]:rounded-full

    /* Thumb */
    [&_[role=slider]]:h-3
    [&_[role=slider]]:w-3
    [&_[role=slider]]:bg-white
    [&_[role=slider]]:border
    [&_[role=slider]]:border-zinc-900
    [&_[role=slider]]:rounded-full
    [&_[role=slider]]:shadow-sm
  "
            />
          </div>
        )}

        <div>
          <button
            onClick={() => window.location.reload()}
            className="block w-full flex gap-2 items-center justify-center text-[16px] bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-md text-sm hover:bg-zinc-800 cursor-pointer"
          >
            Refresh <RotateCw size={"18px"} />
          </button>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Gender Radial Chart */}
        <Card className="bg-zinc-900 border-zinc-800 focus:outline-none outline-none focus:ring-0 focus-visible:ring-0 ring-0 shadow-none">
          <CardContent className="p-6 flex flex-col items-center">
            <h2 className="text-lg font-medium mb-1">Gender Distribution</h2>
            <p className="text-xs text-zinc-400 mb-6">
              Based on selected filters
            </p>

            <RadialBarChart
              width={300}
              height={180}
              data={[
                { name: "Male", value: male, fill: "#3b82f6" },
                { name: "Female", value: female, fill: "#8B5AED" },
              ]}
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="100%"
            >
              <PolarAngleAxis
                type="number"
                domain={[0, total || 1]}
                tick={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-md text-xs">
                        <p className="font-medium">{d.name}</p>
                        <p className="text-zinc-400">Count: {d.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <RadialBar dataKey="value" cornerRadius={10} background />
            </RadialBarChart>

            <div className="-mt-16 text-center">
              <p className="text-3xl font-semibold">{total}</p>
              <p className="text-xs text-zinc-400">Delegates</p>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-zinc-300">Male : {male}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8B5AED]" />
                <span className="text-zinc-300">Female : {female}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Age Distribution Bar Chart */}
        <Card className="bg-zinc-900 border-zinc-800 focus:outline-none outline-none focus:ring-0 focus-visible:ring-0 ring-0 shadow-none">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-1">Age Distribution</h2>
            <p className="text-xs text-zinc-400 mb-6">
              Delegates grouped by age bracket
            </p>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={ageData.map((d) => ({ name: d.label, count: d.count }))}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3f3f46"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {ageData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={`hsl(${200 + i * 20}, 80%, ${55 + i * 3}%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 justify-center">
              {ageData.map((b, i) => (
                <div
                  key={b.label}
                  className="flex items-center gap-1.5 text-xs text-zinc-400"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{
                      background: `hsl(${200 + i * 20}, 80%, ${55 + i * 3}%)`,
                    }}
                  />
                  {b.label}: {b.count}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Status Bar Chart */}
        <Card className="bg-zinc-900 border-zinc-800 focus:outline-none outline-none focus:ring-0 focus-visible:ring-0 ring-0 shadow-none">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-1">Assignment Status</h2>
            <p className="text-xs text-zinc-400 mb-6">
              Room & group assignment breakdown
            </p>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={assignmentData.map((d) => ({
                  name: d.label,
                  count: d.count,
                  color: d.color,
                }))}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3f3f46"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {assignmentData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 justify-center">
              {assignmentData.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center gap-1.5 text-xs text-zinc-400"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ background: d.color }}
                  />
                  {d.label}: {d.count}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
