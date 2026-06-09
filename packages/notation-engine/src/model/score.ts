import type { Measure } from "./measure";
import type { Subdivision } from "./subdivision";
import type { TimeSignature } from "./time-signature";

/**
 * The top-level document. The single source of truth that the UI, persistence
 * and export all consume (see docs/adr/003-score-model.md).
 */
export type Score = {
  readonly id: string;
  readonly title: string;
  readonly bpm: number;
  readonly timeSignature: TimeSignature;
  readonly subdivision: Subdivision;
  readonly measures: readonly Measure[];
};
