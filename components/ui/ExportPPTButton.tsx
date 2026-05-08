"use client";

import { Projector } from "lucide-react";
import pptxgen from "pptxgenjs";

interface User {
  _id: string;
  name?: string | null;
  groupId?: string | null;
  roomId?: string | null;
}

interface Group {
  _id: string;
  name?: string | null;
}

interface Props {
  groups: Group[];
  usersByGroup: Record<string, User[]>;
}

export default function ExportPPTButton({ groups, usersByGroup }: Props) {
  const handleExport = () => {
    const ppt = new pptxgen();

    ppt.layout = "LAYOUT_WIDE";

    // groups.forEach((group, index) => {
    //   const slide = ppt.addSlide();

    //   slide.addText(group.name || "Unnamed Group", {
    //     x: 0.5,
    //     y: 0.3,
    //     fontSize: 28,
    //     bold: true,
    //   });

    //   const users = usersByGroup[group._id] || [];

    //   const mid = Math.ceil(users.length / 2);
    //   const leftCol = users.slice(0, mid);
    //   const rightCol = users.slice(mid);

    //   const leftText = leftCol.map((u) => `• ${u.name}`).join("\n");
    //   const rightText = rightCol.map((u) => `• ${u.name}`).join("\n");

    //   slide.addText(leftText || "No users", {
    //     x: 0.5,
    //     y: 1.2,
    //     w: 4.5,
    //     fontSize: 14,
    //     valign: "top",
    //     breakLine: true,
    //   });

    //   slide.addText(rightText || "", {
    //     x: 5.2,
    //     y: 1.2,
    //     w: 4.5,
    //     fontSize: 14,
    //     valign: "top",
    //     breakLine: true,
    //   });
    // });



    for (let i = 0; i < groups.length; i += 3) {
  const slide = ppt.addSlide();

  const slideGroups = groups.slice(i, i + 3);

  const slideWidth = 13.333;
  const slideHeight = 7.5;

  // generous outer padding
  const paddingX = 0.3;

  // evenly spread columns across entire slide
  const colWidth = (slideWidth - paddingX * 2) / 3;

  slideGroups.forEach((group, colIndex) => {
    const users = usersByGroup[group._id] || [];

    // no bullets / no numbering
    const userText = users.map((u) => u.name).join("\n");

    const x = paddingX + colIndex * colWidth;

    // group title
    slide.addText('Group Leader -'+ ' ' + group.name || "Unnamed Group", {
      x,
      y: 0.4,
      w: colWidth,
      h: 0.5,
      fontSize: 24,
      bold: true,
      align: "left",
    });

    // users
    slide.addText(userText || "No Delegates", {
      x,
      y: 1.1,
      w: colWidth,
      h: slideHeight - 1.5,
      fontSize: 18,
      bold:true,
      align: "left",
      valign: "top",
      breakLine: true,
      margin: 0,
    });
  });
}
    ppt.writeFile({ fileName: "groups.pptx" });
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium transition-colors"
    >
      <Projector size={"16px"} />
      Export PPT
    </button>
  );
}
