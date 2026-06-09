import type { Subdivision } from "../model/subdivision";
import { SUBDIVISION_VALUES } from "../model/subdivision";
import type { TimeSignature } from "../model/time-signature";

/**
 * Number of grid steps in a single measure for the given meter and subdivision.
 *
 * A measure in `numerator/denominator` time holds `numerator` beats, each beat
 * being a `denominator`-th note. A subdivision of value `S` divides a whole note
 * into `S` parts, so:
 *
 *   steps = numerator * (S / denominator)
 *
 * e.g. 4/4 with sixteenths => 4 * (16 / 4) = 16 steps.
 */
export function stepsPerMeasure(
  timeSignature: TimeSignature,
  subdivision: Subdivision,
): number {
  const steps =
    (timeSignature.numerator * SUBDIVISION_VALUES[subdivision]) / timeSignature.denominator;
  return Math.max(1, Math.round(steps));
}

/** Number of grid steps that make up one beat. */
export function stepsPerBeat(
  timeSignature: TimeSignature,
  subdivision: Subdivision,
): number {
  return SUBDIVISION_VALUES[subdivision] / timeSignature.denominator;
}

export function isValidPosition(
  timeSignature: TimeSignature,
  subdivision: Subdivision,
  position: number,
): boolean {
  return (
    Number.isInteger(position) &&
    position >= 0 &&
    position < stepsPerMeasure(timeSignature, subdivision)
  );
}
