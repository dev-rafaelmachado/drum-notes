import {
  beatsPerMeasure,
  isAccentBeat,
  secondsPerBeat,
  type TimeSignature,
} from "@drum-notes/notation-engine";
import type { Synth, Volume } from "tone";

/**
 * Tone.js Transport metronome (see docs/adr/007-metronome.md). The only place
 * that touches Tone.js / the Web Audio API for the click — timing math comes
 * from the domain (`secondsPerBeat`, `beatsPerMeasure`, `isAccentBeat`), so this
 * engine only schedules and synthesizes. Tone is imported lazily so the module
 * never evaluates browser-only code during server rendering.
 */

type SynthInstance = Synth;
type VolumeInstance = Volume;

/** The subset of the Tone.js Transport this engine drives. */
interface TransportLike {
  scheduleRepeat(
    callback: (time: number) => void,
    interval: number,
    startTime?: number,
  ): number;
  clear(eventId: number): TransportLike;
  start(time?: number): TransportLike;
  stop(time?: number): TransportLike;
  readonly seconds: number;
}

/** The subset of the Tone.js module this engine uses at runtime. */
interface ToneRuntime {
  start(): Promise<void>;
  getTransport(): TransportLike;
  gainToDb(gain: number): number;
  Synth: typeof Synth;
  Volume: typeof Volume;
}

const DEFAULT_VOLUME = 0.8;
const ACCENT_NOTE = "C6"; // higher click on the downbeat
const NORMAL_NOTE = "G5";
const CLICK_DURATION = "32n";
const DEFAULT_TIME_SIGNATURE: TimeSignature = { numerator: 4, denominator: 4 };

function clampLevel(level: number): number {
  return Math.max(0, Math.min(level, 1));
}

class MetronomeEngine {
  private tone: ToneRuntime | null = null;
  private synth: SynthInstance | null = null;
  private volumeNode: VolumeInstance | null = null;
  private eventId: number | null = null;

  private running = false;
  private beat = 0;
  private level = DEFAULT_VOLUME;
  private bpm = 120;
  private timeSignature: TimeSignature = DEFAULT_TIME_SIGNATURE;

  get isRunning(): boolean {
    return this.running;
  }

  async start(bpm: number, timeSignature: TimeSignature): Promise<void> {
    this.bpm = bpm;
    this.timeSignature = timeSignature;
    if (this.running) {
      this.setTiming(bpm, timeSignature);
      return;
    }
    const tone = await this.ensureTone();
    await tone.start(); // resume the audio context on the user gesture
    this.buildVoice(tone);
    this.beat = 0;
    this.schedule(tone);
    tone.getTransport().start();
    this.running = true;
  }

  stop(): void {
    if (!this.tone) {
      return;
    }
    const transport = this.tone.getTransport();
    if (this.eventId !== null) {
      transport.clear(this.eventId);
      this.eventId = null;
    }
    transport.stop();
    this.running = false;
    this.beat = 0;
  }

  /** Push the score's current tempo/meter; retempos a running metronome live. */
  setTiming(bpm: number, timeSignature: TimeSignature): void {
    this.bpm = bpm;
    this.timeSignature = timeSignature;
    if (this.running && this.tone) {
      this.schedule(this.tone);
    }
  }

  setVolume(level: number): void {
    this.level = clampLevel(level);
    if (this.volumeNode && this.tone) {
      this.volumeNode.volume.value = this.tone.gainToDb(this.level);
    }
  }

  dispose(): void {
    this.stop();
    this.synth?.dispose();
    this.volumeNode?.dispose();
    this.synth = null;
    this.volumeNode = null;
  }

  private schedule(tone: ToneRuntime): void {
    const transport = tone.getTransport();
    if (this.eventId !== null) {
      transport.clear(this.eventId);
    }
    const interval = secondsPerBeat(this.bpm, this.timeSignature);
    this.eventId = transport.scheduleRepeat(
      (time) => {
        const accent = isAccentBeat(this.beat, this.timeSignature);
        this.synth?.triggerAttackRelease(
          accent ? ACCENT_NOTE : NORMAL_NOTE,
          CLICK_DURATION,
          time,
          accent ? 1 : 0.7,
        );
        this.beat = (this.beat + 1) % beatsPerMeasure(this.timeSignature);
      },
      interval,
      transport.seconds,
    );
  }

  private buildVoice(tone: ToneRuntime): void {
    if (this.synth) {
      return;
    }
    this.volumeNode = new tone.Volume(tone.gainToDb(this.level)).toDestination();
    this.synth = new tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.02 },
    });
    this.synth.connect(this.volumeNode);
  }

  private async ensureTone(): Promise<ToneRuntime> {
    if (!this.tone) {
      this.tone = (await import("tone")) as unknown as ToneRuntime;
    }
    return this.tone;
  }
}

/** Single shared metronome — one click track at a time. */
export const metronomeEngine = new MetronomeEngine();
