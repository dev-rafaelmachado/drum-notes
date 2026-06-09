import { createId } from "@drum-notes/core";

import { createMeasure } from "../model/measure";
import type { Score } from "../model/score";
import type { Subdivision } from "../model/subdivision";
import { DEFAULT_SUBDIVISION } from "../model/subdivision";
import type { TimeSignature } from "../model/time-signature";
import { DEFAULT_TIME_SIGNATURE } from "../model/time-signature";

export type CreateScoreInput = {
  readonly title?: string;
  readonly bpm?: number;
  readonly timeSignature?: TimeSignature;
  readonly subdivision?: Subdivision;
};

const DEFAULT_TITLE = "Untitled";
const DEFAULT_BPM = 120;

/**
 * Create a new score with sensible defaults and a single empty measure so the
 * editor opens with a grid ready to fill.
 */
export function createScore(input: CreateScoreInput = {}): Score {
  return {
    id: createId(),
    title: input.title?.trim() || DEFAULT_TITLE,
    bpm: input.bpm && input.bpm > 0 ? Math.round(input.bpm) : DEFAULT_BPM,
    timeSignature: input.timeSignature ?? DEFAULT_TIME_SIGNATURE,
    subdivision: input.subdivision ?? DEFAULT_SUBDIVISION,
    measures: [createMeasure()],
  };
}
