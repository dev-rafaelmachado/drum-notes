/** The meter of a score, e.g. 4/4. */
export type TimeSignature = {
  /** Beats per measure. */
  readonly numerator: number;
  /** The note value that represents one beat (4 = quarter note). */
  readonly denominator: number;
};

export const DEFAULT_TIME_SIGNATURE: TimeSignature = {
  numerator: 4,
  denominator: 4,
};

/** Common meters offered when creating a score. */
export const COMMON_TIME_SIGNATURES: readonly TimeSignature[] = [
  { numerator: 4, denominator: 4 },
  { numerator: 3, denominator: 4 },
  { numerator: 2, denominator: 4 },
  { numerator: 6, denominator: 8 },
  { numerator: 5, denominator: 4 },
  { numerator: 7, denominator: 8 },
];

export function formatTimeSignature(timeSignature: TimeSignature): string {
  return `${timeSignature.numerator}/${timeSignature.denominator}`;
}
