// import axios from "axios";
// import csv from "csvtojson";
// import clientPromise from "../../lib/db";

// export async function GET() {
//   try {
//     const SHEET_URL = process.env.SHEET_URL;

//     // 1. Fetch CSV
//     const response = await axios.get(SHEET_URL);

//     // 2. Convert CSV → JSON
//     const rawData = await csv().fromString(response.data);

//     // 3. Normalize fields (IMPORTANT ✅)
//     const data = rawData.map((item) => ({
//       name: item.Name?.trim(),
//       email: item.Email?.trim(),
//       age: item.Age ? Number(item.Age) : null,
//       gender: item.Gender?.trim(),
//       phone: item.Phone?.trim(),
//       churchName: item["Church Name"]?.trim(),
//     }));

//     // 4. Connect DB
//     const client = await clientPromise;
//     const db = client.db("yfc");
//     const collection = db.collection("users");

//     // 5. UPSERT (no delete, no duplicates ✅)
//     const operations = data.map((item) => ({
//       updateOne: {
//         filter: { email: item.email },
//         update: { $set: item },
//         upsert: true,
//       },
//     }));

//     await collection.bulkWrite(operations);

//     // 6. Save meta
//     const metaCollection = db.collection("meta");

//     await metaCollection.updateOne(
//       { key: "lastSync" },
//       {
//         $set: {
//           key: "lastSync",
//           time: new Date(),
//           count: data.length,
//         },
//       },
//       { upsert: true }
//     );

//     return Response.json({
//       success: true,
//       count: data.length,
//       lastSync: new Date(),
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
import clientPromise from "../../lib/db";

export async function GET() {
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

    // 🔹 3. Normalize + CLEAN DATA
    const seenEmails = new Set();

    const data = rawData
      .map((item) => {
        const email = item.Email?.trim().toLowerCase();

        // ❌ Skip invalid emails
        if (!email) return null;

        // ❌ Skip duplicates in sheet
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
      .filter(Boolean); // remove nulls

    if (data.length === 0) {
      throw new Error("No valid users found in sheet");
    }

    // 🔹 4. DB Connect
    const client = await clientPromise;
    const db = client.db("yfc");
    const collection = db.collection("users");

    // 🔒 Ensure unique email index (SAFE)
    await collection.createIndex({ email: 1 }, { unique: true });

    // 🔹 5. UPSERT
    const operations = data.map((item) => ({
      updateOne: {
        filter: { email: item.email },
        update: { $set: item },
        upsert: true,
      },
    }));

    await collection.bulkWrite(operations, { ordered: false });

    // 🔹 6. CLEANUP (remove users not in sheet)
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
          type: "sync-with-cleanup",
        },
      },
      { upsert: true }
    );

    // 🔹 8. RESPONSE
    return Response.json({
      success: true,
      message: "Sync completed successfully",
      count: data.length,
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