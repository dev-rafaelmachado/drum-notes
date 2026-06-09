import type { Instrument } from "@drum-notes/notation-engine";

/**
 * The synthesized default kit: a voice configuration per instrument (see
 * docs/adr/009-instrument-audio.md). Pure data — no Tone.js, no Browser APIs —
 * so it is unit-testable for completeness over the instrument set. The player
 * turns each config into a Tone.js voice.
 *
 *   - membrane: pitched drum body (kick, toms)
 *   - noise:    filtered noise burst (snare, hi-hat)
 *   - metal:    metallic ring (ride, crash)
 */
export type VoiceConfig =
  | { readonly kind: "membrane"; readonly note: string; readonly decay: number }
  | {
      readonly kind: "noise";
      readonly noise: "white" | "pink";
      readonly decay: number;
      /** High-pass cutoff (Hz) that distinguishes a crisp hat from a fuller snare. */
      readonly highpass: number;
    }
  | { readonly kind: "metal"; readonly frequency: number; readonly decay: number };

/**
 * Every supported instrument maps to a voice. Using `Record<Instrument, …>`
 * makes a missing instrument a compile error; the test guards it at runtime too.
 */
export const INSTRUMENT_VOICES: Readonly<Record<Instrument, VoiceConfig>> = {
  kick: { kind: "membrane", note: "C1", decay: 0.35 },
  snare: { kind: "noise", noise: "white", decay: 0.2, highpass: 1200 },
  hiHat: { kind: "noise", noise: "white", decay: 0.05, highpass: 8000 },
  ride: { kind: "metal", frequency: 420, decay: 0.6 },
  crash: { kind: "metal", frequency: 300, decay: 1.5 },
  tom1: { kind: "membrane", note: "G2", decay: 0.3 },
  tom2: { kind: "membrane", note: "E2", decay: 0.32 },
  floorTom: { kind: "membrane", note: "A1", decay: 0.4 },
};
