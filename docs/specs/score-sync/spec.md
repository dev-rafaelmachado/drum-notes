# Specification — Score Synchronization (AUDIO-003)

## Overview

Score Synchronization keeps the written score aligned with the uploaded track so
a drummer can see which measure is playing while they listen. It realises backlog
item [AUDIO-003](../../product/backlog.md) and **Phase 2** of the
[roadmap](../../product/roadmap.md).

It builds on the reference track and player position from
[Audio Upload (AUDIO-001)](../audio-upload/spec.md): the **active measure** is
derived from the audio player's current position.

Per the issue, **synchronization data is stored separately from notation data**.
A new **`SyncMap`** structure maps measures to timestamps
(`{ measureId, start, end }`); it references measure ids only and **never
modifies** the canonical [`Score`](../../architecture/domain.md). The active-measure
resolution is **pure domain logic**; highlight, scrolling and seeking are app-layer
concerns. The mapping is deliberately simple so future **automatic**
synchronization can regenerate it without touching notation.

Related decisions: [ADR-008 Score synchronization](../../adr/008-score-sync.md);
builds on [ADR-002 IndexedDB](../../adr/002-indexeddb.md),
[ADR-003 Score model](../../adr/003-score-model.md), and
[ADR-005 Audio playback (Tone.js)](../../adr/005-audio-playback.md).

---

## Goal

While the track plays, highlight the current measure, keep it on screen, and let
the drummer jump between a measure and its moment in the audio — both directions.

---

## User Stories

* As a drummer, I want to mark which measure each part of the song belongs to, so
  the app knows where I am.
* As a drummer, I want the current measure highlighted while the track plays, so I
  can follow along without counting.
* As a drummer, I want the score to scroll so the current measure stays visible,
  so I never lose my place.
* As a drummer, I want to click a measure and have the audio jump there, so I can
  replay a specific bar.
* As a drummer, I want seeking the audio to move the highlight, so the score
  always reflects where the song is.

---

## Functional Requirements

### 1. Measure ↔ Timestamp Mapping

* Associate a measure with a **start** and **end** timestamp in the track.
* The mapping is held **separately from notation** as a `SyncMap` of
  `{ measureId, start, end }` entries (see [ADR-008](../../adr/008-score-sync.md)).
* Mappings persist locally and reload with the project.

### 2. Active-Measure Display

* The measure whose time range contains the current playback position is
  **visually highlighted** as the active measure.

### 3. Automatic Update

* As playback progresses, the active measure **updates automatically** to follow
  the position.

### 4. Automatic Scroll

* The score **scrolls automatically** to keep the active measure visible.

### 5. Seek To Measure (score → audio)

* Selecting a mapped measure **moves playback** to that measure's start timestamp.

### 6. Seek To Timestamp (audio → score)

* Seeking or scrubbing the audio **updates the active measure** to match the new
  position.

---

## Non-Functional Requirements

* **Requires a loaded track** — synchronization is available once a reference
  track is uploaded ([AUDIO-001](../audio-upload/spec.md)); without one, the
  score behaves exactly as before.
* **Separation of concerns** — sync data lives in its own structure and store and
  **never mutates** the notation model.
* **Offline-first** — the `SyncMap` is persisted locally in its own IndexedDB
  store ([storage.md](../../architecture/storage.md)).
* **Smooth at playback rate** — highlight and scroll keep up with the position
  updates without perceptible jank.
* **Accessibility** — the active measure is conveyed by more than colour alone;
  mapping and seek controls are keyboard-operable with accessible labels.

---

## Out of Scope

Explicitly deferred:

* **Automatic measure detection**, **automatic beat detection**, and
  **AI-assisted synchronization** — excluded by the issue (later phases).
* **Tempo-derived auto-mapping** from BPM / time signature.
* **Exporting or sharing** synchronization data.
* **Multiple tracks** per project.

---

## Acceptance Criteria

This feature is complete when:

1. A user can **associate measures with timestamps**.
2. The **current measure is visually highlighted** during playback.
3. The **active measure updates correctly** as the song progresses.
4. The score **auto-scrolls** to keep the active measure visible.
5. **Seeking in the audio updates** the active measure.
6. **Selecting a measure moves playback** to the corresponding timestamp.

Test cases covering these criteria are in [tests.md](tests.md); the
implementation breakdown is in [tasks.md](tasks.md).
