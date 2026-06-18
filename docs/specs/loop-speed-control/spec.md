# Specification — Loop Playback + Speed Control (PRACT-001)

## Overview

Loop Playback + Speed Control turns score playback into a focused practice tool:
the drummer selects a range of measures to repeat continuously and adjusts the
playback tempo without altering pitch. It realises backlog item
[PRACT-001](../../product/backlog.md) and opens the **Practice Suite**.

It builds directly on
[Score Playback (AUDIO-005)](../score-playback/spec.md): looping and speed are
applied to the same Tone.js Transport that already plays the domain-derived
`PlaybackSchedule`. No new notation model is introduced — loop boundaries are a
pure projection of the existing schedule, and speed is a transport-level rate.

Related decisions: [ADR-011 Loop & variable speed](../../adr/011-loop-speed.md);
builds on [ADR-010 Score playback](../../adr/010-score-playback.md) and
[ADR-007 Metronome](../../adr/007-metronome.md) (single transport owner). It is
the foundation for [PRACT-002 Practice Mode](../../product/backlog.md) and shares
loop regions with [AUDIO-007 Waveform Display](../../product/backlog.md).

---

## Goal

Let a drummer isolate a difficult passage and practice it repeatedly at a
comfortable tempo — looping a measure range and slowing playback down (or
speeding it up) without pitch artefacts — entirely inside the editor.

---

## User Stories

* As a drummer, I want to set a loop start and end measure, so playback repeats
  just the section I am practising.
* As a drummer, I want playback to restart automatically at the loop end, so I
  can practise hands-free.
* As a drummer, I want to change the playback speed while playing, so I can slow
  a hard passage down and bring it back up.
* As a drummer, I want the pitch to stay the same when I change speed, so the
  drums still sound right.
* As a drummer, I want to see which measures are in the loop, so I know what will
  repeat.

---

## Functional Requirements

### 1. Loop Selection

* The user selects a **loop region** as a contiguous range of measures
  (`[startIndex, endIndex]`, inclusive).
* The range is defined by interacting with measure headers: the first selected
  measure begins the region; selecting a later measure extends it; selecting a
  measure inside or before the region adjusts it.
* The user can clear the loop, returning to normal start-to-end playback.

### 2. Loop Playback

* When a loop is active, playback repeats continuously: on reaching the end of
  the loop region it restarts from the loop start.
* The loop window in seconds is `[measureStart(startIndex),
  measureStart(endIndex) + measureDuration)`, derived from the existing
  `PlaybackSchedule`.
* Loop playback reuses the existing play / pause / resume / stop controls and the
  measure/step highlight from AUDIO-005.

### 3. Speed Control

* The user chooses a playback speed from a fixed set: **0.5×, 0.75×, 1×, 1.5×,
  2×** (1× is the default).
* Speed scales the Tone.js Transport playback rate (applied via `Transport.bpm`
  in Tone v15, which has no separate `playbackRate` field); because drum voices
  are synthesised and triggered on the transport timeline, **pitch is unchanged**.
* Speed can be changed at any time, including **while playing**, and takes effect
  immediately.

### 4. Visual Loop Region

* Measures within the active loop region are visually distinguished in their
  headers; the start and end measures are marked as the region boundaries.
* The indicator is distinct from the blue "playing" highlight (AUDIO-005) and the
  anchor indicator (AUDIO-006), and is not colour-only.

### 5. Session Persistence

* Loop region and speed persist in memory for the **current session** (across
  play / pause / stop) but are **never** written to the Score or to storage.
* Reloading the page resets loop and speed to their defaults.

---

## Non-Functional Requirements

* **No notation-model change** — loop boundaries are a pure projection of the
  `PlaybackSchedule`; speed is transport state. The Score is untouched.
* **Separation of concerns** — loop-window math lives in the domain
  (`packages/notation-engine`); transport orchestration lives in the
  score-playback engine; UI state lives in the playback store.
* **Single transport owner** — loop and speed apply to the same global
  Tone.Transport that AUDIO-005 owns; the metronome remains mutually exclusive
  with playback (ADR-010).
* **Extensible** — the loop region and speed are exposed as store state so
  [PRACT-002](../../product/backlog.md) (auto-advancing tempo) and
  [AUDIO-007](../../product/backlog.md) (waveform loop regions) can drive them.

---

## Out of Scope

Explicitly deferred:

* **Saving loop/speed inside the score** — they are session-only.
* **Automatic difficulty detection** — no analysis picks the loop for the user.
* **Auto-advancing tempo per loop** — that is [PRACT-002](../../product/backlog.md).
* **Pitch-preserving time-stretch of a reference audio track** — only the
  synthesised score playback is sped up here; reference-track stretching is a
  separate concern.
* **Defining loops by dragging a waveform** — that is
  [AUDIO-007](../../product/backlog.md).

---

## Acceptance Criteria

This feature is complete when:

1. A user can **select a range of measures** to loop.
2. Playback **automatically restarts** when it reaches the loop end.
3. A user can **change playback speed while playing**.
4. Audio **pitch remains unchanged** when speed changes.
5. The **loop region is visible** on the measure headers.
6. Loop and speed are **session-only** — never saved to the score or storage.

Test cases covering these criteria are in [tests.md](tests.md); the
implementation breakdown is in [tasks.md](tasks.md).
