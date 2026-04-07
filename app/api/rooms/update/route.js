import clientPromise from "../../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { roomId, name, limit } = await req.json();

    if (!roomId) {
      return Response.json({
        success: false,
        error: "Room ID required",
      });
    }

    if (!name?.trim()) {
      return Response.json({
        success: false,
        error: "Room name required",
      });
    }

    const parsedLimit = Number(limit);

    if (!parsedLimit || parsedLimit <= 0) {
      return Response.json({
        success: false,
        error: "Invalid room limit",
      });
    }

    const client = await clientPromise;
    const db = client.db("yfc");

    await db.collection("rooms").updateOne(
      { _id: new ObjectId(roomId) },
      {
        $set: {
          name: name.trim(),
          limit: parsedLimit,
          updatedAt: new Date(),
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