/** A note position fell outside the measure's subdivision grid. */
export class InvalidPositionError extends Error {
  constructor(
    readonly position: number,
    readonly stepsPerMeasure: number,
  ) {
    super(
      `Position ${position} is outside the measure grid (valid range 0..${stepsPerMeasure - 1}).`,
    );
    this.name = "InvalidPositionError";
  }
}

/** An operation referenced a measure that does not exist in the score. */
export class MeasureNotFoundError extends Error {
  constructor(readonly measureId: string) {
    super(`Measure "${measureId}" was not found in the score.`);
    this.name = "MeasureNotFoundError";
  }
}

/** An invalid BPM was supplied. */
export class InvalidBpmError extends Error {
  constructor(readonly bpm: number) {
    super(`BPM must be a positive number, received ${bpm}.`);
    this.name = "InvalidBpmError";
  }
}

/** An audio file with an unsupported MIME type was supplied. */
export class UnsupportedAudioTypeError extends Error {
  constructor(readonly mimeType: string) {
    super(`Audio type "${mimeType}" is not supported (expected MP3 or WAV).`);
    this.name = "UnsupportedAudioTypeError";
  }
}

/** A measure timestamp window was outside the valid range (0 <= start < end). */
export class InvalidTimestampError extends Error {
  constructor(
    readonly measureId: string,
    readonly start: number,
    readonly end: number,
  ) {
    super(
      `Invalid timestamp for measure "${measureId}": start ${start}, end ${end} (require 0 <= start < end).`,
    );
    this.name = "InvalidTimestampError";
  }
}
