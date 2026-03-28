import axios from "axios";
import csv from "csvtojson";
import clientPromise from "../../lib/db";

export async function GET() {
  try {
    const SHEET_URL = process.env.SHEET_URL;

    // 1. Fetch CSV
    const response = await axios.get(SHEET_URL);

    // 2. Convert CSV → JSON
    const rawData = await csv().fromString(response.data);

    // 3. Normalize fields (IMPORTANT ✅)
    const data = rawData.map((item) => ({
      name: item.Name?.trim(),
      email: item.Email?.trim(),
      age: item.Age ? Number(item.Age) : null,
      gender: item.Gender?.trim(),
      phone: item.Phone?.trim(),
      churchName: item["Church Name"]?.trim(),
    }));

    // 4. Connect DB
    const client = await clientPromise;
    const db = client.db("yfc");
    const collection = db.collection("users");

    // 5. UPSERT (no delete, no duplicates ✅)
    const operations = data.map((item) => ({
      updateOne: {
        filter: { email: item.email },
        update: { $set: item },
        upsert: true,
      },
    }));

    await collection.bulkWrite(operations);

    // 6. Save meta
    const metaCollection = db.collection("meta");

    await metaCollection.updateOne(
      { key: "lastSync" },
      {
        $set: {
          key: "lastSync",
          time: new Date(),
          count: data.length,
        },
      },
      { upsert: true }
    );

    return Response.json({
      success: true,
      count: data.length,
      lastSync: new Date(),
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}