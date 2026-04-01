// import clientPromise from "../../lib/db";
// import { ObjectId } from "mongodb";

// export async function POST(req) {
//   try {
//     const { userId } = await req.json();

//     if (!userId || !ObjectId.isValid(userId)) {
//       return Response.json({
//         success: false,
//         error: "Invalid userId",
//       });
//     }

//     const client = await clientPromise;
//     const db = client.db("yfc");

//     await db.collection("users").updateOne(
//       { _id: new ObjectId(userId) },
//       {
//         $unset: { roomId: "" }, // ✅ remove room
//       }
//     );

//     return Response.json({
//       success: true,
//       message: "User removed from room",
//     });
//   } catch (error) {
//     return Response.json({
//       success: false,
//       error: error.message,
//     });
//   }
// }


// api/remove-from-room/route.ts
import clientPromise from "../../lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache"; // IMPORT THIS

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId || !ObjectId.isValid(userId)) {
      return Response.json({ success: false, error: "Invalid userId" });
    }

    const client = await clientPromise;
    const db = client.db("yfc");

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $unset: { roomId: "" } }
    );

    // PURGE THE CACHE: Change "/rooms" to your actual page path
    revalidatePath("/rooms"); 

    return Response.json({ success: true, message: "User removed" });
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}