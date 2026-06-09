import { createId } from "@drum-notes/core";

import type { Note } from "./note";

/** One bar of the score. Owns its notes. */
export type Measure = {
  readonly id: string;
  readonly notes: readonly Note[];
};

export function createMeasure(notes: readonly Note[] = []): Measure {
  return { id: createId(), notes };
}
