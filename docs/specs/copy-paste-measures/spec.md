# Specification — Copy / Paste Measures (EDIT-003)

## Overview

Copy / Paste Measures lets a drummer duplicate one or more measures and insert
them at any position in the score — or into a different score entirely. It
realises backlog item [EDIT-003](../../product/backlog.md) in the **Editing
Experience** group and builds on the [Score Editor](../score-editor/spec.md) MVP.

The feature introduces **one** new domain operation, `pasteMeasures`, alongside
`duplicateMeasure` in `operations/measures.ts`. Selection and clipboard state are
added to the editor store. No new score representation is introduced.

Related decisions: [ADR-003 Score model](../../adr/003-score-model.md) (measures
are an ordered list keyed by id), [ADR-001 Zustand](../../adr/001-zustand.md)
(editor store orchestrates), [ADR-002 IndexedDB](../../adr/002-indexeddb.md)
(autosave). Paste flows through the existing `edit()` chokepoint so it is
automatically undo-able (EDIT-001). No new package, storage layer, or framework
is required — no ADR needed.

---

## Goal

Let a drummer copy one or more measures and paste them at any position — including
into a different score — so that repeated patterns can be reused without manual
recreation.

---

## User Stories

- As a drummer building a score, I want to select measures and copy them, so I
  can reuse an existing pattern without recreating it.
- As a drummer, I want to paste copied measures at a specific position in the
  score, so the arrangement matches what I intend.
- As a drummer, I want to paste measures into a different score, so I can reuse
  patterns across projects.
- As a drummer, I want keyboard shortcuts (Ctrl/Cmd+C, Ctrl/Cmd+V) for copy and
  paste, so I never have to leave the keyboard.
- As a drummer, I want pasted measures to be identical to the originals, so
  nothing is lost in the copy.
- As a drummer, I want copy/paste to be undoable, so a wrong paste costs nothing.

---

## Functional Requirements

### 1. Domain Operation — `pasteMeasures`

A new pure operation in `packages/notation-engine/src/operations/measures.ts`:

```ts
pasteMeasures(score: Score, measures: readonly Measure[], atIndex: number): Score
```

- Inserts copies of `measures` into `score.measures` starting at `atIndex`.
- Each copy receives a **new `id`**; notes are shallow-copied (same as
  `duplicateMeasure`).
- `atIndex` is clamped to `[0, score.measures.length]` (insertion point — not a
  measure index).
- Notes at positions outside the target score's grid (`isValidPosition` check)
  are silently dropped; this keeps cross-project paste safe when time signatures
  differ.
- An empty `measures` array is a no-op that returns the score unchanged.

### 2. Selection

- A measure is selected by clicking its header title ("Measure N").
- Shift+click extends the selection to a contiguous range between the anchor and
  the clicked measure.
- Clicking without Shift replaces the current selection (single-select) and sets
  the new anchor.
- Clicking outside all measure headers clears the selection.
- Selected measures are visually distinguished (highlight ring).

### 3. Clipboard

- The clipboard lives in the editor store as `clipboard: readonly Measure[] | null`
  (session-only; never written to IndexedDB).
- `copySelectedMeasures()` copies selected measures **in score order** to
  `clipboard`. Not an `edit()` call — not recorded in history.
- The clipboard **survives project loads**, enabling cross-project paste.
  `loadScore` and `setCurrentScore` clear the selection but not the clipboard.

### 4. Paste

- `pasteMeasures(atIndex?)` on the store calls the domain op via `edit()` →
  history + autosave (undoable as a single step).
- When `atIndex` is omitted the default target is the index after the last
  selected measure; if nothing is selected it appends at the end.
- `canPaste` is `true` when `clipboard` is non-null and non-empty.

### 5. Keyboard Shortcuts

- `Ctrl/Cmd+C` → `copySelectedMeasures()` (only when ≥ 1 measure is selected;
  suppressed when an editable element has focus).
- `Ctrl/Cmd+V` → `pasteMeasures()` (only when `canPaste`; suppressed when an
  editable element has focus).

### 6. Toolbar

- **Copy** button: enabled when ≥ 1 measure is selected.
- **Paste** button: enabled when `canPaste`.
- Both call the same store actions as the keyboard shortcuts.

---

## Acceptance Criteria

1. User can select multiple measures (click + shift-click).
2. Copy action (`Ctrl/Cmd+C` or Copy button) stores selected measures in the
   clipboard in score order.
3. Paste action (`Ctrl/Cmd+V` or Paste button) inserts copies at the target
   location.
4. Pasted measures preserve all notes (adjusted to the target score's grid); each
   pasted measure receives a new, unique id.
5. Existing score structure remains valid after paste (no duplicate ids; ordered
   list intact).
6. Paste is a single, undoable step.
7. The clipboard survives a project switch; cross-project paste works as long as
   the session is active.

---

## Dependencies & Decisions

### EDIT-001 Undo / Redo

Paste flows through `edit()` and is automatically recorded in the history stack.
No bespoke undo logic is added.

### Cross-project note filtering

Notes whose `position` falls outside the target score's step grid are dropped
silently. This keeps the score valid (AC 5) when pasting between scores with
different time signatures or subdivisions, at the cost of potentially dropping
notes. The alternative — keeping out-of-range notes — would corrupt the grid and
break validation.

### No external clipboard / OS clipboard

The clipboard is an in-memory `Measure[]` inside the store. Browser permission
prompts and OS clipboard APIs are out of scope for this iteration.

---

## Out of Scope

- Copying individual notes.
- Overwriting measures at the paste target (insert-only for this iteration).
- External clipboard formats (JSON export/import of measures).
- Persistent clipboard across page reloads.
