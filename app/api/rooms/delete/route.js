import clientPromise from "../../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { roomId } = await req.json();

    const client = await clientPromise;
    const db = client.db("yfc");

    const users = db.collection("users");
    const rooms = db.collection("rooms");

    const roomObjectId = new ObjectId(roomId);

    // 🔥 Ensure room is empty
    const count = await users.countDocuments({
      roomId: roomObjectId,
    });

    if (count > 0) {
      return Response.json({
        success: false,
        error: "Room not empty",
      });
    }

    await rooms.deleteOne({ _id: roomObjectId });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}