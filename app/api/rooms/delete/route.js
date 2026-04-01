// import clientPromise from "../../../lib/db";
// import { ObjectId } from "mongodb";

// export async function POST(req) {
//   try {
//     const { roomId } = await req.json();

//     if (!roomId || !ObjectId.isValid(roomId)) {
//       return Response.json({
//         success: false,
//         error: "Invalid roomId",
//       });
//     }

//     const client = await clientPromise;
//     const db = client.db("yfc");

//     const roomsCollection = db.collection("rooms");
//     const usersCollection = db.collection("users");

//     // 1. Remove room
//     await roomsCollection.deleteOne({
//       _id: new ObjectId(roomId),
//     });

//     // 2. Remove room from users (IMPORTANT ✅)
//     await usersCollection.updateMany(
//       { roomId: new ObjectId(roomId) },
//       {
//         $unset: { roomId: "" },
//       }
//     );

//     return Response.json({
//       success: true,
//       message: "Room deleted",
//     });
//   } catch (error) {
//     return Response.json({
//       success: false,
//       error: error.message,
//     });
//   }
// }


// api/rooms/delete/route.ts
import clientPromise from "../../../lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache"; // IMPORT THIS

export async function POST(req) {
  try {
    const { roomId } = await req.json();

    if (!roomId || !ObjectId.isValid(roomId)) {
      return Response.json({ success: false, error: "Invalid roomId" });
    }

    const client = await clientPromise;
    const db = client.db("yfc");

    const roomsCollection = db.collection("rooms");
    const usersCollection = db.collection("users");

    await roomsCollection.deleteOne({ _id: new ObjectId(roomId) });
    await usersCollection.updateMany(
      { roomId: new ObjectId(roomId) },
      { $unset: { roomId: "" } }
    );

    // PURGE THE CACHE
    revalidatePath("/rooms"); 

    return Response.json({ success: true, message: "Room deleted" });
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}