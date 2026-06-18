import {
  buildPlaybackSchedule,
  type PlaybackSchedule,
  type Score,
} from "@drum-notes/notation-engine";

import { instrumentPlayer } from "@/features/instrument-audio/services/instrument-player";

/**
 * Tone.js Transport playback engine (see docs/adr/010-score-playback.md). It
 * schedules the domain-derived playback schedule on the transport and sounds
 * each note through the shared instrument engine (AUDIO-004). Tone is imported
 * lazily so the module is SSR-safe. Progress (current measure + step) is polled
 * from the transport clock for the highlight.
 */

interface TransportLike {
  scheduleOnce(callback: (time: number) => void, time: number): number;
  start(time?: number, offset?: number): TransportLike;
  pause(time?: number): TransportLike;
  stop(time?: number): TransportLike;
  cancel(after?: number): TransportLike;
  readonly seconds: number;
}

interface ToneRuntime {
  start(): Promise<void>;
  getTransport(): TransportLike;
}

export type PlaybackProgress = { readonly measureIndex: number; readonly step: number };

export type PlaybackHandlers = {
  readonly onProgress: (progress: PlaybackProgress) => void;
  readonly onEnded: () => void;
};

class PlaybackEngine {
  private tone: ToneRuntime | null = null;
  private schedule: PlaybackSchedule | null = null;
  private handlers: PlaybackHandlers | null = null;
  private rafId: number | null = null;
  private playing = false;

  setHandlers(handlers: PlaybackHandlers): void {
    this.handlers = handlers;
  }

  /** Build the schedule and start playing from `fromMeasure` (default: start). */
  async start(score: Score, fromMeasure = 0): Promise<void> {
    await instrumentPlayer.prepare();
    const tone = await this.ensureTone();
    await tone.start();

    const transport = tone.getTransport();
    transport.stop();
    transport.cancel(0);

    const schedule = buildPlaybackSchedule(score);
    this.schedule = schedule;
    const offset = schedule.measureStarts[fromMeasure] ?? 0;

    for (const note of schedule.notes) {
      if (note.time >= offset) {
        const { instrument } = note;
        transport.scheduleOnce((time) => instrumentPlayer.trigger(instrument, time), note.time);
      }
    }

    this.playing = true;
    transport.start(undefined, offset);
    this.tick();
  }

  pause(): void {
    if (!this.tone || !this.playing) {
      return;
    }
    this.tone.getTransport().pause();
    this.playing = false;
    this.stopTick();
  }

  resume(): void {
    if (!this.tone || this.playing || !this.schedule) {
      return;
    }
    this.tone.getTransport().start();
    this.playing = true;
    this.tick();
  }

  stop(): void {
    if (!this.tone) {
      return;
    }
    const transport = this.tone.getTransport();
    transport.stop();
    transport.cancel(0);
    this.playing = false;
    this.stopTick();
  }

  private tick = (): void => {
    if (!this.playing || !this.tone || !this.schedule) {
      return;
    }
    const { seconds } = this.tone.getTransport();
    if (seconds >= this.schedule.duration) {
      this.stop();
      this.handlers?.onEnded();
      return;
    }
    const measureIndex = Math.min(
      Math.floor(seconds / this.schedule.measureDuration),
      this.schedule.measureStarts.length - 1,
    );
    const within = seconds - this.schedule.measureStarts[measureIndex]!;
    const step = Math.floor(within / this.schedule.stepDuration);
    this.handlers?.onProgress({ measureIndex, step });
    this.rafId = requestAnimationFrame(this.tick);
  };

  private stopTick(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private async ensureTone(): Promise<ToneRuntime> {
    if (!this.tone) {
      this.tone = (await import("tone")) as unknown as ToneRuntime;
    }
    return this.tone;
  }
}

/** Single shared playback engine — one score plays at a time. */
export const playbackEngine = new PlaybackEngine();
