import type { Instrument } from "../model/instrument";
import type { Score } from "../model/score";
import { stepsPerBeat, stepsPerMeasure } from "../validation/position";
import { secondsPerBeat } from "./metronome";

/**
 * Playback preparation: a timed projection of the score, derived directly from
 * Score → Measure → Note (see docs/adr/010-score-playback.md). Like the export
 * `ScoreLayout`, this is a projection, **not** a parallel notation model. Pure
 * and framework-agnostic — no Tone.js, no Browser APIs.
 */

export type ScheduledNote = {
  /** Seconds from the start of the score. */
  readonly time: number;
  readonly instrument: Instrument;
  readonly measureIndex: number;
  /** Step (position) within the measure. */
  readonly step: number;
};

export type PlaybackSchedule = {
  /** All notes, ordered by time. */
  readonly notes: readonly ScheduledNote[];
  /** Start time (seconds) of each measure, by index. */
  readonly measureStarts: readonly number[];
  readonly stepsPerMeasure: number;
  readonly stepDuration: number;
  readonly measureDuration: number;
  /** Total length of the score in seconds. */
  readonly duration: number;
};

/**
 * Build the playback schedule for a score. Timing follows the score's bpm, time
 * signature and subdivision via the shared domain helpers, so playback and the
 * metronome share one definition of tempo.
 */
export function buildPlaybackSchedule(score: Score): PlaybackSchedule {
  const steps = stepsPerMeasure(score.timeSignature, score.subdivision);
  const stepDuration = secondsPerBeat(score.bpm, score.timeSignature) /
    stepsPerBeat(score.timeSignature, score.subdivision);
  const measureDuration = steps * stepDuration;

  const measureStarts = score.measures.map((_, index) => index * measureDuration);

  const notes: ScheduledNote[] = [];
  score.measures.forEach((measure, measureIndex) => {
    const measureStart = measureStarts[measureIndex]!;
    for (const note of measure.notes) {
      notes.push({
        time: measureStart + note.position * stepDuration,
        instrument: note.instrument,
        measureIndex,
        step: note.position,
      });
    }
  });
  notes.sort((a, b) => a.time - b.time);

  return {
    notes,
    measureStarts,
    stepsPerMeasure: steps,
    stepDuration,
    measureDuration,
    duration: score.measures.length * measureDuration,
  };
}
