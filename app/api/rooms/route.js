import clientPromise from "../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return Response.json({
        success: false,
        error: "Room name is required",
      });
    }

    const client = await clientPromise;
    const db = client.db("yfc");

    const roomsCollection = db.collection("rooms");

    // prevent duplicate room names
    const existing = await roomsCollection.findOne({ name });

    if (existing) {
      return Response.json({
        success: false,
        error: "Room already exists",
      });
    }

    const result = await roomsCollection.insertOne({
      name,
      createdAt: new Date(),
    });

    return Response.json({
      success: true,
      room: {
        _id: result.insertedId.toString(),
        name,
      },
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}