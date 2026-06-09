import { PDFDocument } from "pdf-lib";
import type { Score } from "@drum-notes/notation-engine";

import { downloadBlob, toFileStem } from "./download";
import { renderScoreToCanvas } from "./render-score-canvas";

async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) {
    throw new Error("Failed to render the score to a PNG image.");
  }
  return new Uint8Array(await blob.arrayBuffer());
}

export async function exportScoreToPdf(score: Score): Promise<void> {
  const canvas = renderScoreToCanvas(score);
  const pngBytes = await canvasToPngBytes(canvas);

  const pdf = await PDFDocument.create();
  const image = await pdf.embedPng(pngBytes);

  // Fit the rendered image onto a page at its natural pixel ratio.
  const margin = 24;
  const page = pdf.addPage([image.width / 2 + margin * 2, image.height / 2 + margin * 2]);
  page.drawImage(image, {
    x: margin,
    y: margin,
    width: image.width / 2,
    height: image.height / 2,
  });

  const bytes = await pdf.save();
  downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${toFileStem(score.title)}.pdf`);
}
