# Specification — Undo / Redo (EDIT-001)

## Overview

Undo / Redo adds a history stack to the Score Editor so that any editing action
can be reversed and reapplied. It realises backlog item
[EDIT-001](../../product/backlog.md) in the **Editing Experience** group and
extends the [Score Editor](../score-editor/spec.md) MVP without altering the
canonical [domain model](../../architecture/domain.md).

Related decisions: [ADR-001 Zustand](../../adr/001-zustand.md) (editor store is
the history host), [ADR-003 Score model](../../adr/003-score-model.md) (Score is
immutable — snapshots are cheap to store). The history stack plugs directly into
the existing `edit()` chokepoint in the editor store.

---

## Goal

Let a drummer reverse any editing mistake and reapply it, so experimenting with
the score carries no risk.

---

## User Stories

* As a drummer, I want to undo the last edit so I can recover from a wrong note
  or a accidentally removed measure.
* As a drummer, I want to redo a change I just undid so I can quickly flip
  between two versions of a pattern.
* As a drummer, I want keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z) for
  undo/redo so I never have to leave the keyboard while transcribing.
* As a drummer, I want undo and redo buttons in the toolbar so the feature is
  discoverable without knowing the shortcuts.

---

## Functional Requirements

### 1. History Stack

* Every edit dispatched through the editor store's `edit()` helper records a
  history entry — a snapshot of the `Score` **before** the edit was applied.
* Supported actions that produce history entries:
  * Toggle note
  * Add measure
  * Remove measure
  * Duplicate measure
  * Move measure (reorder)
  * Change BPM
  * Change title
  * Attach / detach audio reference
* The stack is capped at **100 entries**. When the cap is reached, the oldest
  entry is discarded.

### 2. Continuous-Input Coalescing

* `setBpm` and `setTitle` are continuous inputs (fired per keystroke / per
  number increment); recording one entry per keystroke would produce dozens of
  near-identical undo steps.
* Consecutive edits of the **same edit type** (identified by an `editType`
  string passed to `edit()`) are coalesced into a single history entry: the
  second call overwrites the current score without pushing a new past entry.
* Switching to a different edit type (e.g. typing then toggling a note) commits
  a new entry.

### 3. Undo

* `undo()` pops the top of the *past* stack, sets it as the current score, and
  pushes the displaced current score onto the *future* stack.
* After undo, the restored score is autosaved (so the undone state persists in
  IndexedDB like any other edit).
* `canUndo` is `true` when the past stack is non-empty.

### 4. Redo

* `redo()` pops the top of the *future* stack, sets it as the current score,
  and pushes the displaced current score onto the *past* stack.
* After redo, the restored score is autosaved.
* `canRedo` is `true` when the future stack is non-empty.
* Any new edit (through `edit()`) clears the future stack and makes redo
  unavailable.

### 5. History Lifecycle

* History is **session-only** (in-memory). It is not persisted to IndexedDB and
  is not expected to survive a page reload. The requirement "History remains
  available after autosave" means autosave must not clear the stacks — not that
  history must survive a refresh.
* History is cleared (both stacks reset to empty) when `loadScore` or `reset`
  is called, since a different score is being loaded into the store.
* `setCurrentScore` (used during project creation) also clears history, as the
  score is replaced wholesale.

### 6. Keyboard Shortcuts

* `Ctrl+Z` (Windows/Linux) and `Cmd+Z` (macOS) trigger `undo()`.
* `Ctrl+Shift+Z` (Windows/Linux) and `Cmd+Shift+Z` (macOS) trigger `redo()`.
* The shortcuts are **suppressed when focus is inside a text input, textarea,
  or select** element, so browser/OS native undo in those fields is not
  hijacked.
* The shortcuts are mounted once in `ScoreEditor` for the lifetime of the
  editor view.

### 7. Toolbar Controls

* The editor toolbar exposes **Undo** and **Redo** icon buttons.
* Each button is disabled when `canUndo` / `canRedo` is `false`.
* Each button carries an accessible `aria-label`.

---

## Non-Functional Requirements

* **No domain change** — history is pure store state; `Score`, `Measure`, and
  `Note` types are unchanged. The domain stays framework-agnostic.
* **No new dependency** — the implementation uses Zustand state already in use;
  no undo library is introduced.
* **Instant interactions** — undo/redo update the React render in a single
  synchronous `set()`; autosave is fire-and-forget.
* **No ADR required** — in-memory store state, no schema change, no new
  architectural dependency.

---

## Edge Cases and Interactions

* **Undo with empty past** — `undo()` is a no-op if `past` is empty.
* **Redo with empty future** — `redo()` is a no-op if `future` is empty.
* **Score not loaded** — both actions are no-ops when `score` is `null`.
* **History cap** — the 100-entry limit is applied on `edit()` before pushing;
  the oldest entry is dropped so the cap is never exceeded.
* **autosave path** — `persist()` in the editor store must not touch the `past`
  or `future` arrays; history is invisible to the save path.
* **Coalescing and future** — coalescing discards the previous current score
  (it never lands in `past`); it also clears `future`, consistent with any
  other `edit()` call.

---

## Out of Scope

* **Persistent history across page reloads** — deferred; would require
  IndexedDB serialisation of the stack and a versioning strategy.
* **Collaborative editing history** — out of scope per the issue.
* **Per-field undo inside inputs** — native browser undo handles this; the
  keyboard shortcut is suppressed inside inputs for exactly this reason.
* **Named history / branching** — only a linear stack is supported.

---

## Dependencies & Decisions

* **Snapshot pattern over command pattern.** Score objects are already immutable
  plain objects (re-created on every `edit()`). Storing a copy of the pre-edit
  score is O(1) per edit and sufficient to restore any state. A command/inverse
  pattern would require encoding inverse operations for every future action; it
  adds complexity without benefit given the current action set.
* **Host in the editor store.** History is editorial state — it lives in the
  same Zustand store that orchestrates all other editor actions. No new store or
  service is needed.
* **EDIT-004 (measure reordering) completion.** The blocked undo task in
  `measure-reordering/tasks.md` is resolved by this feature. `moveMeasure`
  already flows through `edit()`, so it is recorded in the shared history stack
  automatically.

---

## Acceptance Criteria

This feature is complete when:

1. A user can **undo any supported editing action** and the score reverts to
   the previous state.
2. A user can **redo** an undone action and the score returns to the reverted
   state.
3. **Undo and redo are available via keyboard shortcuts** (Ctrl/Cmd+Z and
   Ctrl/Cmd+Shift+Z) and are suppressed when a text input has focus.
4. The **toolbar shows Undo and Redo buttons** that are disabled when the
   respective stack is empty.
5. **History is not cleared by autosave** — `canUndo` remains true after an
   autosave fires mid-session.
6. **Consecutive BPM/title edits collapse to one undo step** — undoing after
   several BPM changes restores the score from before the first change.

Test cases covering these criteria are in [tests.md](tests.md); the
implementation breakdown is in [tasks.md](tasks.md).
