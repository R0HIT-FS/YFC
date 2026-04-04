import clientPromise from "../../../lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lastSync = searchParams.get("lastSync");

    const client = await clientPromise;
    const db = client.db("yfc");

    const query = {};

    if (lastSync) {
      query.updatedAt = { $gt: new Date(lastSync) };
    }

    const users = await db
      .collection("users")
      .find(query, {
        projection: {
          name: 1,
          roomId: 1,
          groupId: 1,
          updatedAt: 1,
        },
      })
      .toArray();

    return Response.json({
      success: true,
      users: users.map((u) => ({
        _id: u._id.toString(),
        name: u.name,
        roomId: u.roomId?.toString() || null,
        groupId: u.groupId?.toString() || null,
        updatedAt: u.updatedAt,
      })),
    });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}