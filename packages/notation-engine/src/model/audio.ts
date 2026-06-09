import { createId } from "@drum-notes/core";

import { UnsupportedAudioTypeError } from "../errors";

/**
 * A reference from a Score to an uploaded recording. It carries **metadata
 * only** — never the audio bytes, which live in the application's storage layer
 * keyed by `id` (see docs/architecture/domain.md and docs/adr/006-audio-storage.md).
 * Keeping the bytes out of the domain keeps the model framework- and
 * Browser-API-agnostic.
 */
export type AudioReference = {
  readonly id: string;
  readonly fileName: string;
  readonly mimeType: string;
  /** Track length in seconds. */
  readonly duration: number;
};

/** The audio MIME types the app accepts on upload (MP3 and WAV). */
export const SUPPORTED_AUDIO_MIME_TYPES: readonly string[] = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
];

export function isSupportedAudioMimeType(mimeType: string): boolean {
  return SUPPORTED_AUDIO_MIME_TYPES.includes(mimeType);
}

export type CreateAudioReferenceInput = {
  readonly fileName: string;
  readonly mimeType: string;
  readonly duration: number;
  /** Optional explicit id; defaults to a fresh id (also the storage key). */
  readonly id?: string;
};

/**
 * Build an AudioReference, rejecting unsupported MIME types so an invalid
 * reference can never be attached to a Score.
 */
export function createAudioReference(input: CreateAudioReferenceInput): AudioReference {
  if (!isSupportedAudioMimeType(input.mimeType)) {
    throw new UnsupportedAudioTypeError(input.mimeType);
  }
  return {
    id: input.id ?? createId(),
    fileName: input.fileName,
    mimeType: input.mimeType,
    duration: input.duration,
  };
}
