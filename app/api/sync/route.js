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
import crypto from "crypto";

function generateHash(obj) {
  const str = JSON.stringify(obj);
  return crypto.createHash("md5").update(str).digest("hex");
}

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

    if (!response.data) {
      throw new Error("Empty CSV response");
    }

    // 🔹 2. Convert CSV → JSON
    const rawData = await csv().fromString(response.data);

    if (!rawData || rawData.length === 0) {
      throw new Error("CSV has no data");
    }

    console.log("RAW SAMPLE:", rawData[0]); // ✅ debug

    // 🔹 3. Transform data + generate hash
    const data = rawData
      .map((item) => {
        const email = item["Email"]?.trim().toLowerCase();
        if (!email) return null;

        const user = {
          name: item["Name:"]?.trim() || item["Name"]?.trim() || "No Name",
          email,
          age: item["Age:"]
            ? Number(item["Age:"])
            : item["Age"]
              ? Number(item["Age"])
              : null,
          gender: item["Gender"]?.trim() || null,
          phone:
            item["Phone Number:"]?.trim() ||
            item["Phone Number"]?.trim() ||
            null,
          churchName: item["College / Church"]?.trim() || null,
          locality: item["Area/Locality of residence"]?.trim() || null,
          transport:
            item[
              "Transport options (Buses will be arranged from BHEL & Secunderabad)"
            ]?.trim() || null,
          paymentStatus: item["Registration Amount paid"]?.trim() || null,
          paymentDate: item["Date of payment"]?.trim() || null,
          transactionId:
            item["Last 4 digits of Transaction ID"]?.trim() || null,
          consentGiven:
            item[
              "I understand that the YFC staff will take all possible care, but will not be responsible for any injury caused or loss sustained to His/Her property"
            ]?.trim() || null,
        };

        const rowHash = generateHash(user);

        return {
          ...user,
          rowHash,
          updatedAt: new Date(),
        };
      })
      .filter(Boolean);

    if (data.length === 0) {
      throw new Error("No valid users found in sheet");
    }

    console.log("CLEANED SAMPLE:", data[0]); // ✅ debug

    // 🔹 4. DB connect
    const client = await clientPromise;
    const db = client.db("yfc");
    const collection = db.collection("users");

    // 🔥 Ensure unique index on rowHash
    await collection.createIndex({ rowHash: 1 }, { unique: true });

    // 🔹 5. UPSERT using rowHash (core fix)
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

    // 🔹 6. META UPDATE
    const metaCollection = db.collection("meta");
    const now = new Date();

    await metaCollection.updateOne(
      { key: "lastSync" },
      {
        $set: {
          key: "lastSync",
          time: now,
          count: data.length,
          new: result.upsertedCount,
          updated: result.modifiedCount,
        },
      },
      { upsert: true },
    );

    return Response.json({
      success: true,
      message: "Smart sync completed",
      total: data.length,
      new: result.upsertedCount,
      updated: result.modifiedCount,
      lastSync: now,
    });
  } catch (error) {
    console.error("SYNC ERROR:", error);

    return Response.json({
      success: false,
      error: error.message || "Something went wrong",
    });
  }
}
