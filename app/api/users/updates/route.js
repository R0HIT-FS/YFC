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

    const [users, rooms, groups] = await Promise.all([
      db.collection("users").find(query).toArray(),
      db.collection("rooms").find(query).toArray(),
      db.collection("groups").find(query).toArray(),
    ]);

    return Response.json({
      success: true,

      users: users.map((u) => ({
        _id: u._id.toString(),
        name: u.name,
        roomId: u.roomId?.toString() || null,
        groupId: u.groupId?.toString() || null,
        updatedAt: u.updatedAt,
      })),

      rooms: rooms.map((r) => ({
        _id: r._id.toString(),
        name: r.name,
        limit: r.limit,
        currentCount: r.currentCount || 0,
        updatedAt: r.updatedAt,
      })),

      groups: groups.map((g) => ({
        _id: g._id.toString(),
        name: g.name,
        updatedAt: g.updatedAt,
      })),
    });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}