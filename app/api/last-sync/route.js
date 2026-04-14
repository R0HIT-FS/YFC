// import clientPromise from '../../lib/db';

// export async function GET() {
//   try {
//     const client = await clientPromise;
//     const db = client.db("yfc");

//     const meta = await db.collection("meta").findOne({ key: "lastSync" });

//     return Response.json({
//       success: true,
//       lastSync: meta?.time || null,
//       count: meta?.count || 0,
//     });
//   } catch (error) {
//     return Response.json({
//       success: false,
//       error: error.message,
//     });
//   }
// }


import clientPromise from "../../lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("yfc");

    const meta = await db.collection("meta").findOne({ key: "lastSync" });

    return Response.json({
      success: true,
      lastSync: meta?.time || null,
      total: meta?.total || meta?.count || 0,
      inserted: meta?.inserted || meta?.upserted || meta?.new || 0,
      updated: meta?.updated || meta?.modified || 0,
      deleted: meta?.deleted || 0,
      type: meta?.type || null,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}