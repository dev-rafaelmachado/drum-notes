import type { AudioReference } from "../model/audio";
import type { Score } from "../model/score";

/**
 * Attach (or replace) the score's reference recording. A score has at most one
 * reference track; attaching a new one supersedes any existing reference.
 */
export function attachAudio(score: Score, audio: AudioReference): Score {
  return { ...score, audio };
}

/** Remove the score's reference recording, if any. */
export function detachAudio(score: Score): Score {
  const { audio: _audio, ...rest } = score;
  return rest;
}
