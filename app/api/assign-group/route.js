import clientPromise from "../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { userId, groupId } = await req.json();

    const client = await clientPromise;
    const db = client.db("yfc");

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          groupId: new ObjectId(groupId),
          updatedAt: new Date(),
        },
      },
    );

    await db.collection("meta").updateOne(
      { key: "lastSync" },
      {
        $set: {
          time: new Date(),
          added: 0,
        },
      },
      { upsert: true },
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}
