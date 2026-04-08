import { NextResponse } from "next/server";
import clientPromise from "../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { userId, reported } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("yfc");

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          reportedToVenue: reported,
          reportedAt: reported ? new Date() : null,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to update" },
      { status: 500 }
    );
  }
}