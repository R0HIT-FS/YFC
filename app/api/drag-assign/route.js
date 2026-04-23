import clientPromise from "../../lib/db";
// import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { assignments } = await req.json();

    const client = await clientPromise;
    const db = client.db("yfc");

    const ops = assignments.map((a) => ({
      updateOne: {
        filter: { _id: new ObjectId(String(a.userId)) },
        update: {
          $set: {
            groupId: a.groupId,
            updatedAt: new Date(),
          },
        },
      },
    }));

    if (ops.length) {
      await db.collection("users").bulkWrite(ops);
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}