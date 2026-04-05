// import clientPromise from "../../lib/db";
// import { ObjectId } from "mongodb";

// export async function POST(req) {
//   try {
//     const { userId } = await req.json();

//     if (!userId) {
//       return Response.json({
//         success: false,
//         error: "userId required",
//       });
//     }

//     const client = await clientPromise;
//     const db = client.db("yfc");

//     await db.collection("users").updateOne(
//       { _id: new ObjectId(userId) },
//       {
//         $unset: {
//           groupId: "", // ✅ removes group assignment
//         },
//       }
//     );

//     return Response.json({
//       success: true,
//       message: "User removed from group",
//     });
//   } catch (err) {
//     return Response.json({
//       success: false,
//       error: err.message,
//     });
//   }
// }


import clientPromise from "../../lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache"; // 1. Import this

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return Response.json({ success: false, error: "userId required" });
    }

    const client = await clientPromise;
    const db = client.db("yfc");

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      // { $unset: { groupId: "" } }
      $set: {
  groupId: null,
  updatedAt: new Date(),
}
    );

    // 2. Clear the cache for the groups page
    revalidatePath("/groups"); 

    return Response.json({
      success: true,
      message: "User removed from group",
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}