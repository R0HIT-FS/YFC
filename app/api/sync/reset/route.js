// import axios from "axios";
// import csv from "csvtojson";
// import clientPromise from "../../../lib/db";

// export async function GET() {
//   try {
//     const SHEET_URL = process.env.SHEET_URL;

//     // 1. Fetch CSV
//     const response = await axios.get(SHEET_URL);

//     // 2. Convert CSV → JSON
//     const rawData = await csv().fromString(response.data);

//     // 3. Normalize fields
//     const data = rawData.map((item) => ({
//       name: item.Name?.trim(),
//       email: item.Email?.trim(),
//       age: item.Age ? Number(item.Age) : null,
//       gender: item.Gender?.trim(),
//       phone: item.Phone?.trim(),
//       churchName: item["Church"]?.trim(),
//       roomId: null,   // reset
//       groupId: null,  // reset
//     }));

//     const client = await clientPromise;
//     const db = client.db("yfc");
//     const collection = db.collection("users");

//     // ✅ 🔥 HARD RESET (THIS IS THE FIX)
//     await collection.deleteMany({}); // <-- DELETE EVERYTHING

//     // ✅ Insert fresh data
//     if (data.length > 0) {
//       await collection.insertMany(data);
//     }

//     // ✅ Meta update
//     const metaCollection = db.collection("meta");

//     await metaCollection.updateOne(
//       { key: "lastSync" },
//       {
//         $set: {
//           key: "lastSync",
//           time: new Date(),
//           count: data.length,
//           type: "reset-sync",
//         },
//       },
//       { upsert: true }
//     );

//     return Response.json({
//       success: true,
//       message: "Database reset & synced",
//       count: data.length,
//     });
//   } catch (error) {
//     console.error(error);

//     return Response.json({
//       success: false,
//       error: error.message,
//     });
//   }
// }

import axios from "axios";
import csv from "csvtojson";
import clientPromise from "../../../lib/db";
import { transformUsers } from "../../../lib/sync/transformedUsers";

export async function GET(req) {

  try {
    const SHEET_URL = process.env.SHEET_URL;

    const response = await axios.get(SHEET_URL);
    const rawData = await csv().fromString(response.data);

    const data = transformUsers(rawData);

    const client = await clientPromise;
    const db = client.db("yfc");
    const collection = db.collection("users");

    const session = client.startSession();

    await session.withTransaction(async () => {
      await collection.deleteMany({}, { session });

      if (data.length > 0) {
        await collection.insertMany(data, { session });
      }

      await db.collection("meta").updateOne(
        { key: "lastSync" },
        {
          $set: {
            key: "lastSync",
            time: new Date(),
            total: data.length,
            type: "reset-sync",
          },
        },
        { upsert: true, session }
      );
    });

    return Response.json({
      success: true,
      message: "Reset sync completed safely",
      count: data.length,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}
