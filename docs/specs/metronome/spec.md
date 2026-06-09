# Specification — Project Metronome (AUDIO-002)

## Overview

The Project Metronome plays a steady click at the project's tempo so a drummer
can practise and transcribe with accurate timing. It realises backlog item
[AUDIO-002](../../product/backlog.md).

The metronome **consumes the canonical [domain model](../../architecture/domain.md)**:
it reads the `Score`'s `bpm` and `timeSignature` — it introduces no parallel
tempo representation and does not modify the `Score`. The **timing math** (beats
per measure, accent positions, seconds per beat) lives in
`packages/notation-engine` as framework-agnostic playback-preparation helpers;
the **sound and scheduling** live in the app layer using **Tone.js Transport**
with a synthesized click.

Related decisions: [ADR-007 Metronome timing & click synthesis](../../adr/007-metronome.md);
builds on [ADR-005 Audio playback (Tone.js)](../../adr/005-audio-playback.md) and
[ADR-003 Score model](../../adr/003-score-model.md).

---

## Goal

Give the drummer a tempo-locked click — start/stop, accented downbeat, and
volume — that always follows the project BPM, fully offline.

---

## User Stories

* As a drummer, I want a click at the project tempo, so I can keep steady time
  while writing or practising.
* As a drummer, I want the click to match the score's BPM automatically, so I
  never set the tempo twice.
* As a drummer, I want the first beat of each measure to sound distinct, so I can
  feel where the bar starts.
* As a drummer, I want to start and stop the metronome, so I can use it only when
  I need it.
* As a drummer, I want to adjust the metronome volume, so it sits well against
  the track I'm transcribing.

---

## Functional Requirements

### 1. Start / Stop

* **Start** the metronome; it begins clicking at the project tempo.
* **Stop** the metronome; clicking ceases immediately.

### 2. BPM Synchronization

* The click rate follows the **`Score.bpm`**.
* Changing the score's BPM updates the click rate — **live** if the metronome is
  running — with no restart.

### 3. Downbeat Accent

* The **first beat of each measure is audibly distinct** (a higher-pitched
  click).
* The number of beats per measure derives from the **`Score.timeSignature`**.

### 4. Volume

* Adjust the metronome volume; changes apply **immediately**, independent of the
  uploaded reference track's volume ([audio-upload](../audio-upload/spec.md)).

---

## Non-Functional Requirements

* **Accurate timing** — clicks are scheduled with Tone.js Transport (sample-accurate),
  not `setInterval`, so the pulse does not drift.
* **Offline-first** — the click is **synthesized**; no audio sample assets, no
  network.
* **Independent of track playback** — the metronome and the uploaded-track player
  share the audio context but run independently; both may sound at once.
* **Responsive controls** — start / stop / volume feel immediate.
* **Accessibility** — controls are keyboard-operable, carry accessible labels,
  and use semantic HTML (see [coding-standards](../../../.claude/coding-standards.md)).

---

## Out of Scope

Explicitly deferred:

* **Tempo maps** and **variable / automated BPM changes** — excluded by the issue.
* **Count-in**, **subdivisions** (e.g. eighth/triplet clicks), and **swing**.
* **Selectable click sounds** or sample-based voices.
* **Visual beat indicator** — score ↔ playback visuals are AUDIO-003.
* **Persisting metronome settings** — volume and on/off are session UI state,
  not stored on the `Score` (consistent with the track volume).

---

## Acceptance Criteria

This feature is complete when:

1. The metronome **follows the project BPM**, including a **live BPM change**
   while running.
2. A user can **start and stop** the metronome.
3. A user can **adjust the metronome volume**, applied immediately.
4. The **first beat of each measure is audibly distinct** from the others.

Test cases covering these criteria are in [tests.md](tests.md); the
implementation breakdown is in [tasks.md](tasks.md).
