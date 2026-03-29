import clientPromise from "../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const { userId, groupId } = await req.json();

  const client = await clientPromise;
  const db = client.db("yfc");

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        groupId: new ObjectId(groupId),
      },
    }
  );

  return Response.json({ success: true });
}