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
import crypto from "crypto";

function generateHash(obj) {
  const str = JSON.stringify(obj);
  return crypto.createHash("md5").update(str).digest("hex");
}

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

    // 🔹 3. Transform data (same structure as sync)
    const seenHashes = new Set();

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

          // 🔥 reset fields
          roomId: null,
          groupId: null,
        };

        // 🔥 FULL ROW HASH (important)
        const rowHash = generateHash(item);

        // ❌ prevent duplicates inside CSV
        if (seenHashes.has(rowHash)) return null;
        seenHashes.add(rowHash);

        return {
          ...user,
          rowHash,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
      .filter(Boolean);

    // 🔹 4. DB connect
    const client = await clientPromise;
    const db = client.db("yfc");
    const collection = db.collection("users");

    // 🔥 HARD RESET
    await collection.deleteMany({});

    // 🔥 Ensure index exists
    await collection.createIndex({ rowHash: 1 }, { unique: true });

    // 🔹 5. Insert fresh clean data
    if (data.length > 0) {
      await collection.insertMany(data);
    }

    // 🔹 6. META UPDATE
    const metaCollection = db.collection("meta");

    await metaCollection.updateOne(
      { key: "lastSync" },
      {
        $set: {
          key: "lastSync",
          time: new Date(),
          count: data.length,
          type: "reset-sync",
        },
      },
      { upsert: true },
    );

    return Response.json({
      success: true,
      message: "Database reset & synced (clean + consistent)",
      count: data.length,
    });
  } catch (error) {
    console.error("RESET ERROR:", error);

    return Response.json({
      success: false,
      error: error.message,
    });
  }
}
