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

import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface User {
  _id: string;
  name: string;
  age: number | null;
  gender: string;
  roomId: string | null;
  groupId: string | null;
  reportedToVenue?: boolean;
}

export default function AnalyticsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modes, setModes] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);

  // 🔥 fetch users
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

  // ✅ FILTER LOGIC (FIXED)
  const processedUsers = useMemo(() => {
    let result = users;

    if (modes.length > 0) {
      const genderModes = modes.filter((m) => m === "male" || m === "female");

      const otherModes = modes.filter((m) => m !== "male" && m !== "female");

      result = result.filter((u) => {
        // OR for gender
        const genderMatch =
          genderModes.length === 0 ||
          genderModes.some((mode) => u.gender?.toLowerCase() === mode);

        // AND for others
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

  // ✅ GENDER STATS
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
      <h1 className="text-3xl font-semibold mb-6">Analytics</h1>

      {/* 🔽 FILTERS */}
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

            <DropdownMenuCheckboxItem
              checked={modes.includes("unassigned-group")}
              onCheckedChange={() => toggleMode("unassigned-group")}
            >
              Unassigned Group
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={modes.includes("unassigned-room")}
              onCheckedChange={() => toggleMode("unassigned-room")}
            >
              Unassigned Room
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={modes.includes("assigned-both")}
              onCheckedChange={() => toggleMode("assigned-both")}
            >
              Assigned Both
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={modes.includes("unassigned")}
              onCheckedChange={() => toggleMode("unassigned")}
            >
              Unassigned
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
              Gender
            </DropdownMenuLabel>

            <DropdownMenuCheckboxItem
              checked={modes.includes("male")}
              onCheckedChange={() => toggleMode("male")}
            >
              Male
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={modes.includes("female")}
              onCheckedChange={() => toggleMode("female")}
            >
              Female
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="bg-zinc-700 rounded-lg">
              Report To Venue
            </DropdownMenuLabel>

            <DropdownMenuCheckboxItem
              checked={modes.includes("reported")}
              onCheckedChange={() => toggleMode("reported")}
            >
              Reported
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={modes.includes("not-reported")}
              onCheckedChange={() => toggleMode("not-reported")}
            >
              Not Reported
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 🎯 AGE RANGE */}
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
            />
          </div>
        )}
      </div>

      {/* 📊 CHART */}
      <Card className="bg-zinc-900 border-zinc-800 w-full mx-auto focus:outline-none outline-none focus:ring-0 focus-visible:ring-0 ring-0 shadow-none">
        <CardContent className="p-6 flex flex-col items-center ">
          <h2 className="text-lg font-medium mb-1">Gender Distribution</h2>

          <p className="text-xs text-zinc-400 mb-6">
            Based on selected filters
          </p>

          <RadialBarChart
            width={300}
            height={180}
            data={[
              { name: "Male", value: male, fill: "#3b82f6" },
              { name: "Female", value: female, fill: "#93c5fd" },
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
                  const data = payload[0].payload;
                  return (
                    <div className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-md text-xs">
                      <p className="font-medium">{data.name}</p>
                      <p className="text-zinc-400">Count: {data.value}</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <RadialBar dataKey="value" cornerRadius={10} background />
          </RadialBarChart>

          {/* CENTER */}
          <div className="-mt-16 text-center">
            <p className="text-3xl font-semibold">{total}</p>
            <p className="text-xs text-zinc-400">Delegates</p>
          </div>

          {/* FOOTER */}
          {/* <p className="mt-6 text-sm text-zinc-400">
            Male: {male} • Female: {female}
          </p> */}

          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            {/* Male */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-zinc-300">Male : {male}</span>
            </div>

            {/* Female */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-300" />
              <span className="text-zinc-300">Female : {female}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
