// import axios from "axios";
// import csv from "csvtojson";
// import clientPromise from "../../lib/db";

// import { NextRequest } from "next/server";

// export async function GET(req) {
//   const auth = req.headers.get("authorization");

//   if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
//     return new Response("Unauthorized", { status: 401 });
//   }

//     try {
//     const SHEET_URL = process.env.SHEET_URL;

//     if (!SHEET_URL) {
//       return Response.json({
//         success: false,
//         error: "SHEET_URL is not defined",
//       });
//     }

//     // 🔹 1. Fetch CSV
//     const response = await axios.get(SHEET_URL);

//     if (!response.data) {
//       throw new Error("Empty CSV response");
//     }

//     // 🔹 2. Convert CSV → JSON
//     const rawData = await csv().fromString(response.data);

//     if (!rawData || rawData.length === 0) {
//       throw new Error("CSV has no data");
//     }

//     // 🔹 3. Normalize + CLEAN DATA
//     const seenEmails = new Set();

//     const data = rawData
//       .map((item) => {
//         const email = item.Email?.trim().toLowerCase();

//         // ❌ Skip invalid emails
//         if (!email) return null;

//         // ❌ Skip duplicates in sheet
//         if (seenEmails.has(email)) return null;
//         seenEmails.add(email);

//         return {
//           name: item.Name?.trim() || "No Name",
//           email,
//           age: item.Age ? Number(item.Age) : null,
//           gender: item.Gender?.trim() || null,
//           phone: item.Phone?.trim() || null,
//           churchName: item["Church"]?.trim() || null,
//         };
//       })
//       .filter(Boolean); // remove nulls

//     if (data.length === 0) {
//       throw new Error("No valid users found in sheet");
//     }

//     // 🔹 4. DB Connect
//     const client = await clientPromise;
//     const db = client.db("yfc");
//     const collection = db.collection("users");

//     // 🔒 Ensure unique email index (SAFE)
//     await collection.createIndex({ email: 1 }, { unique: true });

//     // 🔹 5. UPSERT
//     const operations = data.map((item) => ({
//       updateOne: {
//         filter: { email: item.email },
//         update: { $set: item },
//         upsert: true,
//       },
//     }));

//     // await collection.bulkWrite(operations, { ordered: false });
//     const result = await collection.bulkWrite(operations, { ordered: false });

//     const addedUsers = result.upsertedCount;

//     // 🔹 6. CLEANUP (remove users not in sheet)
//     const sheetEmails = data.map((u) => u.email);

//     await collection.deleteMany({
//       email: { $nin: sheetEmails },
//     });

//     // 🔹 7. META UPDATE
//     const metaCollection = db.collection("meta");

//     const now = new Date();

//     // await metaCollection.updateOne(
//     //   { key: "lastSync" },
//     //   {
//     //     $set: {
//     //       key: "lastSync",
//     //       time: now,
//     //       count: data.length,
//     //       type: "sync-with-cleanup",
//     //     },
//     //   },
//     //   { upsert: true },
//     // );

//     await metaCollection.updateOne(
//       { key: "lastSync" },
//       {
//         $set: {
//           key: "lastSync",
//           time: now,
//           count: data.length,
//           added: addedUsers,
//           type: "sync-with-cleanup",
//         },
//       },
//       { upsert: true },
//     );

//     // 🔹 8. RESPONSE
//     return Response.json({
//       success: true,
//       message: "Sync completed successfully",
//       count: data.length,
//       lastSync: now,
//     });
//   } catch (error) {
//     console.error("SYNC ERROR:", error);

//     return Response.json({
//       success: false,
//       error: error.message || "Something went wrong",
//     });
//   }
// }

import axios from "axios";
import csv from "csvtojson";
import clientPromise from "../../lib/db";
import { transformUsers } from "../../lib/sync/transformedUsers";

export async function GET(req) {
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const SHEET_URL = process.env.SHEET_URL;

    if (!SHEET_URL) {
      return Response.json({ success: false, error: "Missing SHEET_URL" });
    }

    const response = await axios.get(SHEET_URL);
    const rawData = await csv().fromString(response.data);

    if (!rawData?.length) {
      throw new Error("CSV empty");
    }

    const data = transformUsers(rawData);

    if (!data.length) {
      throw new Error("No valid users");
    }

    const client = await clientPromise;
    const db = client.db("yfc");
    const collection = db.collection("users");

    // NOTE: move this to startup in real production
    await collection.createIndex({ rowHash: 1 }, { unique: true });

    // UPSERT
    const operations = data.map((item) => ({
      updateOne: {
        filter: { rowHash: item.rowHash },
        update: {
          $set: {
            ...item,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations, {
      ordered: false,
    });

    // SAFE CLEANUP
    const sheetHashes = data.map((u) => u.rowHash);

    let deleteCount = 0;
    if (sheetHashes.length > 0) {
      const deleteResult = await collection.deleteMany({
        rowHash: { $nin: sheetHashes },
      });
      deleteCount = deleteResult.deletedCount;
    }

    // META
    const meta = db.collection("meta");

    await meta.updateOne(
      { key: "lastSync" },
      {
        $set: {
          key: "lastSync",
          time: new Date(),
          total: data.length,
          inserted: result.upsertedCount,
          updated: result.modifiedCount,
          deleted: deleteCount,
          type: "smart-sync",
        },
      },
      { upsert: true }
    );

    return Response.json({
      success: true,
      total: data.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      deleted: deleteCount,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}
