import type { Instrument } from "@drum-notes/notation-engine";
import type { Filter, MembraneSynth, MetalSynth, NoiseSynth } from "tone";

import { INSTRUMENT_VOICES, type VoiceConfig } from "./instrument-voices";

/**
 * Reusable instrument-audio engine (see docs/adr/009-instrument-audio.md). A
 * single `play(instrument)` entry point synthesizes a drum voice with Tone.js —
 * the only place that touches Tone for instrument sound. Designed to be reused
 * by future Score Playback, and to allow a recorded sample pack to replace the
 * synth voices behind the same API.
 *
 * `play` is fire-and-forget: it lazily imports Tone (SSR-safe), resumes the
 * audio context on first use, caches one voice per instrument, and never throws
 * to the caller — so audio feedback can never interrupt editing.
 */

/** The subset of the Tone.js module this engine uses at runtime. */
interface ToneRuntime {
  start(): Promise<void>;
  now(): number;
  MembraneSynth: typeof MembraneSynth;
  MetalSynth: typeof MetalSynth;
  NoiseSynth: typeof NoiseSynth;
  Filter: typeof Filter;
}

type Trigger = (time: number) => void;

class InstrumentPlayer {
  private tone: ToneRuntime | null = null;
  private started = false;
  private readonly triggers = new Map<Instrument, Trigger>();

  /** Sound an instrument now. Safe to call anywhere; failures are swallowed. */
  play(instrument: Instrument): void {
    void this.playSafely(instrument);
  }

  private async playSafely(instrument: Instrument): Promise<void> {
    try {
      const tone = await this.ensureTone();
      if (!this.started) {
        await tone.start(); // resume the audio context on the user gesture
        this.started = true;
      }
      let trigger = this.triggers.get(instrument);
      if (!trigger) {
        trigger = this.buildTrigger(tone, INSTRUMENT_VOICES[instrument]);
        this.triggers.set(instrument, trigger);
      }
      trigger(tone.now());
    } catch {
      // Fire-and-forget: feedback must never interrupt the editing workflow.
    }
  }

  private buildTrigger(tone: ToneRuntime, config: VoiceConfig): Trigger {
    switch (config.kind) {
      case "membrane": {
        const synth = new tone.MembraneSynth({
          envelope: { attack: 0.001, decay: config.decay, sustain: 0, release: 0.02 },
        }).toDestination();
        return (time) => synth.triggerAttackRelease(config.note, config.decay, time);
      }
      case "metal": {
        const synth = new tone.MetalSynth({
          envelope: { attack: 0.001, decay: config.decay, release: 0.05 },
        }).toDestination();
        synth.frequency.value = config.frequency;
        return (time) => synth.triggerAttackRelease(config.decay, time);
      }
      case "noise": {
        const filter = new tone.Filter(config.highpass, "highpass").toDestination();
        const synth = new tone.NoiseSynth({
          noise: { type: config.noise },
          envelope: { attack: 0.001, decay: config.decay, sustain: 0, release: 0.02 },
        }).connect(filter);
        return (time) => synth.triggerAttackRelease(config.decay, time);
      }
    }
  }

  private async ensureTone(): Promise<ToneRuntime> {
    if (!this.tone) {
      this.tone = (await import("tone")) as unknown as ToneRuntime;
    }
    return this.tone;
  }
}

/** Single shared engine — one instrument voice set for the whole app. */
export const instrumentPlayer = new InstrumentPlayer();
