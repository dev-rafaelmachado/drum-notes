# Specification — Audio Upload (AUDIO-001)

## Overview

Audio Upload lets a drummer attach a reference recording to a project and play
it back inside Drum Notes, so they can transcribe a song without switching to an
external player. It realises backlog item
[AUDIO-001](../../product/backlog.md) and brings forward part of
[Phase 2 — Audio Synchronization](../../product/roadmap.md); this spec covers
**upload and playback only**, not score-to-audio synchronization (that remains
AUDIO-003 / Phase 2).

The audio attaches to the existing **project**, i.e. the canonical
[`Score`](../../architecture/domain.md) (Score → Measure → Note). The `Score`
gains an optional **audio reference** (framework-agnostic metadata only); the
audio **blob** is persisted separately in IndexedDB. Playback uses **Tone.js**.

Related decisions: [ADR-005 Audio playback (Tone.js)](../../adr/005-audio-playback.md),
[ADR-006 Audio storage & Score audio reference](../../adr/006-audio-storage.md).
Builds on [ADR-002 IndexedDB](../../adr/002-indexeddb.md) and
[ADR-003 Score model](../../adr/003-score-model.md).

---

## Goal

Let a drummer upload an MP3 or WAV into their project and control its playback —
play, pause, stop, seek and volume — while writing notation, fully offline.

---

## User Stories

* As a drummer, I want to upload a song into my project, so I can transcribe it
  without leaving the app.
* As a drummer, I want the uploaded song to stay with the project, so it is
  still there when I reopen the score.
* As a drummer, I want to play, pause and stop the song, so I can work through
  it at my own pace.
* As a drummer, I want to seek to any point in the song, so I can replay the
  section I am transcribing.
* As a drummer, I want to see the current playback position, so I know where I am
  in the song.
* As a drummer, I want to adjust the volume, so the reference track sits at a
  comfortable level.

---

## Functional Requirements

### 1. Upload

* Upload an audio file from the user's device.
* Support **MP3** (`audio/mpeg`).
* Support **WAV** (`audio/wav`, `audio/wave`, `audio/x-wav`).
* Reject unsupported types with a clear, non-blocking message.
* Replacing the audio of a project that already has one removes the previous
  blob (one reference track per project).

### 2. Association & Persistence

* The uploaded audio is **associated with the project** (the `Score`).
* The `Score` holds an **audio reference** — `id`, `fileName`, `mimeType`,
  `duration` — and nothing else about the file (see
  [domain.md](../../architecture/domain.md)).
* The audio **blob** is stored locally in a dedicated IndexedDB `audio` store,
  keyed by the reference `id` (see [storage.md](../../architecture/storage.md)).
* On **reopen**, the project restores its audio reference and the blob loads from
  storage — the track is still attached.
* Deleting a project deletes its associated audio blob.

### 3. Playback Controls

Driven by Tone.js (see [ADR-005](../../adr/005-audio-playback.md)):

* **Play** — start (or resume) playback from the current position.
* **Pause** — stop playback, keeping the current position.
* **Stop** — stop playback and reset the position to the start.
* **Seek** — move the playback position to any point in `[0, duration]`;
  seeking while playing continues from the new position.
* **Volume** — adjust output level; changes apply **immediately**, during
  playback, with no restart.

### 4. Position Display

* Display the **current playback position** and the **total duration**.
* The position updates continuously during playback and reflects seeks.

---

## Non-Functional Requirements

* **Offline-first** — upload, persistence and playback work with no network; the
  blob lives in IndexedDB.
* **Responsive controls** — play / pause / stop / seek / volume feel immediate.
* **Domain stays framework-agnostic** — only audio *metadata* touches the domain;
  the blob, Tone.js and Browser APIs stay in the application layer.
* **Accessibility** — controls are keyboard-operable, carry accessible labels,
  and use semantic HTML (see [coding-standards](../../../.claude/coding-standards.md)).

---

## Out of Scope

Explicitly deferred:

* **BPM detection** and **audio analysis** — excluded by the issue (AUDIO-003 /
  AUDIO-004, Phase 3).
* **Score ↔ audio synchronization** — current-measure indicator, auto-scroll,
  playhead (AUDIO-003).
* **Waveform visualization.**
* **Multiple tracks per project**, audio trimming/editing, loop regions.
* **Format conversion** and **remote/streamed URLs** — local file upload only.

---

## Acceptance Criteria

This feature is complete when:

1. A user can **upload** a supported audio file (MP3 or WAV); unsupported files
   are rejected with a clear message.
2. The uploaded file is **associated with the project** and survives **reopen**.
3. A user can **play, pause, stop and seek** the audio.
4. The **playback position** and **duration** are displayed and update during
   playback.
5. **Volume changes affect playback immediately.**
6. Deleting the project removes its stored audio.

Test cases covering these criteria are in [tests.md](tests.md); the
implementation breakdown is in [tasks.md](tasks.md).
