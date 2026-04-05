import clientPromise from "../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { userId } = await req.json();

    const client = await clientPromise;
    const db = client.db("yfc");

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          roomId: null,
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