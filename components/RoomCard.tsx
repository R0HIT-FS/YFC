// "use client";

// import { useRouter } from "next/navigation";
// import { RoomHover } from "./RoomHover";
// import {
//   AlertDialog,
//   AlertDialogTrigger,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from "@/components/ui/alert-dialog";
// import { toast } from "sonner";
// import { CirclePlus } from "lucide-react";

// export default function RoomCard({ room, users }) {
//   const router = useRouter();

//   const roomUsers = users.filter(
//     (user) => user.roomId === room._id
//   );

//   // 🔥 Delete Room
//   const deleteRoom = async () => {
//     const res = await fetch("/api/rooms/delete", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ roomId: room._id }),
//     });

//     const data = await res.json();

//     if (data.success) {
//       toast.success("Room Deleted", {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//       router.refresh();
//     } else {
//       toast.error(data.error, {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//     }
//   };

//   // 🔥 Remove User
//   const removeUser = async (userId) => {
//     const res = await fetch("/api/remove-from-room", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ userId }),
//     });

//     const data = await res.json();

//     if (data.success) {
//       toast.success("Member removed", {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//       router.refresh();
//     } else {
//       toast.error(data.error, {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//     }
//   };

//   return (
//     <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
//       {/* Room Name */}
//       <h2 className="text-lg font-semibold mb-3">Room : {room.name}</h2>

//       {/* Count */}
//       <p className="text-xs text-zinc-400 mb-2">
//         {roomUsers.length} / {room.limit}
//       </p>

//       {/* Users */}
//       <div className="space-y-2">
//         {roomUsers.length > 0 ? (
//           roomUsers.map((user) => (
//             <div
//               key={user._id}
//               className="flex items-center justify-between text-sm text-zinc-300 bg-zinc-800 px-3 py-2 rounded-md"
//             >
//               <span>{user.name}</span>

//               {/* 🔥 Remove User Dialog */}
//               <AlertDialog>
//                 <AlertDialogTrigger asChild>
//                   <button className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
//                     Remove
//                   </button>
//                 </AlertDialogTrigger>

//                 <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 outline-none ring-0 focus:outline-none focus:ring-0 shadow-none">
//                   <AlertDialogHeader>
//                     <AlertDialogTitle>
//                       Remove User
//                     </AlertDialogTitle>

//                     <AlertDialogDescription className="text-zinc-400">
//                       Are you sure you want to remove{" "}
//                       <span className="text-zinc-200 font-medium">
//                         {user.name}
//                       </span>{" "}
//                       from this room?
//                     </AlertDialogDescription>
//                   </AlertDialogHeader>

//                   <AlertDialogFooter>
//                     <AlertDialogCancel className="bg-zinc-800 border border-zinc-700 text-zinc-200 focus:outline-none focus:ring-0">
//                       Cancel
//                     </AlertDialogCancel>

//                     <AlertDialogAction
//                       onClick={() => removeUser(user._id)}
//                       className="bg-red-500 hover:bg-red-600 text-white focus:outline-none focus:ring-0"
//                     >
//                       Remove
//                     </AlertDialogAction>
//                   </AlertDialogFooter>
//                 </AlertDialogContent>
//               </AlertDialog>
//             </div>
//           ))
//         ) : (
//           <p className="text-sm text-zinc-500">
//             No users in this room
//           </p>
//         )}
//       </div>

//       {/* Delete Room */}
//       {roomUsers.length === 0 ? (
//         <AlertDialog>
//           <AlertDialogTrigger asChild>
//             <button className="mt-4 text-xs text-red-400 hover:text-red-300 cursor-pointer">
//               Delete Room
//             </button>
//           </AlertDialogTrigger>

//           <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 outline-none ring-0 focus:outline-none focus:ring-0 shadow-none">
//             <AlertDialogHeader>
//               <AlertDialogTitle className="text-red-500">
//                 Delete Room
//               </AlertDialogTitle>

//               <AlertDialogDescription className="text-zinc-400">
//                 This action cannot be undone.
//                 <br />
//                 Are you sure you want to delete{" "}
//                 <span className="text-red-400 font-medium">
//                   {room.name}
//                 </span>
//                 ?
//               </AlertDialogDescription>
//             </AlertDialogHeader>

//             <AlertDialogFooter>
//               <AlertDialogCancel className="bg-zinc-800 border border-zinc-700 text-zinc-200 focus:outline-none focus:ring-0">
//                 Cancel
//               </AlertDialogCancel>

//               <AlertDialogAction
//                 onClick={deleteRoom}
//                 className="bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-0"
//               >
//                 Delete
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       ) : (
//         <>
//         <RoomHover />
//         </>
//       )}
//     </div>
//   );
// }


"use client";

import { useRouter } from "next/navigation";
import { RoomHover } from "./RoomHover";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  roomId: string | null;
  groupId: string | null;
}

interface Room {
  _id: string;
  name: string;
  limit: number;
}

interface RoomCardProps {
  room: Room;
  users: User[];
}

export default function RoomCard({ room, users }: RoomCardProps) {
  const router = useRouter();

  const roomUsers = users.filter((user) => user.roomId === room._id);

  const deleteRoom = async () => {
    const res = await fetch("/api/rooms/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: room._id }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Room Deleted", { position: "bottom-right", duration: 3000 });
      router.refresh();
    } else {
      toast.error(data.error, { position: "bottom-right", duration: 3000 });
    }
  };

  const removeUser = async (userId: string) => {
    const res = await fetch("/api/remove-from-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Member removed", { position: "bottom-right", duration: 3000 });
      router.refresh();
    } else {
      toast.error(data.error, { position: "bottom-right", duration: 3000 });
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-3">Room : {room.name}</h2>

      <p className="text-xs text-zinc-400 mb-2">
        {roomUsers.length} / {room.limit}
      </p>

      <div className="space-y-2">
        {roomUsers.length > 0 ? (
          roomUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between text-sm text-zinc-300 bg-zinc-800 px-3 py-2 rounded-md"
            >
              <span>{user.name}</span>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
                    Remove
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 outline-none ring-0 focus:outline-none focus:ring-0 shadow-none">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove User</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                      Are you sure you want to remove{" "}
                      <span className="text-zinc-200 font-medium">{user.name}</span>{" "}
                      from this room?
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-zinc-800 border border-zinc-700 text-zinc-200">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => removeUser(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500">No users in this room</p>
        )}
      </div>

      {roomUsers.length === 0 ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="mt-4 text-xs text-red-400 hover:text-red-300 cursor-pointer">
              Delete Room
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 outline-none ring-0 focus:outline-none focus:ring-0 shadow-none">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-500">Delete Room</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                This action cannot be undone.
                <br />
                Are you sure you want to delete{" "}
                <span className="text-red-400 font-medium">{room.name}</span>?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="bg-zinc-800 border border-zinc-700 text-zinc-200">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteRoom}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <RoomHover />
      )}
    </div>
  );
}