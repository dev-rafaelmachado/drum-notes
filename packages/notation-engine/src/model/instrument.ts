/**
 * The drum-kit voices a note can target. The MVP supports exactly eight,
 * ordered top-to-bottom as they appear on the editor grid.
 * See docs/product/glossary.md and docs/architecture/domain.md.
 */
export type Instrument =
  | "hiHat"
  | "ride"
  | "crash"
  | "snare"
  | "tom1"
  | "tom2"
  | "floorTom"
  | "kick";

/** Display order for the editor grid (top to bottom). */
export const INSTRUMENTS: readonly Instrument[] = [
  "hiHat",
  "ride",
  "crash",
  "snare",
  "tom1",
  "tom2",
  "floorTom",
  "kick",
] as const;

/** Human-readable labels for each instrument. */
export const INSTRUMENT_LABELS: Readonly<Record<Instrument, string>> = {
  hiHat: "Hi-Hat",
  ride: "Ride",
  crash: "Crash",
  snare: "Snare",
  tom1: "Tom 1",
  tom2: "Tom 2",
  floorTom: "Floor Tom",
  kick: "Kick",
};
