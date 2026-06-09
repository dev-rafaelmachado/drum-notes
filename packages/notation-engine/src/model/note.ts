import type { Instrument } from "./instrument";

/** A single hit: an instrument struck at a position with a velocity. */
export type Note = {
  readonly instrument: Instrument;
  /** Slot within the measure; must respect the score's subdivision. */
  readonly position: number;
  /** How hard the note is struck, in the range 0..1. */
  readonly velocity: number;
};

/** Default velocity for a freshly placed note (a normal, un-accented hit). */
export const DEFAULT_VELOCITY = 0.8;

export function createNote(
  instrument: Instrument,
  position: number,
  velocity: number = DEFAULT_VELOCITY,
): Note {
  return { instrument, position, velocity };
}
