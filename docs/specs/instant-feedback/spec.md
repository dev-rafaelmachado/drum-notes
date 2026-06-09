# Specification — Instant Audio Feedback (AUDIO-004)

## Overview

Instant Audio Feedback plays the sound of a drum voice the moment a note is
placed or clicked in the editor, so a drummer can confirm by ear that they are
writing on the right instrument. It realises backlog item AUDIO-004 (Instant
Audio Feedback; tracked as SKI-10).

The feature introduces a small, **reusable instrument-audio engine** exposing a
simple `play(instrument)` API over **Tone.js**. The same engine is intended to
back **Phase 1 Score Playback** (per-instrument sound) — so this work brings
forward that foundation. It **consumes the existing
[`Instrument`](../../architecture/domain.md) set** and adds **no** notation,
storage, or domain changes; audio feedback never reads or writes score data.

Related decisions: [ADR-009 Instrument audio engine](../../adr/009-instrument-audio.md);
builds on [ADR-005 Audio playback (Tone.js)](../../adr/005-audio-playback.md).

---

## Goal

When the drummer clicks a cell, immediately sound that instrument — low latency,
no interruption to editing, and no change to the score beyond the edit itself.

---

## User Stories

* As a drummer, I want to hear the instrument when I place a note, so I can
  confirm I'm on the right voice and position.
* As a drummer, I want clicking an existing note to sound its instrument, so I
  can audition what I wrote.
* As a drummer, I want the sound to be instant and unobtrusive, so it never
  slows down writing.

---

## Functional Requirements

### 1. Feedback On Edit

* Clicking an **empty cell** creates the note **and** plays that instrument's
  sound.
* Clicking a **cell that already has a note** plays that instrument's sound.
  (The click still toggles the note per the existing editor behaviour; the sound
  is independent feedback.)

### 2. All Instruments Supported

* Every one of the eight supported instruments (`hiHat`, `ride`, `crash`,
  `snare`, `tom1`, `tom2`, `floorTom`, `kick`) has a distinct feedback sound.

### 3. Reusable Playback API

* A simple engine exposes **`play(instrument)`** (e.g. `play("kick")`,
  `play("snare")`). The engine is **reusable** by future playback features
  (Score Playback) without change to its callers.

### 4. Latency & Non-Interruption

* Feedback occurs with **minimal latency**.
* Feedback is **fire-and-forget**: it never blocks, awaits, or interrupts the
  edit, and it **never modifies score data**.

---

## Non-Functional Requirements

* **Low latency** — the audio context is resumed on first interaction and voices
  are ready, so a click sounds without perceptible delay.
* **Offline-first** — the default kit is **synthesized** (Tone.js voices), with
  no sample assets to fetch (see [ADR-009](../../adr/009-instrument-audio.md));
  it works with no network.
* **Read-only feedback** — the engine has no access to the `Score`; playing a
  sound cannot alter notation.
* **SSR-safe** — Tone is imported lazily so the engine never evaluates
  browser-only code during server rendering.
* **Reusability** — the `play(instrument)` API is stable so Score Playback and a
  future recorded sample pack can reuse it behind the same interface.

---

## Out of Scope

Explicitly deferred (per the issue):

* **Score playback** — scheduled playback of the whole notation (Phase 1 / the
  other AUDIO-004 backlog item); this feature only provides the shared engine.
* **BPM synchronization.**
* **Velocity dynamics** — feedback plays at a fixed level.
* **MIDI export.**
* **Custom sample packs** — a single built-in default kit only.

---

## Acceptance Criteria

This feature is complete when:

1. Clicking an **empty cell** creates a note and immediately plays the
   corresponding instrument sound.
2. Clicking a **kick** note plays a kick sound.
3. Clicking a **snare** note plays a snare sound.
4. Clicking a **hi-hat** note plays a hi-hat sound.
5. Clicking a **crash** note plays a crash sound.
6. Audio feedback occurs within an **acceptable latency** threshold.
7. Audio feedback **does not modify** existing score data.

Test cases covering these criteria are in [tests.md](tests.md); the
implementation breakdown is in [tasks.md](tasks.md).
