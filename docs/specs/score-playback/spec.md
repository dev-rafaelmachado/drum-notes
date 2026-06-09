# Specification — Score Playback (AUDIO-005)

## Overview

Score Playback plays the written notation back with drum sounds so a drummer can
hear their transcription and catch mistakes before practising. It realises
backlog item AUDIO-005 (SKI-11) and **Phase 1 (Playback)** of the
[roadmap](../../product/roadmap.md).

Playback is **generated directly from the canonical
[domain model](../../architecture/domain.md)** (Score → Measure → Note). A pure
**playback schedule** is derived from the model — a timed projection, analogous
to the export [`ScoreLayout`](../../architecture/domain.md) — so **no
playback-specific notation model is introduced**. Scheduling uses **Tone.js
Transport**, and each note is sounded through the **reusable instrument-audio
engine from [AUDIO-004](../instant-feedback/spec.md)** (lightly extended with a
time-scheduled trigger).

Related decisions: [ADR-010 Score playback engine](../../adr/010-score-playback.md);
builds on [ADR-003 Score model](../../adr/003-score-model.md),
[ADR-007 Metronome (Tone.Transport)](../../adr/007-metronome.md), and
[ADR-009 Instrument audio engine](../../adr/009-instrument-audio.md).

---

## Goal

Let the drummer press play and hear their score at the project tempo — with
start / pause / resume / stop, a moving highlight on the measure and notes being
played, and the ability to start from any measure.

---

## User Stories

* As a drummer, I want to play my score and hear it, so I can tell whether the
  rhythm matches what I intended.
* As a drummer, I want to pause, resume and stop playback, so I can work at my
  own pace.
* As a drummer, I want playback to follow the project BPM, so it sounds at the
  right tempo.
* As a drummer, I want to see which measure and notes are playing, so I can read
  along.
* As a drummer, I want to start playback from a chosen measure, so I can audition
  a specific part.

---

## Functional Requirements

### 1. Transport Controls

* **Play** the current score from the start.
* **Pause** playback, keeping the position.
* **Resume** from the paused position.
* **Stop** playback and reset to the start.

### 2. Tempo

* Playback rate **follows the project `Score.bpm`** (and time signature /
  subdivision). The tempo is applied when playback starts.

### 3. Instrument Sound

* Each note triggers the **correct instrument sound** via the AUDIO-004
  instrument-audio engine — a single shared sound source.

### 4. Start From A Measure

* Playback can **begin from a selected measure**, starting at that measure's
  position in the score.

### 5. Highlighting

* The **currently playing measure is highlighted** (reusing the active-measure
  highlight), and a **playhead** marks the current step within it so notes are
  highlighted as they play.

### 6. End Of Score

* Playback **stops correctly at the end** of the score (controls return to the
  stopped state, highlight clears).

---

## Non-Functional Requirements

* **Domain-derived** — the schedule is built from Score / Measure / Note only; no
  parallel notation representation (see [ADR-010](../../adr/010-score-playback.md)).
* **Accurate timing** — notes are scheduled on Tone.js Transport (sample-accurate),
  not `setInterval`.
* **Single transport owner** — the metronome ([ADR-007](../../adr/007-metronome.md))
  also drives the global Transport, so the two are **mutually exclusive**:
  starting score playback stops the metronome.
* **Offline-first** — uses the synthesized instrument kit; no network, no assets.
* **SSR-safe** — Tone is imported lazily.
* **Accessibility** — transport and per-measure controls are keyboard-operable
  with accessible labels; the playing measure is conveyed beyond colour alone.

---

## Extensibility

The engine is designed so these can be added later without reshaping it (the
schedule already carries per-note timing, instrument and position):

* **MIDI export**, **loop playback**, **variable playback speed**, and
  **velocity** support.

---

## Out of Scope

Explicitly deferred (per the issue):

* **Humanized playback** and **velocity dynamics** — notes play at a fixed level.
* **Audio recording** and **MIDI export.**
* **Custom sample packs.**
* **Synchronization with an uploaded song** — that is [AUDIO-003](../score-sync/spec.md);
  score playback is independent of the uploaded track.

---

## Acceptance Criteria

This feature is complete when:

1. A user can **start** score playback.
2. A user can **pause and resume** playback.
3. A user can **stop** playback.
4. Playback **follows the project BPM**.
5. **Each instrument triggers the correct sound.**
6. The **active measure is highlighted** during playback.
7. Playback can **begin from a selected measure**.
8. Playback **stops correctly at the end** of the score.

Test cases covering these criteria are in [tests.md](tests.md); the
implementation breakdown is in [tasks.md](tasks.md).
