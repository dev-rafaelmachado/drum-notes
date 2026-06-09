import { create } from "zustand";
import {
  createAudioReference,
  isSupportedAudioMimeType,
  type AudioReference,
} from "@drum-notes/notation-engine";

import { useEditorStore } from "@/features/editor/stores/editor-store";
import { audioPlayer } from "../services/audio-player";
import {
  deleteAudioBlob,
  loadAudioBlob,
  saveAudioBlob,
} from "../services/audio-repository";

/**
 * Orchestrates the project's reference track: upload, persistence and transport.
 * Business rules (what a valid AudioReference is, attaching it to the Score)
 * live in the domain and the editor store; this store wires those to the
 * IndexedDB blob storage and the Tone.js player (see docs/specs/audio-upload).
 */

export type AudioStatus = "empty" | "loading" | "ready" | "error";

const DEFAULT_VOLUME = 0.8;

type AudioState = {
  status: AudioStatus;
  reference: AudioReference | null;
  errorMessage: string | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number; // linear 0..1

  /** Load (or clear) the player to match the score's current audio reference. */
  syncWithScore: (reference: AudioReference | null) => Promise<void>;
  upload: (file: File) => Promise<void>;
  remove: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  setVolume: (level: number) => void;
};

/** Resolve a usable audio MIME type, inferring from the extension when the browser left it blank. */
function resolveMimeType(file: File): string | null {
  if (isSupportedAudioMimeType(file.type)) {
    return file.type;
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".mp3")) {
    return "audio/mpeg";
  }
  if (name.endsWith(".wav")) {
    return "audio/wav";
  }
  return null;
}

export const useAudioStore = create<AudioState>((set, get) => {
  audioPlayer.setHandlers({
    onPosition: (position) => set({ position }),
    onEnded: () => set({ isPlaying: false, position: 0 }),
  });
  audioPlayer.setVolume(DEFAULT_VOLUME);

  function resetToEmpty(): void {
    set({
      status: "empty",
      reference: null,
      errorMessage: null,
      isPlaying: false,
      position: 0,
      duration: 0,
    });
  }

  return {
    status: "empty",
    reference: null,
    errorMessage: null,
    isPlaying: false,
    position: 0,
    duration: 0,
    volume: DEFAULT_VOLUME,

    async syncWithScore(reference) {
      if (reference?.id === get().reference?.id) {
        return; // already in sync (covers the both-null case)
      }
      if (!reference) {
        audioPlayer.dispose();
        resetToEmpty();
        return;
      }
      set({ status: "loading", reference, isPlaying: false, position: 0 });
      try {
        const stored = await loadAudioBlob(reference.id);
        if (!stored) {
          set({ status: "error", errorMessage: "Audio could not be found in storage." });
          return;
        }
        const duration = await audioPlayer.load(stored.blob);
        set({ status: "ready", duration, errorMessage: null });
      } catch {
        set({ status: "error", errorMessage: "Could not load the audio." });
      }
    },

    async upload(file) {
      const mimeType = resolveMimeType(file);
      if (!mimeType) {
        set({
          status: get().reference ? "ready" : "empty",
          errorMessage: "Unsupported file. Please upload an MP3 or WAV.",
        });
        return;
      }

      const previous = get().reference;
      set({ status: "loading", errorMessage: null, isPlaying: false, position: 0 });
      try {
        const duration = await audioPlayer.load(file);
        const reference = createAudioReference({
          fileName: file.name,
          mimeType,
          duration,
        });
        await saveAudioBlob({
          id: reference.id,
          blob: file,
          mimeType,
          fileName: file.name,
        });
        useEditorStore.getState().attachAudio(reference);
        if (previous && previous.id !== reference.id) {
          await deleteAudioBlob(previous.id);
        }
        set({ status: "ready", reference, duration, errorMessage: null });
      } catch {
        set({ status: "error", errorMessage: "Could not process the audio file." });
      }
    },

    async remove() {
      const reference = get().reference;
      audioPlayer.dispose();
      useEditorStore.getState().detachAudio();
      if (reference) {
        await deleteAudioBlob(reference.id);
      }
      resetToEmpty();
    },

    async play() {
      await audioPlayer.play();
      set({ isPlaying: true });
    },

    pause() {
      audioPlayer.pause();
      set({ isPlaying: false });
    },

    stop() {
      audioPlayer.stop();
      set({ isPlaying: false, position: 0 });
    },

    seek(seconds) {
      audioPlayer.seek(seconds);
      set({ position: Math.max(0, Math.min(seconds, get().duration)) });
    },

    setVolume(level) {
      const clamped = Math.max(0, Math.min(level, 1));
      audioPlayer.setVolume(clamped);
      set({ volume: clamped });
    },
  };
});
