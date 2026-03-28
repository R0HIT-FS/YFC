import clientPromise from "../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, roomId } = body;

    if (!userId || !roomId) {
      return Response.json({
        success: false,
        error: "userId and roomId required",
      });
    }

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(roomId)) {
      return Response.json({
        success: false,
        error: "Invalid IDs",
      });
    }

    const client = await clientPromise;
    const db = client.db("yfc");

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          roomId: new ObjectId(roomId),
        },
      }
    );

    return Response.json({
      success: true,
      message: "User assigned to room",
      result,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}