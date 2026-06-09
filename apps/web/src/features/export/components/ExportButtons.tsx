"use client";

import * as React from "react";
import { FileDown, Image as ImageIcon } from "lucide-react";
import type { Score } from "@drum-notes/notation-engine";

import { Button } from "@/components/ui/button";
import { exportScoreToPdf } from "../services/export-pdf";
import { exportScoreToPng } from "../services/export-png";

export function ExportButtons({ score }: { score: Score }): React.JSX.Element {
  const [busy, setBusy] = React.useState<"pdf" | "png" | null>(null);

  async function run(kind: "pdf" | "png"): Promise<void> {
    setBusy(kind);
    try {
      if (kind === "pdf") {
        await exportScoreToPdf(score);
      } else {
        await exportScoreToPng(score);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => run("pdf")}>
        <FileDown className="h-4 w-4" />
        {busy === "pdf" ? "Exporting…" : "PDF"}
      </Button>
      <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => run("png")}>
        <ImageIcon className="h-4 w-4" />
        {busy === "png" ? "Exporting…" : "PNG"}
      </Button>
    </div>
  );
}
