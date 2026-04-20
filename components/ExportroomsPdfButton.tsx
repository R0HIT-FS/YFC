"use client";

import { useCallback } from "react";
import jsPDF from "jspdf";

interface User {
  _id: string;
  name?: string | null;
  roomId?: string | null;
  groupId?: string | null;
  age? : string | number | null;
}

interface Room {
  _id: string;
  name?: string | null;
  limit?: number | null;
}

interface ExportRoomsPDFButtonProps {
  rooms: Room[];
  usersByRoom: Record<string, User[]>;
}

export default function ExportRoomsPDFButton({ rooms, usersByRoom }: ExportRoomsPDFButtonProps) {
  const handleExport = useCallback(() => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 15;
    const marginRight = 15;
    const contentWidth = pageWidth - marginLeft - marginRight;
    let y = 20;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 15) {
        doc.addPage();
        y = 20;
      }
    };

    // ── Header ───────────────────────────────────────────────────
    doc.setFillColor(24, 24, 27);
    doc.rect(0, 0, pageWidth, 30, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(250, 250, 250);
    doc.text("Rooms Report", marginLeft, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170);
    const now = new Date().toLocaleString();
    doc.text(`Exported on ${now}`, pageWidth - marginRight, 18, { align: "right" });

    y = 40;

    // ── Summary ──────────────────────────────────────────────────
    const totalOccupants = Object.values(usersByRoom).reduce((sum, u) => sum + u.length, 0);
    const totalCapacity = rooms.reduce((sum, r) => sum + (r.limit ?? 0), 0);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `Total Rooms: ${rooms.length}    Total Occupants: ${totalOccupants}    Total Capacity: ${totalCapacity}`,
      marginLeft,
      y
    );
    y += 10;

    // ── Rooms ────────────────────────────────────────────────────
    rooms.forEach((room, idx) => {
      const users = usersByRoom[room._id] || [];
      const limit = room.limit ?? 0;
      const blockHeight = 12 + Math.max(users.length, 1) * 7 + 6;
      checkPageBreak(blockHeight);

      // Room header bar
      doc.setFillColor(39, 39, 42);
      doc.roundedRect(marginLeft, y, contentWidth, 10, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(250, 250, 250);
      doc.text(`Room : ${room.name ?? "Unnamed Room"}`, marginLeft + 4, y + 6.8);

      // Occupancy badge (e.g. "2 / 10")
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const occupancy = `${users.length}${limit > 0 ? ` / ${limit}` : ""} occupant${users.length !== 1 ? "s" : ""}`;

      // Color the badge: red if full, normal otherwise
      const isFull = limit > 0 && users.length >= limit;
      doc.setTextColor(isFull ? 220 : 161, isFull ? 80 : 161, isFull ? 80 : 170);
      doc.text(occupancy, pageWidth - marginRight - 4, y + 6.8, { align: "right" });

      y += 12;

      if (users.length === 0) {
        checkPageBreak(8);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(120, 120, 120);
        doc.text("No occupants in this room.", marginLeft + 6, y + 5);
        y += 8;
      } else {
        users.forEach((user, uIdx) => {
          checkPageBreak(7);

          if (uIdx % 2 === 0) {
            doc.setFillColor(248, 248, 248);
            doc.rect(marginLeft, y, contentWidth, 7, "F");
          }

          // Index
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(150, 150, 150);
          doc.text(`${uIdx + 1}.`, marginLeft + 4, y + 5);

          // Name
          doc.setTextColor(30, 30, 30);
          doc.text(user.name ?? "Anonymous", marginLeft + 14, y + 5);

          // Group ID if present
          if (user.age) {
            doc.setTextColor(120, 120, 120);
            doc.setFontSize(7.5);
            doc.text(`Age: ${user.age}`, pageWidth - marginRight - 4, y + 5, {
              align: "right",
            });
          }

          y += 7;
        });
      }

      // Capacity bar (only if limit is set)
      if (limit > 0) {
        checkPageBreak(8);
        const barWidth = contentWidth;
        const fillRatio = Math.min(users.length / limit, 1);
        const isFull = users.length >= limit;

        // Background track
        doc.setFillColor(228, 228, 231);
        doc.roundedRect(marginLeft, y + 1, barWidth, 1, 1, 1, "F");

        // Fill
        doc.setFillColor(isFull ? 220 : 29, isFull ? 80 : 158, isFull ? 80 : 117);
        if (fillRatio > 0) {
          doc.roundedRect(marginLeft, y + 1, barWidth * fillRatio, 1, 1, 1, "F");
        }

        y += 7;
      }

      y += 4;
    });

    // ── Footer on every page ─────────────────────────────────────
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setDrawColor(220, 220, 220);
      doc.line(marginLeft, pageHeight - 10, pageWidth - marginRight, pageHeight - 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(160, 160, 160);
      doc.text("Saviour Of Sinners — YFC", marginLeft, pageHeight - 5);
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginRight, pageHeight - 5, {
        align: "right",
      });
    }

    doc.save("rooms-report.pdf");
  }, [rooms, usersByRoom]);

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export PDF
    </button>
  );
}