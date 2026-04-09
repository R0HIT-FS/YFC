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


import clientPromise from '../../lib/db';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("yfc");

    const meta = await db.collection("meta").findOne({ key: "lastSync" });

    return Response.json({
      success: true,
      lastSync: meta?.time || null,
      count: meta?.count || 0,
      added: meta?.added || 0, // 🔥 ADD THIS
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}