import { InvalidPositionError, MeasureNotFoundError } from "../errors";
import type { Instrument } from "../model/instrument";
import type { Measure } from "../model/measure";
import { createNote } from "../model/note";
import type { Score } from "../model/score";
import { isValidPosition, stepsPerMeasure } from "../validation/position";

export function hasNote(
  measure: Measure,
  instrument: Instrument,
  position: number,
): boolean {
  return measure.notes.some(
    (note) => note.instrument === instrument && note.position === position,
  );
}

/**
 * Toggle a note on an instrument at a position: add it if absent, remove it if
 * present. A note belongs to exactly one measure and its position must respect
 * the score's subdivision (invariant — see docs/architecture/domain.md).
 */
export function toggleNote(
  score: Score,
  measureId: string,
  instrument: Instrument,
  position: number,
): Score {
  if (!isValidPosition(score.timeSignature, score.subdivision, position)) {
    throw new InvalidPositionError(
      position,
      stepsPerMeasure(score.timeSignature, score.subdivision),
    );
  }
  if (!score.measures.some((measure) => measure.id === measureId)) {
    throw new MeasureNotFoundError(measureId);
  }

  const measures = score.measures.map((measure) => {
    if (measure.id !== measureId) {
      return measure;
    }
    const notes = hasNote(measure, instrument, position)
      ? measure.notes.filter(
          (note) => !(note.instrument === instrument && note.position === position),
        )
      : [...measure.notes, createNote(instrument, position)];
    return { ...measure, notes };
  });

  return { ...score, measures };
}
