"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxContent,
  ComboboxEmpty,
} from "@/components/ui/combobox";

import { cn } from "@/lib/utils";

export default function AssignCombobox({
  value,
  options,
  placeholder,
  onChange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <div
        className="flex items-center justify-between w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-md text-sm cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-zinc-200">
          {value ? options[value] : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-zinc-400" />
      </div>

      <ComboboxContent className="bg-zinc-950 border border-zinc-800 text-white">
        <ComboboxInput
          placeholder="Search..."
          className="bg-zinc-900 border-none focus:outline-none"
        />

        <ComboboxList>
          <ComboboxEmpty>No results found.</ComboboxEmpty>

          {Object.entries(options).map(([id, name]) => (
            <ComboboxItem
              key={id}
              value={name}
              onSelect={() => {
                onChange(id);
                setOpen(false);
              }}
              className="flex items-center justify-between cursor-pointer focus:bg-zinc-800"
            >
              {name}

              {value === id && (
                <Check className="h-4 w-4 text-green-400" />
              )}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}