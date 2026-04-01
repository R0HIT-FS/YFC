// "use client";

// import { useRouter } from "next/navigation";
// import { toast } from "sonner";

// export default function GroupCard({ group, users }) {
//   const router = useRouter();

//   const groupUsers = users.filter(
//     (u) => u.groupId === group._id
//   );

//   const removeUser = async (userId) => {
//     const res = await fetch("/api/remove-from-group", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ userId }),
//     });

//     const data = await res.json();

//     if (data.success) {
//       toast.success("User removed", {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//       router.refresh();
//     } else {
//       toast.error("Error removing user", {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//     }
//   };

//   return (
//     <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
//       {/* Group Name (Leader Name) */}
//       <h2 className="text-lg font-semibold">{group.name}</h2>

//       {/* Leader Label */}
//       <p className="text-xs text-zinc-400 mb-3">
//         Leader: {group.name}
//       </p>

//       {/* User Count */}
//       <p className="text-xs text-zinc-500 mb-3">
//         {groupUsers.length} members
//       </p>

//       {/* Users */}
//       <div className="space-y-2">
//         {groupUsers.length > 0 ? (
//           groupUsers.map((user) => (
//             <div
//               key={user._id}
//               className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded-md text-sm text-zinc-300"
//             >
//               <span>{user.name}</span>

//               <button
//                 onClick={() => removeUser(user._id)}
//                 className="text-xs text-red-400 hover:text-red-300"
//               >
//                 Remove
//               </button>
//             </div>
//           ))
//         ) : (
//           <p className="text-sm text-zinc-500">
//             No users in this group
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useRouter } from "next/navigation";
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
// import { CircleMinus } from "lucide-react";

// export default function GroupCard({ group, users }) {
//   const router = useRouter();

//   const groupUsers = users.filter(
//     (u) => u.groupId === group._id
//   );

//   // 🔥 Remove user from group
//   const removeUser = async (userId) => {
//     const res = await fetch("/api/remove-from-group", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ userId }),
//     });

//     const data = await res.json();

//     if (data.success) {
//       toast.success("User removed", {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//       router.refresh();
//     } else {
//       toast.error(data.error || "Error removing user", {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//     }
//   };

//   // 🔥 Delete group
//   const deleteGroup = async () => {
//     const res = await fetch("/api/groups/delete", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ groupId: group._id }),
//     });

//     const data = await res.json();

//     if (data.success) {
//       toast.success("Group deleted", {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//       router.refresh();
//     } else {
//       toast.error(data.error || "Error deleting group", {
//         position: 'bottom-right',
//         duration: 3000,
//       });
//     }
//   };

//   return (
//     <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
//       {/* Group Name */}
//       <h2 className="text-lg font-semibold">{group.name}'s Group</h2>

//       {/* Leader Label */}
//       <p className="text-xs text-zinc-400 mb-3">
//        Group Leader: {group.name}
//       </p>

//       {/* Count */}
//       <p className="text-xs text-zinc-500 mb-3">
//         {groupUsers.length} members
//       </p>

//       {/* Users */}
//       <div className="space-y-2">
//         {groupUsers.length > 0 ? (
//           groupUsers.map((user) => (
//             <div
//               key={user._id}
//               className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded-md text-sm text-zinc-300"
//             >
//               <span>{user.name}</span>

//               {/* 🔥 Remove Dialog */}
//               <AlertDialog>
//                 <AlertDialogTrigger asChild>
//                   <button className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
//                     {/* Remove */}
//                     <CircleMinus size={'18px'}/>
//                   </button>
//                 </AlertDialogTrigger>

//                 <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 outline-none ring-0 shadow-none">
//                   <AlertDialogHeader>
//                     <AlertDialogTitle>
//                       Remove User
//                     </AlertDialogTitle>

//                     <AlertDialogDescription className="text-zinc-400">
//                       Remove{" "}
//                       <span className="text-zinc-200 font-medium">
//                         {user.name}
//                       </span>{" "}
//                       from this group?
//                     </AlertDialogDescription>
//                   </AlertDialogHeader>

//                   <AlertDialogFooter>
//                     <AlertDialogCancel className="bg-zinc-800 border border-zinc-700 text-zinc-200">
//                       Cancel
//                     </AlertDialogCancel>

//                     <AlertDialogAction
//                       onClick={() => removeUser(user._id)}
//                       className="bg-red-500 hover:bg-red-600 text-white"
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
//             No users in this group
//           </p>
//         )}
//       </div>

//       {/* 🔥 Delete Group */}
//       {groupUsers.length === 0 && (
//         <AlertDialog>
//           <AlertDialogTrigger asChild>
//             <button className="mt-4 text-xs text-red-400 hover:text-red-300 cursor-pointer">
//               Delete Group
//             </button>
//           </AlertDialogTrigger>

//           <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 outline-none ring-0 shadow-none">
//             <AlertDialogHeader>
//               <AlertDialogTitle className="text-red-500">
//                 Delete Group
//               </AlertDialogTitle>

//               <AlertDialogDescription className="text-zinc-400">
//                 This action cannot be undone.
//                 <br />
//                 Delete{" "}
//                 <span className="text-red-400 font-medium">
//                   {group.name}
//                 </span>
//                 ?
//               </AlertDialogDescription>
//             </AlertDialogHeader>

//             <AlertDialogFooter>
//               <AlertDialogCancel className="bg-zinc-800 border border-zinc-700 text-zinc-200">
//                 Cancel
//               </AlertDialogCancel>

//               <AlertDialogAction
//                 onClick={deleteGroup}
//                 className="bg-red-600 hover:bg-red-700 text-white"
//               >
//                 Delete
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       )}
//     </div>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
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
import { CircleMinus } from "lucide-react";

interface User {
  _id?: string;
  name?: string;
  groupId?: string | null;
  roomId?: string | null;
}

interface Group {
  _id?: string;
  name?: string;
}

interface GroupCardProps {
  group: Group;
  users: User[];
}

export default function GroupCard({ group, users }: GroupCardProps) {
  const router = useRouter();

  const groupUsers = users.filter((u) => u.groupId === group._id);

  const removeUser = async (userId: string) => {
    const res = await fetch("/api/remove-from-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("User removed", { position: "bottom-right", duration: 3000 });
      router.refresh();
    } else {
      toast.error(data.error || "Error removing user", { position: "bottom-right", duration: 3000 });
    }
  };

  const deleteGroup = async () => {
    const res = await fetch("/api/groups/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: group._id }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Group deleted", { position: "bottom-right", duration: 3000 });
      router.refresh();
    } else {
      toast.error(data.error || "Error deleting group", { position: "bottom-right", duration: 3000 });
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold">{group.name}'s Group</h2>

      <p className="text-xs text-zinc-400 mb-3">Group Leader: {group.name}</p>

      <p className="text-xs text-zinc-500 mb-3">{groupUsers.length} members</p>

      <div className="space-y-2">
        {groupUsers.length > 0 ? (
          groupUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded-md text-sm text-zinc-300"
            >
              <span>{user.name}</span>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
                    <CircleMinus size={18} />
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 outline-none ring-0 shadow-none">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove User</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                      Remove{" "}
                      <span className="text-zinc-200 font-medium">{user.name}</span>{" "}
                      from this group?
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
          <p className="text-sm text-zinc-500">No users in this group</p>
        )}
      </div>

      {groupUsers.length === 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="mt-4 text-xs text-red-400 hover:text-red-300 cursor-pointer">
              Delete Group
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 outline-none ring-0 shadow-none">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-500">Delete Group</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                This action cannot be undone.
                <br />
                Delete{" "}
                <span className="text-red-400 font-medium">{group.name}</span>?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="bg-zinc-800 border border-zinc-700 text-zinc-200">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteGroup}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}