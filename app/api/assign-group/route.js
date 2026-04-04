import clientPromise from "../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { userId, groupId } = await req.json();

    if (!userId || !groupId) {
      return Response.json({
        success: false,
        error: "Missing userId or groupId",
      });
    }

    const client = await clientPromise;
    const db = client.db("yfc");

    const users = db.collection("users");
    const groups = db.collection("groups");

    const userObjectId = new ObjectId(userId);
    const groupObjectId = new ObjectId(groupId);

    const group = await groups.findOne({ _id: groupObjectId });
    if (!group) {
      return Response.json({
        success: false,
        error: "Group not found",
      });
    }

    const user = await users.findOne({ _id: userObjectId });
    if (!user) {
      return Response.json({
        success: false,
        error: "User not found",
      });
    }

    await users.updateOne(
      { _id: userObjectId },
      {
        $set: {
          groupId: groupObjectId,
          updatedAt: new Date(), // 🔥 important
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