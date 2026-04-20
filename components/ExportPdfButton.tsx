"use client";

import { useCallback } from "react";
import jsPDF from "jspdf";

interface User {
  _id: string;
  name?: string | null;
  groupId?: string | null;
  roomId?: string | null;
  gender?: string | null;
  age? : string | number | null;
}

interface Group {
  _id: string;
  name?: string | null;
}

interface ExportPDFButtonProps {
  groups: Group[];
  usersByGroup: Record<string, User[]>;
}

export default function ExportPDFButton({ groups, usersByGroup }: ExportPDFButtonProps) {
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

    // ── Header ──────────────────────────────────────────────────
    doc.setFillColor(24, 24, 27); // zinc-950
    doc.rect(0, 0, pageWidth, 30, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(250, 250, 250);
    doc.text("Groups Report", marginLeft, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170); // zinc-400
    const now = new Date().toLocaleString();
    doc.text(`Exported on ${now}`, pageWidth - marginRight, 18, { align: "right" });

    y = 40;

    // ── Summary row ─────────────────────────────────────────────
    const totalUsers = Object.values(usersByGroup).reduce((sum, u) => sum + u.length, 0);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Total Groups: ${groups.length}    Total Users: ${totalUsers}`, marginLeft, y);
    y += 10;

    // ── Groups ───────────────────────────────────────────────────
    groups.forEach((group, idx) => {
      const users = usersByGroup[group._id] || [];
      const blockHeight = 12 + Math.max(users.length, 1) * 7 + 6;
      checkPageBreak(blockHeight);

      // Group header bar
      doc.setFillColor(39, 39, 42); // zinc-800
      doc.roundedRect(marginLeft, y, contentWidth, 10, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(250, 250, 250);
      doc.text(`${idx + 1}. ${group.name ?? "Unnamed Group"}`, marginLeft + 4, y + 6.8);

      // User count badge
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170);
      doc.text(
        `${users.length} member${users.length !== 1 ? "s" : ""}`,
        pageWidth - marginRight - 4,
        y + 6.8,
        { align: "right" }
      );

      y += 12;

      if (users.length === 0) {
        checkPageBreak(8);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(120, 120, 120);
        doc.text("No members in this group.", marginLeft + 6, y + 5);
        y += 8;
      } else {
        users.forEach((user, uIdx) => {
          checkPageBreak(7);

          // Alternating row backgrounds
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
          doc.text(user.name ?? "Unknown User", marginLeft + 14, y + 5);

          // Room ID if present
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

      y += 6; // spacing between groups
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

    doc.save("groups-report.pdf");
  }, [groups, usersByGroup]);

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium transition-colors"
    >
      {/* Download icon */}
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