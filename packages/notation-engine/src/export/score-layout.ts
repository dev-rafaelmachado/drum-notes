import type { Instrument } from "../model/instrument";
import { INSTRUMENTS, INSTRUMENT_LABELS } from "../model/instrument";
import type { Score } from "../model/score";
import { formatTimeSignature } from "../model/time-signature";
import { SUBDIVISION_LABELS } from "../model/subdivision";
import { stepsPerBeat, stepsPerMeasure } from "../validation/position";

/** A single instrument lane within a measure, as a row of on/off cells. */
export type LayoutRow = {
  readonly instrument: Instrument;
  readonly label: string;
  readonly cells: readonly boolean[];
};

export type LayoutMeasure = {
  readonly id: string;
  readonly rows: readonly LayoutRow[];
};

/**
 * A framework-agnostic, render-ready projection of a score. Consumed by the
 * editor grid and by the PDF / PNG exporters so they never re-derive layout
 * from the raw model (architecture: the engine prepares export data).
 */
export type ScoreLayout = {
  readonly title: string;
  readonly bpm: number;
  readonly timeSignatureLabel: string;
  readonly subdivisionLabel: string;
  readonly stepsPerMeasure: number;
  readonly stepsPerBeat: number;
  readonly instruments: readonly Instrument[];
  readonly measures: readonly LayoutMeasure[];
};

export function buildScoreLayout(score: Score): ScoreLayout {
  const steps = stepsPerMeasure(score.timeSignature, score.subdivision);
  const beat = stepsPerBeat(score.timeSignature, score.subdivision);

  const measures: LayoutMeasure[] = score.measures.map((measure) => {
    const active = new Set(measure.notes.map((note) => `${note.instrument}:${note.position}`));
    const rows: LayoutRow[] = INSTRUMENTS.map((instrument) => ({
      instrument,
      label: INSTRUMENT_LABELS[instrument],
      cells: Array.from({ length: steps }, (_, position) =>
        active.has(`${instrument}:${position}`),
      ),
    }));
    return { id: measure.id, rows };
  });

  return {
    title: score.title,
    bpm: score.bpm,
    timeSignatureLabel: formatTimeSignature(score.timeSignature),
    subdivisionLabel: SUBDIVISION_LABELS[score.subdivision],
    stepsPerMeasure: steps,
    stepsPerBeat: beat,
    instruments: INSTRUMENTS,
    measures,
  };
}
