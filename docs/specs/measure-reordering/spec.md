# Specification — Drag-and-Drop Measure Reordering (EDIT-004)

## Overview

Measure Reordering lets a drummer restructure a song by moving measures to new
positions — by dragging a measure header or with the keyboard — instead of
deleting and recreating sections. It realises backlog item
[EDIT-004](../../product/backlog.md) in the **Editing Experience** group and
builds on the [Score Editor](../score-editor/spec.md) MVP.

Reordering is a pure rearrangement of the canonical
[domain model](../../architecture/domain.md) (Score → Measure → Note): the same
`Measure` objects are moved within `Score.measures`, so every measure keeps its
`id` and its notes. It introduces **one** new domain operation,
`moveMeasure`, alongside the existing `addMeasure` / `removeMeasure` /
`duplicateMeasure` in the measures module — no new score representation.

Related decisions: [ADR-003 Score model](../../adr/003-score-model.md) (measures
are an ordered list keyed by id), [ADR-001 Zustand](../../adr/001-zustand.md)
(editor store orchestrates and autosaves), [ADR-002 IndexedDB](../../adr/002-indexeddb.md)
(autosave). It pairs with [EDIT-001 Undo / Redo](../../product/backlog.md), which
is a **dependency** for the "undoable" acceptance criterion (see
[Dependencies & Decisions](#dependencies--decisions)).

---

## Goal

Let a drummer move a measure to a new position in the score — preserving its
notes and identity — so song structure can be rearranged in place, without
deleting and recreating bars.

---

## User Stories

* As a drummer arranging a score, I want to drag a measure to a new position, so
  I can restructure a song without deleting and recreating sections.
* As a drummer, I want a clear drop indicator while dragging, so I know exactly
  where the measure will land.
* As a keyboard user, I want to move a measure left or right without a mouse, so
  reordering is fully accessible.
* As a drummer, I want a reorder to be undoable, so a wrong move costs nothing.
* As a drummer, I want the moved measure's notes to be exactly as they were, so
  reordering never alters my transcription.

---

## Functional Requirements

### 1. Domain Operation — `moveMeasure`

* A new pure operation `moveMeasure(score, measureId, toIndex)` in
  `packages/notation-engine` (the existing `operations/measures.ts` module)
  returns a new `Score` with the identified measure relocated to `toIndex`.
* The moved entry is the **same `Measure` object** — its `id` and `notes` are
  unchanged; only its position in `Score.measures` changes.
* `toIndex` is clamped to the valid range `[0, measures.length - 1]`. Moving a
  measure to its current position is a no-op that returns an equivalent score.
* An unknown `measureId` throws `MeasureNotFoundError`, consistent with
  `removeMeasure` / `duplicateMeasure`.
* The operation is framework-agnostic and side-effect free (no React, no storage,
  no Browser APIs).

### 2. Drag-and-Drop Reordering

* Each measure header carries a **drag handle** (a clearly grabbable control,
  not the whole header, so existing header actions stay clickable).
* The user can drag a measure and drop it before or after any other measure; on
  drop, the store applies `moveMeasure` with the target index.
* While dragging, a **drop indicator** shows the gap where the measure will land
  (a line/placeholder between measures), updating as the pointer moves.
* The pointer interaction uses the native HTML Drag and Drop API — no new
  dependency (see [Dependencies & Decisions](#dependencies--decisions)).

### 3. Keyboard Alternative

* Each measure header exposes **Move left** and **Move right** controls (move
  toward the start / end of the score) that call the same store action.
* The controls are reachable by keyboard and carry accessible labels (e.g.
  "Move measure 3 left"). The first measure's "move left" and the last
  measure's "move right" are disabled.
* Keyboard moves and drag-and-drop produce identical results and are equally
  undoable.

### 4. Immediate, Persisted Update

* The score re-renders immediately after a reorder; measure numbering (`Measure
  N`) reflects the new order.
* A reorder is a single meaningful edit and **autosaves** through the existing
  editor-store `edit()` path → IndexedDB, like every other measure operation.
* A reorder never mutates note data, BPM, time signature, subdivision, or any
  measure's `id`.

### 5. Undo / Redo Integration

* A reorder is recorded as a **single, atomic** entry in the editor history
  introduced by [EDIT-001](../../product/backlog.md); undo restores the previous
  order and redo re-applies the move.
* Because a move is exactly invertible (move the same measure back to its prior
  index), no bespoke undo stack is added here — the operation flows through the
  shared history like `toggleNote`, `addMeasure`, etc.
* **Dependency:** the "Reordering can be undone" acceptance criterion is
  satisfied by EDIT-001. See [Dependencies & Decisions](#dependencies--decisions)
  for sequencing.

---

## Non-Functional Requirements

* **No notation-model change** — reordering rearranges existing `Measure`
  objects; the `Score → Measure → Note` shape is untouched. No alternative score
  representation is introduced.
* **Identity preserved** — measures keep their `id`, so id-keyed satellite data
  (e.g. the [SyncMap](../../adr/008-score-sync.md), keyed by `measureId`) stays
  referentially valid after a reorder (see [Edge Cases](#edge-cases-and-interactions)).
* **Separation of concerns** — array-move logic lives in the domain; the editor
  store orchestrates and autosaves; components only render and dispatch.
* **Instant interactions** — reordering feels immediate, consistent with the
  editor's instant-feedback baseline.
* **Accessibility is not optional** — the feature is fully operable by keyboard,
  controls have accessible labels, and the drop indicator is not conveyed by
  colour alone.

---

## Edge Cases and Interactions

* **Single measure / no-op move** — a score with one measure cannot be
  reordered; moving a measure onto itself returns an equivalent score and
  records no spurious history entry.
* **Sync timestamps** — `SyncMap` entries reference measures by `id`, so they
  survive a reorder structurally. However, timestamps encode **absolute** track
  windows ordered by time; after reordering, visual measure order may no longer
  match audio order. Reordering does **not** rewrite timestamps — the user
  re-syncs if needed. (Out of scope: auto-recomputing sync on reorder.)
* **Active playback loop** — the session loop region (PRACT-001) is held as
  measure **indices**, not ids. To avoid a confusing silent remap, reordering is
  treated as an editing action: the spec does not require live remapping of the
  loop during a reorder; existing session loop/speed state is left as-is and the
  user re-selects if a move changes what an index points to.

---

## Out of Scope

Explicitly deferred:

* **Reordering individual notes** — only whole measures move.
* **Automatic song-structure detection** — no analysis suggests an arrangement.
* **Multi-measure drag** (moving a selected range at once) — pairs with
  [EDIT-003 Copy / Paste Measures](../../product/backlog.md).
* **Cross-project drag** — measures move only within their own score.
* **A drag-and-drop library / touch-drag support** — the native API covers the
  web target; adopting a library (e.g. for mobile) requires an ADR.
* **Re-syncing audio timestamps to the new order** — see
  [Edge Cases](#edge-cases-and-interactions).

---

## Dependencies & Decisions

* **Reuse via a new operation, not remove + add.** The backlog note suggests
  reusing `removeMeasure` + `addMeasure`. That path is rejected: `addMeasure`
  appends a **new, empty** measure with a fresh `id`, which would discard the
  moved measure's notes and break id-keyed references — violating "notes and
  measure data remain unchanged." A dedicated `moveMeasure` that splices the
  existing object is the identity-preserving fit and still lives in the same
  measures module (extending existing models, per the architecture rules).
* **EDIT-001 is a prerequisite for undo.** Undo/redo is not yet implemented
  (EDIT-001, status *Ideas*). `moveMeasure` is designed to be undoable for free
  once EDIT-001 lands (atomic, invertible edit through the shared history).
  Recommended sequencing: ship EDIT-001 first, then EDIT-004. If EDIT-004 ships
  first, acceptance criterion 5 is completed when EDIT-001 lands — no parallel
  undo stack is built here.
* **Native Drag and Drop, no new dependency.** Per the tech stack's "prefer
  built-in APIs / no new architectural dependency without an ADR", the pointer
  interaction uses the native HTML Drag and Drop API, and the keyboard
  alternative is implemented independently so accessibility never depends on a
  drag library. **No ADR is required** for this feature. Introducing a DnD
  library later (e.g. for touch/mobile) would require one.

---

## Acceptance Criteria

This feature is complete when:

1. A user can **drag a measure to a new position** and drop it there.
2. The score **updates immediately** and measure numbering reflects the new order.
3. The moved measure's **notes and data remain unchanged** (same `id`, same notes).
4. The **drop position is visually indicated** while dragging, and the indicator
   is not colour-only.
5. A reorder **can be undone** (via [EDIT-001](../../product/backlog.md)).
6. Reordering is **fully operable by keyboard** with accessible labels.

Test cases covering these criteria are in [tests.md](tests.md); the
implementation breakdown is in [tasks.md](tasks.md).
