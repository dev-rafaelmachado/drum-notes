import { InvalidBpmError } from "../errors";
import type { Score } from "../model/score";

export function setTitle(score: Score, title: string): Score {
  return { ...score, title };
}

export function setBpm(score: Score, bpm: number): Score {
  if (!Number.isFinite(bpm) || bpm <= 0) {
    throw new InvalidBpmError(bpm);
  }
  return { ...score, bpm: Math.round(bpm) };
}
