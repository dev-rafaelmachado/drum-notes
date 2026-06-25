# Specification — Waveform Display + Loop Regions (AUDIO-007)

## Overview

Waveform Display adds a visual audio timeline above the score so a drummer can
see the reference track's shape, follow the playback position, and drag-select
a region to practice in a loop. It realises backlog item
[AUDIO-007](../../product/backlog.md) as part of the audio synchronization track.

It builds on [Audio Upload (AUDIO-001)](../audio-upload/spec.md) for the stored
blob, [Score Synchronization (AUDIO-003)](../score-sync/spec.md) for the
SyncMap (measure ↔ timestamp bridge), and
[Loop Playback (PRACT-001)](../loop-speed-control/spec.md) for the loop
infrastructure the waveform selection drives.

Related decision: [ADR-013 Waveform data as derived session state + canvas
rendering](../../adr/013-waveform.md).

---

## Goal

While a reference track is loaded, display its waveform in the audio panel so
the drummer can visually locate song sections and drag a region to loop.

---

## User Stories

* As a drummer, I want to see the audio waveform in the panel, so I can visually
  identify beats and song sections without listening.
* As a drummer, I want a moving playhead on the waveform, so I can see exactly
  where I am in the track while it plays.
* As a drummer, I want to drag a region on the waveform to set a practice loop,
  so I can define the section I want to repeat without clicking individual
  measure headers.
* As a drummer, I want the waveform loop highlight and the measure-header loop
  indicator to always agree, so there is one consistent loop state.
* As a drummer, I want to click outside the selected region to clear the loop,
  so I can reset quickly.

---

## Functional Requirements

### 1. Waveform Rendering

* When a reference track is loaded (`audio-store.status === "ready"`), display a
  waveform strip inside the audio panel.
* The strip shows the full audio duration as a horizontal timeline; the
  waveform bars represent amplitude (`[min, max]` pairs per bucket).
* If no reference track is loaded, the strip is hidden.

### 2. Playback Position Indicator

* A vertical line on the waveform tracks `audio-store.position` in real time.
* The line moves continuously while the reference audio is playing.
* The playhead follows the reference-audio transport, not the score-playback
  transport (the two are independent — see [ADR-013](../../adr/013-waveform.md)).

### 3. Measure Tick Marks

* When a SyncMap is loaded, each mapped measure's start timestamp is drawn as a
  thin vertical tick on the waveform.
* Ticks are present when sync data exists and absent otherwise — no ticks are
  shown for unmapped measures.

### 4. Drag-Select Loop Region

* The user clicks and drags horizontally on the waveform to define a time range.
* While dragging, a translucent overlay shows the selected region.
* On mouse-up the drag is committed.

### 5. Loop Region → Playback Loop

* If a SyncMap is present, the selected time range is mapped to measure indices
  via `activeMeasureAt` and forwarded to `playback-store.setLoop`.
* The measure-header loop indicators (PRACT-001) update automatically because
  they read from the same `playback-store.loop`.
* If no SyncMap is present, the waveform overlay is still drawn but
  `playback-store.loop` is not changed (graceful degradation).

### 6. Waveform Loop Highlight

* The active loop region from `playback-store.loop` is reflected on the waveform
  as a persistent translucent overlay.
* The highlight is derived from the loop's measure indices → their SyncMap
  timestamps (`start` of the first, `end` of the last), so it always matches the
  measure-header indicator.
* If the loop is set via measure headers but no SyncMap is loaded, no overlay
  is drawn (the loop still applies to score playback).

### 7. Clear Loop

* Clicking on the waveform without dragging (no horizontal movement) clears
  the loop via `playback-store.clearLoop`.

---

## Non-Functional Requirements

* **Non-blocking generation** — waveform data is computed asynchronously;
  the panel remains interactive during generation.
* **Performant rendering** — the canvas redraws only when props change; the
  playhead update is rAF-driven (or triggered by the `audio-store.position`
  update cycle already in place).
* **Accessible** — the waveform canvas has an `aria-label`; the loop region
  includes a description; drag interaction is supplementary (measure headers
  remain the primary keyboard-accessible loop control from PRACT-001).
* **Offline-first** — no network calls; waveform is generated from the
  persisted local blob.
* **Graceful degradation** — works without a SyncMap (no loop sync) and without
  an audio track (strip hidden).

---

## Out of Scope

* Automatic beat detection.
* AI-based waveform analysis.
* Tempo detection.
* Looping the reference audio track (only score-playback loops).
* Storing waveform data in IndexedDB.
* Touch / mobile drag interaction (deferred to a later phase).

---

## Acceptance Criteria

1. User can see the waveform strip when a reference audio is loaded.
2. Playback position is visible as a moving line on the waveform while audio plays.
3. User can drag to select a region; the overlay appears during and after drag.
4. When a SyncMap is present, the selected region updates the measure-header loop
   indicator and the score-playback transport loops.
5. The waveform loop overlay matches the active `playback-store.loop` region.
6. Clicking (no drag) clears the active loop.

Test cases are in [tests.md](tests.md); implementation breakdown in [tasks.md](tasks.md).
