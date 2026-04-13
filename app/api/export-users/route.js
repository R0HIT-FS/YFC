import clientPromise from "../../lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("yfc");

    const users = await db.collection("users").aggregate([
      // 🔗 Rooms
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "room",
        },
      },
      {
        $unwind: {
          path: "$room",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 🔗 Groups
      {
        $lookup: {
          from: "groups",
          localField: "groupId",
          foreignField: "_id",
          as: "group",
        },
      },
      {
        $unwind: {
          path: "$group",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 📦 Final shape
      {
        $project: {
          _id: 0,
          name: 1,
          age: 1,
          phone: 1,
          roomName: "$room.name",
          groupName: "$group.name",
          churchName: 1, // 👈 NEW
          reportedToVenue: 1,
          createdAt: 1,
        },
      },
    ]).toArray();

    // 🧾 CSV
    const headers = [
      "Name",
      "Age",
      "Phone",
      "Room No.",
      "Group Leader",
      "Church Name",
      "Reported To Venue",
      "Created At",
    ];

    const rows = users.map((u) => [
      u.name || "",
      u.age || "",
      u.phone || "",
      u.roomName || "Unassigned",
      u.groupName || "No Group",
      u.churchName || "No Church",
      u.reportedToVenue || "FALSE",
      u.createdAt ? new Date(u.createdAt).toLocaleString() : "",
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=users.csv",
      },
    });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}