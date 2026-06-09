/**
 * The rhythmic grid resolution of a score. Determines the valid note positions
 * inside a measure. Modelled as a note value (an eighth-note grid, etc.).
 */
export type Subdivision = "quarter" | "eighth" | "sixteenth" | "thirtySecond";

/** Note value of each subdivision (how many fit in a whole note). */
export const SUBDIVISION_VALUES: Readonly<Record<Subdivision, number>> = {
  quarter: 4,
  eighth: 8,
  sixteenth: 16,
  thirtySecond: 32,
};

export const SUBDIVISION_LABELS: Readonly<Record<Subdivision, string>> = {
  quarter: "1/4",
  eighth: "1/8",
  sixteenth: "1/16",
  thirtySecond: "1/32",
};

export const SUBDIVISIONS: readonly Subdivision[] = [
  "quarter",
  "eighth",
  "sixteenth",
  "thirtySecond",
];

export const DEFAULT_SUBDIVISION: Subdivision = "sixteenth";
