# Specification — Measure Timestamp Projection (AUDIO-006)

## Overview

Measure Timestamp Projection lets a drummer define the starting timestamp of a
single measure and have the system automatically calculate the remaining measure
positions using the project's BPM and time signature. It realises backlog item
[AUDIO-006](../../product/backlog.md) and **Phase 2** of the
[roadmap](../../product/roadmap.md).

It builds on the synchronization model from
[Score Synchronization (AUDIO-003)](../score-sync/spec.md): projections are
stored as regular `SyncMap` entries and work identically to manually created
mappings. The feature consumes the existing timing helpers from
[ADR-007 Metronome](../../adr/007-metronome.md) (`beatsPerMeasure`,
`secondsPerBeat`) so tempo is derived from the canonical Score fields with no
new representation.

Related decisions: [ADR-008 Score synchronization](../../adr/008-score-sync.md);
builds on [ADR-003 Score model](../../adr/003-score-model.md).

---

## Goal

Let the drummer sync a song to the score by defining one anchor measure's
timestamp, then automatically project the rest — removing repetitive manual
mapping for songs recorded to a stable tempo.

---

## User Stories

* As a drummer, I want to set the starting timestamp of a measure, so the app
  can calculate where every other measure begins.
* As a drummer, I want projected timestamps to appear instantly, so I can see
  the full sync map without mapping each bar by hand.
* As a drummer, I want to fine-tune a projected timestamp, so I can correct
  slight drift without starting over.
* As a drummer, I want to regenerate all projections from the anchor, so I can
  adjust the anchor and recalculate in one step.

---

## Functional Requirements

### 1. Anchor Definition

* The user selects a measure and assigns a start timestamp (in seconds).
* The timestamp can be entered manually or captured from the current playback
  position.
* The anchor measure and its timestamp are stored for regeneration.

### 2. Forward Projection

* All measures **after** the anchor receive projected timestamps based on the
  project's BPM and time signature.
* Measure duration is calculated as:
  `beatsPerMeasure(timeSignature) * secondsPerBeat(bpm, timeSignature)`.
* Each projected measure's `[start, end)` window equals one measure duration.
* Measures **before** the anchor are not modified by the projection.

### 3. Integration With SyncMap

* Projected entries are stored using the same `MeasureTimestamp` model as
  manually created mappings.
* Projected entries are indistinguishable from manual entries in the SyncMap —
  they participate in `activeMeasureAt`, `measureStart`, seeking, and
  highlight identically.

### 4. Manual Override

* After projection, the user can manually adjust any measure's timestamp using
  the existing sync controls (mark, clear).

### 5. Regeneration

* The user can trigger regeneration, which re-projects all forward measures
  from the stored anchor.
* Regeneration overwrites any previously projected timestamps for measures
  after the anchor; manually adjusted measures before the anchor are untouched.

---

## Non-Functional Requirements

* **Requires a loaded track** — projection is available once a reference track
  is uploaded; without one, the score behaves exactly as before.
* **Separation of concerns** — projection math lives in the domain
  (`packages/notation-engine`); orchestration and persistence live in the app
  layer. The SyncMap is never part of the notation model.
* **Offline-first** — projected mappings persist locally in the same IndexedDB
  sync store as manual mappings.
* **Deterministic** — given the same BPM, time signature, anchor, and measure
  count, projection always produces identical timestamps.

---

## Out of Scope

Explicitly deferred:

* **BPM detection** — the user must know the song's tempo.
* **Tempo map support** — only constant-BPM songs are supported.
* **Variable BPM songs** — no interpolation or multi-anchor support.
* **Automatic beat detection** — no audio analysis.
* **AI-assisted synchronization** — no智能 detection of measure boundaries.
* **Backward projection** — only measures after the anchor are projected.

---

## Acceptance Criteria

This feature is complete when:

1. A user can **assign a start timestamp** to a selected measure.
2. The system **automatically generates** projected timestamps for all subsequent
   measures.
3. Generated timestamps are **based on BPM and time signature** using existing
   domain helpers.
4. Projected entries are **stored as regular SyncMap entries** and participate
   in all existing sync features (highlight, seek, scroll).
5. The user can **manually override** any projected timestamp.
6. The user can **regenerate** all projections from the stored anchor.

Test cases covering these criteria are in [tests.md](tests.md); the
implementation breakdown is in [tasks.md](tasks.md).
