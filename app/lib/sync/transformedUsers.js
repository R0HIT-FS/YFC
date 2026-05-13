import crypto from "crypto";

export function generateHash(obj) {
  return crypto.createHash("md5").update(JSON.stringify(obj)).digest("hex");
}

export function transformUsers(rawData) {
  const seen = new Set();

  const data = rawData
    .map((item) => {
      const email = item["Email"]?.trim().toLowerCase();
      if (!email) return null;

      const user = {
        name: item["Name:"]?.trim() || item["Name"]?.trim() || "No Name",

        email,

        uniqueId: item["Case No"]?.trim() || null,

        age: item["Age:"]
          ? Number(item["Age:"])
          : item["Age"]
            ? Number(item["Age"])
            : null,

        gender: item["Gender"]?.trim() || null,

        phone:
          item["Phone Number:"]?.trim() || item["Phone Number"]?.trim() || null,

        churchName:
          item["Church"]?.trim() || null,

        other : item["Only if OTHER (Church name missing above ) please mention your church name with area."]?.trim() || null,
        locality: item["Area/Locality of residence"]?.trim() || null,

        transport:
          item[
            "Transport options (Buses will be arranged from BHEL & Secunderabad)"
          ]?.trim() || null,

        paymentStatus:
          item[
            `Registration Amount paid 
* Your registration is confirmed only if the amount is paid.`
          ]?.trim() || null,
        paymentDate: item["Date of payment (If paid)"]?.trim() || null,

        transactionId: item["Last 4 digits of Transaction ID (If paid)"]?.trim() || null,

        consentGiven:
          item[
            "I understand that the YFC staff will take all possible care, but will not be responsible for any injury caused or loss sustained to His/Her property"
          ]?.trim() || null,
      };

      const rowHash = generateHash(user);

      if (seen.has(rowHash)) return null;
      seen.add(rowHash);

      return {
        ...user,
        rowHash,
        updatedAt: new Date(),
      };
    })
    .filter(Boolean);

  return data;
}