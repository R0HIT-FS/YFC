import clientPromise from "../../lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("yfc");

    const users = await db.collection("users").find({}).toArray();

    // ✅ Convert ObjectId → string
    const formattedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
      roomId: user.roomId ? user.roomId.toString() : null,
    }));

    return Response.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}