import { buildScoreLayout, type Score } from "@drum-notes/notation-engine";

/**
 * Render a score to an offscreen canvas. The layout comes from the domain
 * (buildScoreLayout); this module only paints it. Shared by the PNG and PDF
 * exporters so both produce an identical image.
 */

const SCALE = 2; // render at 2x for crisp output
const PADDING = 24;
const LABEL_WIDTH = 88;
const CELL = 22;
const HEADER_HEIGHT = 64;
const MEASURE_GAP = 28;
const MEASURE_LABEL_HEIGHT = 20;

export function renderScoreToCanvas(score: Score): HTMLCanvasElement {
  const layout = buildScoreLayout(score);
  const rows = layout.instruments.length;
  const gridWidth = LABEL_WIDTH + layout.stepsPerMeasure * CELL;
  const measureHeight = MEASURE_LABEL_HEIGHT + rows * CELL;

  const width = PADDING * 2 + gridWidth;
  const height =
    PADDING * 2 +
    HEADER_HEIGHT +
    layout.measures.length * measureHeight +
    Math.max(0, layout.measures.length - 1) * MEASURE_GAP;

  const canvas = document.createElement("canvas");
  canvas.width = width * SCALE;
  canvas.height = height * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not acquire a 2D canvas context for export.");
  }
  ctx.scale(SCALE, SCALE);

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Header
  ctx.fillStyle = "#111111";
  ctx.font = "600 22px sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText(layout.title, PADDING, PADDING);
  ctx.fillStyle = "#666666";
  ctx.font = "13px sans-serif";
  ctx.fillText(
    `${layout.bpm} BPM   •   ${layout.timeSignatureLabel}   •   ${layout.subdivisionLabel} grid`,
    PADDING,
    PADDING + 30,
  );

  let top = PADDING + HEADER_HEIGHT;
  for (const [index, measure] of layout.measures.entries()) {
    drawMeasure(ctx, layout.instruments, layout.stepsPerMeasure, layout.stepsPerBeat, measure, {
      x: PADDING,
      y: top,
      label: `Measure ${index + 1}`,
    });
    top += measureHeight + MEASURE_GAP;
  }

  return canvas;
}

type MeasureDrawing = {
  readonly id: string;
  readonly rows: readonly { readonly label: string; readonly cells: readonly boolean[] }[];
};

function drawMeasure(
  ctx: CanvasRenderingContext2D,
  instruments: readonly string[],
  steps: number,
  stepsPerBeat: number,
  measure: MeasureDrawing,
  origin: { x: number; y: number; label: string },
): void {
  ctx.fillStyle = "#888888";
  ctx.font = "12px sans-serif";
  ctx.fillText(origin.label, origin.x, origin.y);

  const gridTop = origin.y + MEASURE_LABEL_HEIGHT;
  const gridLeft = origin.x + LABEL_WIDTH;

  measure.rows.forEach((row, rowIndex) => {
    const rowY = gridTop + rowIndex * CELL;

    // Instrument label
    ctx.fillStyle = "#333333";
    ctx.font = "12px sans-serif";
    ctx.fillText(row.label, origin.x, rowY + 5);

    for (let column = 0; column < steps; column += 1) {
      const cellX = gridLeft + column * CELL;
      // Cell border
      ctx.strokeStyle = "#e2e2e2";
      ctx.lineWidth = 1;
      ctx.strokeRect(cellX, rowY, CELL, CELL);

      if (row.cells[column]) {
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.arc(cellX + CELL / 2, rowY + CELL / 2, CELL * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // Beat separators (thicker vertical lines)
  const gridBottom = gridTop + instruments.length * CELL;
  ctx.strokeStyle = "#9a9a9a";
  ctx.lineWidth = 1.5;
  for (let column = 0; column <= steps; column += stepsPerBeat) {
    const lineX = gridLeft + column * CELL;
    ctx.beginPath();
    ctx.moveTo(lineX, gridTop);
    ctx.lineTo(lineX, gridBottom);
    ctx.stroke();
  }
}
