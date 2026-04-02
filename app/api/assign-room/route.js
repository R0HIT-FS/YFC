import clientPromise from "../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { userId, roomId } = await req.json();

    const client = await clientPromise;
    const db = client.db("yfc");

    const usersCollection = db.collection("users");
    const roomsCollection = db.collection("rooms");

    const roomObjectId = new ObjectId(roomId);

    // 🔥 1. Get room
    const room = await roomsCollection.findOne({ _id: roomObjectId });

    if (!room) {
      return Response.json({
        success: false,
        error: "Room not found",
      });
    }

    // 🔥 2. Count users in room
    const count = await usersCollection.countDocuments({
      roomId: roomObjectId,
    });

    // 🔥 3. Check limit
    if (count >= room.limit) {
      return Response.json({
        success: false,
        error: "Room is full",
      });
    }

    // 🔥 4. Assign user
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          roomId: roomObjectId,
        },
      }
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}