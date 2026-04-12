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

export async function GET(req) {
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const SHEET_URL = process.env.SHEET_URL;

    if (!SHEET_URL) {
      return Response.json({
        success: false,
        error: "SHEET_URL is not defined",
      });
    }

    // 🔹 1. Fetch CSV
    const response = await axios.get(SHEET_URL);
    const rawData = await csv().fromString(response.data);

    // 🔹 2. Clean data
    const seenEmails = new Set();

    const data = rawData
      .map((item) => {
        const email = item.Email?.trim().toLowerCase();

        if (!email) return null;
        if (seenEmails.has(email)) return null;

        seenEmails.add(email);

        return {
          name: item.Name?.trim() || "No Name",
          email,
          age: item.Age ? Number(item.Age) : null,
          gender: item.Gender?.trim() || null,
          phone: item.Phone?.trim() || null,
          churchName: item["Church"]?.trim() || null,
        };
      })
      .filter(Boolean);

    if (data.length === 0) {
      throw new Error("No valid users found in sheet");
    }

    // 🔹 3. DB connect
    const client = await clientPromise;
    const db = client.db("yfc");
    const collection = db.collection("users");

    await collection.createIndex({ email: 1 }, { unique: true });

    // ✅ 🔥 4. FIND EXISTING USERS (NEW PART)
    const existingUsers = await collection
      .find({}, { projection: { email: 1 } })
      .toArray();

    const existingEmails = new Set(existingUsers.map((u) => u.email));

    const newUsers = data.filter((u) => !existingEmails.has(u.email));
    const addedUsers = newUsers.length;

    // 🔹 5. UPSERT
    const operations = data.map((item) => ({
      updateOne: {
        filter: { email: item.email },
        // update: { $set: item },
        update: {
          $set: {
            ...item,
            updatedAt: new Date(), // 🔥 ADD THIS
          },
        },
        upsert: true,
      },
    }));

    await collection.bulkWrite(operations, { ordered: false });

    // 🔹 6. CLEANUP
    const sheetEmails = data.map((u) => u.email);

    await collection.deleteMany({
      email: { $nin: sheetEmails },
    });

    // 🔹 7. META UPDATE
    const metaCollection = db.collection("meta");
    const now = new Date();

    await metaCollection.updateOne(
      { key: "lastSync" },
      {
        $set: {
          key: "lastSync",
          time: now,
          count: data.length,
          added: addedUsers, // ✅ REAL NEW USERS
        },
      },
      { upsert: true },
    );

    return Response.json({
      success: true,
      message: "Sync completed successfully",
      count: data.length,
      added: addedUsers,
      lastSync: now,
    });
  } catch (error) {
    console.error("SYNC ERROR:", error);

    return Response.json({
      success: false,
      error: error.message,
    });
  }
}
