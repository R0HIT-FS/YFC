import clientPromise from "../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const client = await clientPromise;
  const session = client.startSession();

  try {
    const { userId, roomId } = await req.json();

    if (!userId || !roomId) {
      return Response.json({
        success: false,
        error: "Missing userId or roomId",
      });
    }

    const db = client.db("yfc");
    const users = db.collection("users");
    const rooms = db.collection("rooms");

    const userObjectId = new ObjectId(userId);
    const roomObjectId = new ObjectId(roomId);

    await session.withTransaction(async () => {
      const room = await rooms.findOne(
        { _id: roomObjectId },
        { session }
      );

      if (!room) throw new Error("Room not found");

      if ((room.currentCount || 0) >= room.limit) {
        throw new Error("Room is full");
      }

      const user = await users.findOne(
        { _id: userObjectId },
        { session }
      );

      if (!user) throw new Error("User not found");

      const prevRoomId = user.roomId;

      // ✅ Update user + timestamp
      await users.updateOne(
        { _id: userObjectId },
        {
          $set: {
            roomId: roomObjectId,
            updatedAt: new Date(),
          },
        },
        { session }
      );

      // ✅ Increment new room
      await rooms.updateOne(
        { _id: roomObjectId },
        { $inc: { currentCount: 1 } },
        { session }
      );

      // ✅ Decrement previous room
      if (prevRoomId) {
        await rooms.updateOne(
          { _id: prevRoomId },
          { $inc: { currentCount: -1 } },
          { session }
        );
      }
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  } finally {
    await session.endSession();
  }
}