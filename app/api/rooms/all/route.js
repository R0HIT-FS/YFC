import clientPromise from "../../../lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("yfc");

    const rooms = await db.collection("rooms").find({}).toArray();

    const formatted = rooms.map((room) => ({
      ...room,
      _id: room._id.toString(), // ✅ IMPORTANT
    }));

    return Response.json({
      success: true,
      rooms: formatted,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}