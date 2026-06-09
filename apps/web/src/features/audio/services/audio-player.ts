/**
 * Tone.js playback wrapper for the uploaded reference track (see
 * docs/adr/005-audio-playback.md). This is the single place that touches
 * Tone.js / the Web Audio API — the domain and stores stay engine-agnostic.
 *
 * Tone is imported lazily (dynamic `import`) so the module never evaluates
 * browser-only code during server rendering. Tone.Player has no public playback
 * clock, so position is tracked from the audio context time across start/seek.
 */

import type { Player, Volume } from "tone";

type TonePlayer = Player;
type ToneVolume = Volume;

/** The subset of the Tone.js module this controller uses at runtime. */
interface ToneRuntime {
  start(): Promise<void>;
  now(): number;
  gainToDb(gain: number): number;
  Player: typeof Player;
  Volume: typeof Volume;
}

export type AudioPlayerHandlers = {
  readonly onPosition: (seconds: number) => void;
  readonly onEnded: () => void;
};

const DEFAULT_VOLUME = 0.8;

class AudioPlayerController {
  private tone: ToneRuntime | null = null;
  private player: TonePlayer | null = null;
  private volumeNode: ToneVolume | null = null;
  private objectUrl: string | null = null;
  private rafId: number | null = null;
  private handlers: AudioPlayerHandlers | null = null;

  private playing = false;
  private durationSeconds = 0;
  private level = DEFAULT_VOLUME; // linear 0..1
  private offset = 0; // track position (s) at the last (re)start
  private startedAt = 0; // audio-context time of the last (re)start

  setHandlers(handlers: AudioPlayerHandlers): void {
    this.handlers = handlers;
  }

  get duration(): number {
    return this.durationSeconds;
  }

  /** Load an audio blob, replacing any currently loaded track. Returns its duration. */
  async load(blob: Blob): Promise<number> {
    const tone = await this.ensureTone();
    this.teardown();
    this.objectUrl = URL.createObjectURL(blob);
    this.volumeNode = new tone.Volume(this.toDb(this.level)).toDestination();
    const player = new tone.Player();
    await player.load(this.objectUrl);
    player.connect(this.volumeNode);
    this.player = player;
    this.durationSeconds = player.buffer.duration;
    return this.durationSeconds;
  }

  async play(): Promise<void> {
    if (!this.player || this.playing) {
      return;
    }
    const tone = await this.ensureTone();
    await tone.start(); // resume the audio context on the user gesture
    if (this.offset >= this.durationSeconds) {
      this.offset = 0;
    }
    this.player.start(undefined, this.offset);
    this.startedAt = tone.now();
    this.playing = true;
    this.tick();
  }

  pause(): void {
    if (!this.player || !this.playing) {
      return;
    }
    this.offset = this.currentPosition();
    this.player.stop();
    this.playing = false;
    this.stopTick();
    this.handlers?.onPosition(this.offset);
  }

  stop(): void {
    if (!this.player) {
      return;
    }
    this.player.stop();
    this.playing = false;
    this.offset = 0;
    this.stopTick();
    this.handlers?.onPosition(0);
  }

  seek(seconds: number): void {
    const clamped = Math.max(0, Math.min(seconds, this.durationSeconds));
    this.offset = clamped;
    if (this.playing && this.player && this.tone) {
      this.player.stop();
      this.player.start(undefined, clamped);
      this.startedAt = this.tone.now();
    }
    this.handlers?.onPosition(clamped);
  }

  setVolume(level: number): void {
    this.level = Math.max(0, Math.min(level, 1));
    if (this.volumeNode) {
      this.volumeNode.volume.value = this.toDb(this.level);
    }
  }

  /** Release the player, audio nodes and object URL. */
  dispose(): void {
    this.teardown();
  }

  private currentPosition(): number {
    if (!this.playing || !this.tone) {
      return this.offset;
    }
    const elapsed = this.tone.now() - this.startedAt;
    return Math.min(this.offset + elapsed, this.durationSeconds);
  }

  private tick = (): void => {
    if (!this.playing) {
      return;
    }
    const position = this.currentPosition();
    if (position >= this.durationSeconds) {
      this.player?.stop();
      this.playing = false;
      this.offset = 0;
      this.stopTick();
      this.handlers?.onEnded();
      return;
    }
    this.handlers?.onPosition(position);
    this.rafId = requestAnimationFrame(this.tick);
  };

  private stopTick(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private teardown(): void {
    this.stopTick();
    this.player?.dispose();
    this.volumeNode?.dispose();
    this.player = null;
    this.volumeNode = null;
    this.playing = false;
    this.offset = 0;
    this.durationSeconds = 0;
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  private toDb(level: number): number {
    return this.tone ? this.tone.gainToDb(level) : 0;
  }

  private async ensureTone(): Promise<ToneRuntime> {
    if (!this.tone) {
      this.tone = await import("tone");
    }
    return this.tone;
  }
}

/** Single shared player — one reference track plays at a time. */
export const audioPlayer = new AudioPlayerController();
