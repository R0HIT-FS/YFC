// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// export function MobileMenu() {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="outline"
//           className="text-white border border-white 
//           outline-none focus:outline-none focus:ring-0 
//           ring-0 ring-offset-0"
//         >
//           Menu
//         </Button>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent
//         className="text-white bg-zinc-950 border border-transparent 
//         outline-none focus:outline-none focus:ring-0 
//         ring-0 ring-offset-0 shadow-none"
//       >
//         <DropdownMenuGroup>
//           <a href="/">
//             <DropdownMenuItem
//               className="outline-none focus:outline-none focus:ring-0 
//             focus:bg-zinc-800 cursor-pointer"
//             >
//               Delegates
//             </DropdownMenuItem>
//           </a>

//           <a href="/rooms">
//             <DropdownMenuItem
//               className="outline-none focus:outline-none focus:ring-0 
//             focus:bg-zinc-800 cursor-pointer"
//             >
//               Rooms
//             </DropdownMenuItem>
//           </a>

//           <a href="/groups">
//             <DropdownMenuItem
//               className="outline-none focus:outline-none focus:ring-0 
//             focus:bg-zinc-800 cursor-pointer"
//             >
//               Groups
//             </DropdownMenuItem>
//           </a>

//           <DropdownMenuSeparator className="bg-zinc-800" />
//           <a href="/sync">
//             <DropdownMenuItem
//               className="outline-none focus:outline-none focus:ring-0 
//             focus:bg-zinc-800 cursor-pointer"
//             >
//               Sync
//             </DropdownMenuItem>
//           </a>
//         </DropdownMenuGroup>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }


"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { href: "/", label: "Delegates" },
  { href: "/rooms", label: "Rooms" },
  { href: "/groups", label: "Groups" },
  { href: "/sync", label: "Sync" },
];

export function MobileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="text-white border border-white 
          outline-none focus:outline-none focus:ring-0 
          ring-0 ring-offset-0"
        >
          Menu
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="text-white bg-zinc-950 border border-transparent 
        outline-none focus:outline-none focus:ring-0 
        ring-0 ring-offset-0 shadow-none"
      >
        <DropdownMenuGroup>
          {links.map((link, i) => (
            <Link key={link.href} href={link.href} prefetch>
              <DropdownMenuItem
                className="outline-none focus:outline-none focus:ring-0 
                focus:bg-zinc-800 cursor-pointer"
              >
                {link.label}
              </DropdownMenuItem>

              {/* separator before last item */}
              {i === 2 && (
                <DropdownMenuSeparator className="bg-zinc-800" />
              )}
            </Link>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}