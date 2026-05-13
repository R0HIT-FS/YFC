import clientPromise from "../../lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("yfc");

    const users = await db
      .collection("users")
      .aggregate([
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
            uniqueId: 1,
            email: 1,
            phone: 1,
            roomName: "$room.name",
            groupName: "$group.name",
            churchName: 1,
            other:1,
            reportedToVenue: 1,
            paymentStatus: 1,
            paymentDate: 1,
            paymentVerified: 1,
            transactionId: 1,
            consentGiven: 1,
            locality: 1,
            createdAt: 1,
          },
        },
      ])
      .toArray();

    // 🧾 CSV
    const headers = [
      "Name",
      "Age",
      "Unique ID",
      "Email",
      "Phone",
      "Room No.",
      "Group Leader",
      "Church Name",
      "Reported To Venue",
      "Payment Status",
      "Payment Date",
      "Payment Verified",
      "Transaction ID",
      "Consent Given",
      "Area of locality",
      "Created At",
    ];

    const rows = users.map((u) => [
      u.name || "",
      u.age || "",
      u.uniqueId || "",
      u.email || "",
      u.phone.toString() || "",
      u.roomName || "Unassigned",
      u.groupName || "Unassigned",
      (u.churchName?.trim() && u.churchName.trim().toLowerCase() !== "other")
        ? u.churchName
        : u.other?.trim() || "",
      u.reportedToVenue ? "TRUE" : "FALSE",
      u.paymentStatus || "No",
      u.paymentDate || "",
      u.paymentVerified ? "TRUE" : "FALSE",
      u.transactionId || "",
      u.consentGiven || "",
      u.locality || "",
      u.createdAt ? new Date(u.createdAt).toLocaleString() : "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
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
