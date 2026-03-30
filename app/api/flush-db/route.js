import clientPromise from "../../lib/db";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("yfc");

    // 🔥 Delete all collections
    await Promise.all([
      db.collection("users").deleteMany({}),
      db.collection("rooms").deleteMany({}),
      db.collection("groups").deleteMany({}),
      db.collection("meta").deleteMany({}),
    ]);

    return Response.json({
      success: true,
      message: "Database flushed successfully 🔥",
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}