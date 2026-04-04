// import clientPromise from "../../../lib/db";

// export async function GET() {
//   const client = await clientPromise;
//   const db = client.db("yfc");

//   const groups = await db.collection("groups").find({}).toArray();

//   return Response.json({
//     success: true,
//     groups: groups.map((g) => ({
//       ...g,
//       _id: g._id.toString(),
//     })),
//   });
// }


import clientPromise from "../../../lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("yfc");

    const groups = await db
      .collection("groups")
      .find({}, { projection: { name: 1 } })
      .toArray();

    return Response.json({
      success: true,
      groups: groups.map((g) => ({
        _id: g._id.toString(),
        name: g.name,
      })),
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}