"use client";

import { useCallback } from "react";
import jsPDF from "jspdf";

interface User {
  _id: string;
  name?: string | null;
  phone?: string | number | null;
  email?: string | null;
  remark?: string | null;
}

interface Group {
  _id: string;
  name?: string | null;
}

interface ExportLeadersPDFButtonProps {
  groups: Group[];
  usersByGroup: Record<string, User[]>;
}

export default function ExportLeadersPDFButton({
  groups,
  usersByGroup,
}: ExportLeadersPDFButtonProps) {
  const handleExport = useCallback(() => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    groups.forEach((group, groupIndex) => {
      if (groupIndex !== 0) {
        doc.addPage();
      }

      const users = usersByGroup[group._id] || [];

      let y = 20;

      // HEADER
      doc.setFillColor(211, 211, 211);
      doc.rect(0, 0, pageWidth, 28, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);

      doc.text(group.name || "Unnamed Leader", 15, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text(
        `${users.length} Delegates`,
        pageWidth - 15,
        18,
        {
          align: "right",
        }
      );

      y = 40;

      // TABLE HEADER
      doc.setFillColor(39, 39, 42);
      doc.rect(10, y, pageWidth - 20, 10, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);

      doc.text("No", 14, y + 6.5);
      doc.text("Name", 28, y + 6.5);
      doc.text("Phone", 95, y + 6.5);
      doc.text("Email", 145, y + 6.5);
      doc.text("Remark", 225, y + 6.5);

      y += 10;

      // USERS
      users.forEach((user, index) => {
        const remarkLines = doc.splitTextToSize(
          user.remark || "-",
          55
        );

        const rowHeight = Math.max(
          10,
          remarkLines.length * 4 + 4
        );

        // PAGE BREAK
        if (y + rowHeight > pageHeight - 15) {
          doc.addPage();

          y = 20;

          // redraw table header
          doc.setFillColor(39, 39, 42);
          doc.rect(10, y, pageWidth - 20, 10, "F");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);

          doc.text("No", 14, y + 6.5);
          doc.text("Name", 28, y + 6.5);
          doc.text("Phone", 95, y + 6.5);
          doc.text("Email", 145, y + 6.5);
          doc.text("Remark", 225, y + 6.5);

          y += 10;
        }

        // alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(10, y, pageWidth - 20, rowHeight, "F");
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(30, 30, 30);

        doc.text(String(index + 1), 14, y + 6);

        doc.text(
          user.name || "-",
          28,
          y + 6
        );

        doc.text(
          String(user.phone || "-"),
          95,
          y + 6
        );

        doc.text(
          user.email || "-",
          145,
          y + 6
        );

        doc.setFontSize(7.5);

        doc.text(
          remarkLines,
          225,
          y + 6
        );

        y += rowHeight;
      });

      // FOOTER
      doc.setDrawColor(220, 220, 220);

      doc.line(
        10,
        pageHeight - 10,
        pageWidth - 10,
        pageHeight - 10
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);

      doc.text(
        "Saviour Of Sinners — Leaders Report",
        10,
        pageHeight - 4
      );

      doc.text(
        `Page ${groupIndex + 1}`,
        pageWidth - 10,
        pageHeight - 4,
        {
          align: "right",
        }
      );
    });

    doc.save("leaders-report.pdf");
  }, [groups, usersByGroup]);

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium transition-colors"
    >
      Export Leaders PDF
    </button>
  );
}