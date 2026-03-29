import clientPromise from "../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, limit } = body;

    if (!name || name.trim() === "") {
      return Response.json({
        success: false,
        error: "Room name is required",
      });
    }

    if (!limit || isNaN(limit) || Number(limit) <= 0) {
      return Response.json({
        success: false,
        error: "Valid limit is required",
      });
    }

    const client = await clientPromise;
    const db = client.db("yfc");

    const roomsCollection = db.collection("rooms");

    const existing = await roomsCollection.findOne({ name });

    if (existing) {
      return Response.json({
        success: false,
        error: "Room already exists",
      });
    }

    const result = await roomsCollection.insertOne({
      name: name.trim(),
      limit: Number(limit),
      createdAt: new Date(),
    });

    return Response.json({
      success: true,
      room: {
        _id: result.insertedId.toString(),
        name,
        limit,
      },
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}