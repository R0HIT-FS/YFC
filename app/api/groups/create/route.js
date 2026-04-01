import clientPromise from "../../../lib/db";
import { revalidatePath } from "next/cache";

export async function POST(req) {
  try {
    const { name } = await req.json();

    if (!name || name.trim() === "") {
      return Response.json({
        success: false,
        error: "Group name is required",
      });
    }

    const client = await clientPromise;
    const db = client.db("yfc");

    const groupsCollection = db.collection("groups");

    // ✅ prevent duplicate group names
    const existing = await groupsCollection.findOne({ name });

    if (existing) {
      return Response.json({
        success: false,
        error: "Group already exists",
      });
    }

    const result = await groupsCollection.insertOne({
      name: name.trim(), // 👈 leader name stored here
      createdAt: new Date(),
    });

    revalidatePath("/groups");

    return Response.json({
      success: true,
      group: {
        _id: result.insertedId.toString(),
        name: name.trim(),
      },
    });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}