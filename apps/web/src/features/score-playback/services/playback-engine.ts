import {
  buildPlaybackSchedule,
  loopRegion,
  type PlaybackSchedule,
  type Score,
} from "@drum-notes/notation-engine";

import { instrumentPlayer } from "@/features/instrument-audio/services/instrument-player";

/**
 * Tone.js Transport playback engine (see docs/adr/010-score-playback.md and
 * docs/adr/011-loop-speed.md). It schedules the domain-derived playback schedule
 * on the transport and sounds each note through the shared instrument engine
 * (AUDIO-004). Tone is imported lazily so the module is SSR-safe. Progress
 * (current measure + step) is polled from the transport clock for the highlight.
 *
 * Practice controls (PRACT-001): a loop region repeats a measure range via the
 * transport's native loop, and a speed factor scales the playback rate through
 * `Transport.bpm` (Tone v15 has no `playbackRate` field). Note times are divided
 * by the speed at schedule time so their musical positions — and the highlight —
 * stay speed-invariant; only wall-clock timing changes, and pitch is unaffected
 * because the voices are synthesised.
 */

interface TransportLike {
  schedule(callback: (time: number) => void, time: number): number;
  start(time?: number, offset?: number): TransportLike;
  pause(time?: number): TransportLike;
  stop(time?: number): TransportLike;
  cancel(after?: number): TransportLike;
  readonly seconds: number;
  readonly bpm: { value: number };
  loop: boolean;
  loopStart: number;
  loopEnd: number;
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

/** A loop range as inclusive measure indices. */
export type LoopRange = { readonly start: number; readonly end: number };

const DEFAULT_BPM = 120;

class PlaybackEngine {
  private tone: ToneRuntime | null = null;
  private schedule: PlaybackSchedule | null = null;
  private handlers: PlaybackHandlers | null = null;
  private rafId: number | null = null;
  private playing = false;

  // Practice state (session-only; mirrored from the store).
  private speed = 1;
  private loop: LoopRange | null = null;
  private baseBpm = DEFAULT_BPM;

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
    this.baseBpm = score.bpm;
    transport.bpm.value = this.baseBpm * this.speed;

    // A loop plays its whole region every iteration and starts at the loop start;
    // otherwise play from the requested measure to the end of the score.
    const region = this.loop ? loopRegion(schedule, this.loop.start, this.loop.end) : null;
    const offset = region ? region.start : (schedule.measureStarts[fromMeasure] ?? 0);

    for (const note of schedule.notes) {
      const inRange = region
        ? note.time >= region.start && note.time < region.end
        : note.time >= offset;
      if (inRange) {
        const { instrument } = note;
        // Divide by speed: the bpm already carries the rate, so the resulting
        // tick is speed-invariant (the rate cancels) — see the module note.
        transport.schedule((time) => instrumentPlayer.trigger(instrument, time), note.time / this.speed);
      }
    }

    this.applyLoop(transport);

    this.playing = true;
    transport.start(undefined, offset / this.speed);
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
    // Release the loop so a following metronome run does not inherit it.
    transport.loop = false;
    this.playing = false;
    this.stopTick();
  }

  /** Set the playback speed (rate). Applies live while playing. */
  setSpeed(rate: number): void {
    this.speed = rate;
    if (this.tone) {
      this.tone.getTransport().bpm.value = this.baseBpm * rate;
    }
  }

  /** Set or clear the loop region (inclusive measure indices). Applies live. */
  setLoop(range: LoopRange | null): void {
    this.loop = range;
    if (this.tone && this.schedule) {
      this.applyLoop(this.tone.getTransport());
    }
  }

  private applyLoop(transport: TransportLike): void {
    if (this.loop && this.schedule) {
      const region = loopRegion(this.schedule, this.loop.start, this.loop.end);
      // Divide by speed so the loop points land on speed-invariant musical ticks.
      transport.loopStart = region.start / this.speed;
      transport.loopEnd = region.end / this.speed;
      transport.loop = true;
    } else {
      transport.loop = false;
    }
  }

  private tick = (): void => {
    if (!this.playing || !this.tone || !this.schedule) {
      return;
    }
    // Transport.seconds runs at the scaled rate; recover schedule-time seconds.
    const seconds = this.tone.getTransport().seconds * this.speed;
    // A looping transport never reaches the end, so only auto-stop without a loop.
    if (!this.loop && seconds >= this.schedule.duration) {
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
