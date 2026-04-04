// import clientPromise from "../../../lib/db";

// export async function GET() {
//   try {
//     const client = await clientPromise;
//     const db = client.db("yfc");

//     const rooms = await db.collection("rooms").find({}).toArray();

//     const formatted = rooms.map((room) => ({
//       ...room,
//       _id: room._id.toString(),
//     }));

//     return Response.json({
//       success: true,
//       rooms: formatted,
//     });
//   } catch (error) {
//     return Response.json({
//       success: false,
//       error: error.message,
//     });
//   }
// }

import clientPromise from "../../../lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("yfc");

    const rooms = await db
      .collection("rooms")
      .find({}, { projection: { name: 1, limit: 1, currentCount: 1 } })
      .toArray();

    return Response.json({
      success: true,
      rooms: rooms.map((room) => ({
        _id: room._id.toString(),
        name: room.name,
        limit: room.limit,
        currentCount: room.currentCount || 0,
      })),
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}