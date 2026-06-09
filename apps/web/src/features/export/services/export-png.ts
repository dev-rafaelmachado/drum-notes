import type { Score } from "@drum-notes/notation-engine";

import { downloadBlob, toFileStem } from "./download";
import { renderScoreToCanvas } from "./render-score-canvas";

export async function exportScoreToPng(score: Score): Promise<void> {
  const canvas = renderScoreToCanvas(score);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) {
    throw new Error("Failed to render the score to a PNG image.");
  }
  downloadBlob(blob, `${toFileStem(score.title)}.png`);
}
