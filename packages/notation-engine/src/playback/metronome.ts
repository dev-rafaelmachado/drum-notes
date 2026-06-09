import type { TimeSignature } from "../model/time-signature";

/**
 * Metronome timing math — playback preparation that consumes the canonical
 * Score fields (bpm, timeSignature). Pure and framework-agnostic: no Tone.js,
 * no Browser APIs. The metronome's sound and scheduling live in the app layer
 * (see docs/adr/007-metronome.md).
 */

/** Beats in one measure (the meter's numerator). */
export function beatsPerMeasure(timeSignature: TimeSignature): number {
  return timeSignature.numerator;
}

/**
 * Duration of one metronome beat in seconds. BPM is interpreted as quarter
 * notes per minute, so a beat (a `denominator`-th note) lasts
 * `(60 / bpm) * (4 / denominator)`.
 *
 * e.g. 4/4 @ 120 bpm => 0.5 s; 6/8 @ 120 bpm => 0.25 s (eighth-note clicks).
 */
export function secondsPerBeat(bpm: number, timeSignature: TimeSignature): number {
  return (60 / bpm) * (4 / timeSignature.denominator);
}

/** Whether the 0-based beat is the accented downbeat (first beat of a measure). */
export function isAccentBeat(beatIndex: number, timeSignature: TimeSignature): boolean {
  return beatIndex % beatsPerMeasure(timeSignature) === 0;
}
