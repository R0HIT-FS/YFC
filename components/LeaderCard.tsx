"use client";

import React from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface User {
  _id: string;
  name?: string | null;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  churchName?: string | null;
  phone? : string | number | null | undefined;
  groupId?: string | null;
  roomId?: string | null;
  roomMap?: any;
  groupMap?: any;
}

interface Group {
  _id: string;
  name?: string | null;
}

export default function LeaderCard({
  group,
  users,
  roomMap,
    groupMap,
}: {
  group: Group;
  users: User[];
  roomMap: Record<string, string>;
  groupMap: Record<string, string>;
}) {

const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-5">
      {/* Group Title */}
      {/* <h3 className="text-lg font-semibold mb-4">
        {group.name || "Unnamed Group"}
      </h3> */}

      <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex w-full flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4 w-full">
        <h1 className="text-lg font-semibold">{group.name || "Unnamed Group"}</h1>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <ChevronsUpDown />
            <span className="sr-only">Toggle details</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-2">
              <div className="grid gap-3">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 relative"
            >
              {/* Name */}
              <p className="text-sm font-medium">
                {user.name} , <span className="text-zinc-400">{user.age}</span>
              </p>

              {/* 🔥 Expand Button */}
              <div className="absolute top-2 right-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      <Maximize2 size={14} />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 focus:ring-0 focus-visible:ring-0 ring-0 shadow-none">
                    <DialogHeader>
                      <DialogTitle>Information</DialogTitle>
                      <DialogDescription>Details of the group member</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                      {/* BASIC DETAILS */}
                      <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
                        {[
                          { label: "Name", value: user.name },
                        //   { label: "Email", value: user.email },
                          { label: "Age", value: user.age },
                          { label: "Gender", value: user.gender },
                          { label: "Phone", value: user.phone },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex justify-between px-4 py-2 text-sm"
                          >
                            <span className="text-zinc-400">{label}</span>
                            <span onClick={() => {navigator.clipboard.writeText(String(value)); toast.success("Copied to Clipboard")}}>{value || "-"}</span>
                          </div>
                        ))}
                      </div>

                      {/* ASSIGNMENTS */}
                      <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
                        {[
                          {
                            label: "Room",
                            value: user.roomId
                              ? roomMap[user.roomId] || "Unknown Room"
                              : null,
                          },
                        //   {
                        //     label: "Group",
                        //     value: user.groupId
                        //       ? groupMap[user.groupId] || "Unknown Group"
                        //       : null,
                        //   },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex justify-between px-4 py-2 text-sm"
                          >
                            <span className="text-zinc-400">{label}</span>
                            <span onClick={() => {navigator.clipboard.writeText(String(value)); toast.success("Copied to Clipboard")}}>{value || "Unassigned"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-zinc-500 italic">No users in this group</p>
        )}
      </div>
      </CollapsibleContent>
    </Collapsible>
    </div>
  );
}
