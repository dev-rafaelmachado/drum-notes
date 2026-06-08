# Specification — Score Editor (MVP)

## Overview

The Score Editor is the MVP of Drum Notes. It lets a drummer create, edit, save
locally and export a simple drum score, without login, backend, or audio. It is
the realisation of [Phase 0](../../product/roadmap.md) and consumes the canonical
[domain model](../../architecture/domain.md) (Score → Measure → Note).

Related decisions: [ADR-001 Zustand](../../adr/001-zustand.md),
[ADR-002 IndexedDB](../../adr/002-indexeddb.md),
[ADR-003 Score model](../../adr/003-score-model.md).

---

## Goal

Allow drummers to create and edit drum notation on a grid, fast and offline.

---

## User Stories

* As a drummer, I want to place notes on a grid, so that I can transcribe songs.
* As a drummer, I can create a new score and set its BPM, time signature and
  subdivision, so the grid matches the song I'm transcribing.
* As a drummer, I can add, remove and duplicate measures, so I can build the
  song's structure quickly.
* As a drummer, I can toggle notes on any of the eight instruments at any valid
  position, so I can write the groove.
* As a drummer, my work is saved automatically, so I never lose progress and can
  reopen the project unchanged.
* As a drummer, I can export the score to PDF and PNG, so I can print or share
  it.

---

## Functional Requirements

### 1. Project Creation

* Create a new score.
* Set **BPM**.
* Set **time signature**.
* Set **subdivision** (defines the valid note positions in a measure).

### 2. Editing

* **Add** a measure.
* **Remove** a measure.
* **Duplicate** a measure (copies its notes).
* **Add / remove a note** on any instrument at any position that respects the
  configured subdivision.
* **Edit BPM** of the score.

### 3. Supported Instruments

Exactly eight (see [glossary](../../product/glossary.md#drum-terms)):

`Hi-Hat` · `Ride` · `Crash` · `Snare` · `Tom 1` · `Tom 2` · `Floor Tom` · `Kick`

### 4. Persistence

* **Autosave** locally (IndexedDB) on every meaningful edit: project creation,
  add/edit note, remove note, change BPM, change measure.
* **Reopen** a saved score and find it unchanged.

### 5. Export

* Export to **PDF**.
* Export to **PNG**.

---

## Non-Functional Requirements

* **Instant interactions** — editing a groove feels immediate, no perceptible lag.
* **Offline support** — the editor works fully without a network connection.

---

## Out of Scope

Deferred to later phases (see [roadmap](../../product/roadmap.md)):

* Login / accounts
* Backend
* Score sharing
* Audio playback
* AI assistance
* BPM recognition
* Mobile app

---

## Acceptance Criteria

The MVP is complete when:

1. A user can **create** a score (with BPM, time signature, subdivision).
2. A user can **edit** the score: add / remove / duplicate measures and toggle
   notes on all eight instruments.
3. A note can only be placed at a **position that respects the subdivision**.
4. Edits are **saved locally automatically**.
5. A user can **reopen** a locally-saved score unchanged.
6. A user can **export to PDF**.
7. A user can **export to PNG**.
8. Creating a simple score takes **under five minutes**.

Test cases covering these criteria are in [tests.md](tests.md); the
implementation breakdown is in [tasks.md](tasks.md).
