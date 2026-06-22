/**
 * @drum-notes/notation-engine
 *
 * The canonical domain: the Score -> Measure -> Note model, score manipulation,
 * validation and export preparation. The single source of truth
 * (see docs/architecture/domain.md, docs/adr/003-score-model.md).
 * Framework-agnostic — no React, Browser-framework or storage code.
 */

// Model
export type { Instrument } from "./model/instrument";
export { INSTRUMENTS, INSTRUMENT_LABELS } from "./model/instrument";
export type { TimeSignature } from "./model/time-signature";
export {
  DEFAULT_TIME_SIGNATURE,
  COMMON_TIME_SIGNATURES,
  formatTimeSignature,
} from "./model/time-signature";
export type { Subdivision } from "./model/subdivision";
export {
  SUBDIVISION_VALUES,
  SUBDIVISION_LABELS,
  SUBDIVISIONS,
  DEFAULT_SUBDIVISION,
} from "./model/subdivision";
export type { Note } from "./model/note";
export { DEFAULT_VELOCITY, createNote } from "./model/note";
export type { Measure } from "./model/measure";
export { createMeasure } from "./model/measure";
export type { Score } from "./model/score";
export type { AudioReference, CreateAudioReferenceInput } from "./model/audio";
export {
  SUPPORTED_AUDIO_MIME_TYPES,
  isSupportedAudioMimeType,
  createAudioReference,
} from "./model/audio";

// Operations
export type { CreateScoreInput } from "./operations/create-score";
export { createScore } from "./operations/create-score";
export { setTitle, setBpm } from "./operations/score-settings";
export { addMeasure, removeMeasure, moveMeasure, duplicateMeasure } from "./operations/measures";
export { toggleNote, hasNote } from "./operations/notes";
export { attachAudio, detachAudio } from "./operations/audio";

// Validation
export { stepsPerMeasure, stepsPerBeat, isValidPosition } from "./validation/position";

// Playback preparation
export { beatsPerMeasure, secondsPerBeat, isAccentBeat } from "./playback/metronome";
export type { ScheduledNote, PlaybackSchedule } from "./playback/schedule";
export { buildPlaybackSchedule } from "./playback/schedule";
export type { LoopRegion } from "./playback/loop";
export { loopRegion } from "./playback/loop";

// Synchronization (stored separately from notation — see docs/adr/008-score-sync.md)
export type { MeasureTimestamp, SyncMap } from "./sync/sync-map";
export {
  createSyncMap,
  setMeasureTimestamp,
  removeMeasureTimestamp,
  hasMeasureTimestamp,
  activeMeasureAt,
  measureStart,
} from "./sync/sync-map";
export { projectMeasureTimestamps } from "./sync/projection";

// Export preparation
export type { ScoreLayout, LayoutMeasure, LayoutRow } from "./export/score-layout";
export { buildScoreLayout } from "./export/score-layout";

// Errors
export {
  InvalidPositionError,
  MeasureNotFoundError,
  InvalidBpmError,
  UnsupportedAudioTypeError,
  InvalidTimestampError,
} from "./errors";
