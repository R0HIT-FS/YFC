import clientPromise from "../../../lib/db";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("yfc");

  const groups = await db.collection("groups").find({}).toArray();

  return Response.json({
    success: true,
    groups: groups.map((g) => ({
      ...g,
      _id: g._id.toString(),
    })),
  });
}