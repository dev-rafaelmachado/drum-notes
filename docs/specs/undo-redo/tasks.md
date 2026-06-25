# Tasks — Undo / Redo (EDIT-001)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **State → Tests → UI**. There is no
domain change (history is pure Zustand store state — `Score` snapshots) and no
new service layer. Each task is independently testable and carries a one-line
acceptance note. Never start from the UI.

## State (Zustand — `features/editor/stores`)

- [x] Add `past: readonly Score[]`, `future: readonly Score[]`, `canUndo: boolean`, `canRedo: boolean`, and `lastEditType: string | null` to `EditorState` — *fields represent the history stack; `lastEditType` drives coalescing.*
- [x] Add `undo()` and `redo()` actions to `EditorState` — *exposed for toolbar buttons and keyboard shortcut.*
- [x] Extend `edit()` with an optional `editType` parameter — *on each call: push current score to `past` (unless same `editType` as last edit = coalesce), clear `future`, update `canUndo`/`canRedo`; cap `past` at 100 entries.*
- [x] Implement `undo()` — *pops `past`, sets it as `score`, pushes displaced score to `future`; autosaves the restored state; resets `lastEditType`.*
- [x] Implement `redo()` — *pops `future`, sets it as `score`, pushes displaced score to `past`; autosaves the restored state; resets `lastEditType`.*
- [x] Pass `editType` strings to `setBpm` (`"setBpm"`) and `setTitle` (`"setTitle"`) calls — *enables coalescing for continuous inputs.*
- [x] Clear both stacks (and `canUndo`/`canRedo`) in `loadScore`, `reset`, and `setCurrentScore` — *history is session-scoped to the active score.*

## Tests (store)

- [x] Unit tests for `undo()` and `redo()` — *see [tests.md](tests.md). Covers: basic undo/redo, multiple undo steps, redo after undo, redo cleared by new edit, coalescing for setBpm/setTitle, history cap, undo/redo with no score is a no-op, autosave triggered on undo/redo, autosave does not clear history.*

## UI (`apps/web/src/features/editor`)

- [x] `EditorToolbar` gains `canUndo`, `canRedo`, `onUndo`, `onRedo` props — *Undo and Redo icon buttons rendered in the toolbar; each disabled when its respective stack is empty; both carry `aria-label`.*
- [x] `useUndoRedo` hook in `features/editor/hooks/` — *attaches a `keydown` listener for Ctrl/Cmd+Z (undo) and Ctrl/Cmd+Shift+Z (redo); suppresses when `document.activeElement` is an input, textarea, or select.*
- [x] `ScoreEditor` wires `canUndo`, `canRedo`, `undo`, `redo` from the store to `EditorToolbar`, and mounts `useUndoRedo` — *the keyboard shortcut is active for the lifetime of the editor view.*

## Undo / Redo (EDIT-004 completion)

- [x] Confirm `moveMeasure` is recorded as a single history entry — *it already flows through `edit()`; store test "undoes a measure reorder and restores previous order" verifies this.*

## Validation

- [x] Verify [acceptance criteria](spec.md#acceptance-criteria) — *type-check clean, all 61 tests pass, production build green.*
- [x] Sync docs — *backlog.md EDIT-001 status set to Specified; measure-reordering tasks.md undo item checked off.*
