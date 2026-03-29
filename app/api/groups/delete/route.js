import clientPromise from "../../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { groupId } = await req.json();

    // 🔴 Validate input
    if (!groupId) {
      return Response.json({
        success: false,
        error: "groupId is required",
      });
    }

    const client = await clientPromise;
    const db = client.db("yfc");

    const groupsCollection = db.collection("groups");
    const usersCollection = db.collection("users");

    // 🔍 Check if group exists
    const group = await groupsCollection.findOne({
      _id: new ObjectId(groupId),
    });

    if (!group) {
      return Response.json({
        success: false,
        error: "Group not found",
      });
    }

    // ⚠️ Check if group has users
    const usersInGroup = await usersCollection.countDocuments({
      groupId: new ObjectId(groupId),
    });

    if (usersInGroup > 0) {
      return Response.json({
        success: false,
        error: "Cannot delete group with users",
      });
    }

    // 🗑 Delete group
    await groupsCollection.deleteOne({
      _id: new ObjectId(groupId),
    });

    return Response.json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}