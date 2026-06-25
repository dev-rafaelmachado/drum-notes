# Test Cases — Undo / Redo (EDIT-001)

Given/When/Then cases covering the [acceptance criteria](spec.md#acceptance-criteria).
Tests verify behavior, not implementation details. All history logic is exercised
through the editor store; keyboard shortcuts are covered by an integration test
via the `useUndoRedo` hook.

---

## Store — History Stack

### Basic Undo

Given a score with one measure loaded
When the user toggles a note (measure now has a note)
And the user calls `undo()`
Then `score` reverts to the state before the toggle (note absent)
And `canUndo` is `false`
And `canRedo` is `true`.

### Basic Redo

Given the state after the "Basic Undo" case above
When the user calls `redo()`
Then `score` returns to the post-toggle state (note present)
And `canRedo` is `false`
And `canUndo` is `true`.

### Multiple Undo Steps

Given a score where three notes have been toggled in sequence (states s0→s1→s2→s3)
When the user calls `undo()` three times
Then `score` returns to `s0`
And `canUndo` is `false`.

### Redo Cleared By New Edit

Given the user has undone two steps (past=[s0], current=s1, future=[s2,s3])
When the user toggles a note (new edit s4)
Then `future` is empty and `canRedo` is `false`
And `past` has `s0` and `s1`
And `score` is `s4`.

### Undo Is No-Op Without Score

Given no score is loaded (`score` is `null`)
When `undo()` is called
Then `score` remains `null` and no save is triggered.

### Undo Is No-Op With Empty Past

Given a score is loaded and no edits have been made (`past` is empty)
When `undo()` is called
Then `score` is unchanged and no save is triggered.

### Redo Is No-Op With Empty Future

Given a loaded score with edits but no undo performed (`future` is empty)
When `redo()` is called
Then `score` is unchanged and no save is triggered.

---

## Store — Autosave Interaction

### Undo Triggers Autosave

Given the user has made an edit and then calls `undo()`
Then `saveScore` is called with the restored score
And the save happens after the state update.

### Redo Triggers Autosave

Given the user has undone an edit and then calls `redo()`
Then `saveScore` is called with the re-applied score.

### Autosave Does Not Clear History

Given a score is loaded and one edit has been made (`canUndo` is `true`)
When the autosave resolves (no action by the user)
Then `canUndo` is still `true`
And `past` is unchanged.

---

## Store — Coalescing

### Consecutive BPM Edits Coalesce

Given a score with BPM 120 loaded (state `s0`)
When the user changes BPM to 125 (state `s1`) and then to 130 (state `s2`)
Then `undo()` reverts to `s0` (BPM 120), skipping `s1`
And one further `undo()` is not available (past is empty).

### Consecutive Title Edits Coalesce

Given a score with title "Draft" loaded (state `s0`)
When the user types two characters, producing intermediate state `s1` then `s2`
Then `undo()` reverts to `s0` (title "Draft"), skipping `s1`
And `canUndo` is `false`.

### Different Edit Types Break Coalescing

Given a score loaded (state `s0`)
When the user changes BPM (state `s1`) and then toggles a note (state `s2`)
Then `undo()` reverts to `s1` (BPM changed, note absent)
And another `undo()` reverts to `s0` (original BPM, note absent).

---

## Store — History Cap

### History Is Capped At 100 Entries

Given 101 discrete note-toggle edits have been applied
Then `past.length` is 100 (the oldest entry was discarded)
And `canUndo` is `true`.

---

## Store — History Lifecycle

### Load Score Clears History

Given a score is loaded with two edits in `past`
When `loadScore(otherId)` is called
Then `past` and `future` are empty
And `canUndo` and `canRedo` are `false`.

### Reset Clears History

Given a score is loaded with one edit in `past`
When `reset()` is called
Then `past` and `future` are empty.

### Set Current Score Clears History

Given a score is loaded with one edit in `past`
When `setCurrentScore(newScore)` is called
Then `past` and `future` are empty.

---

## Store — Measure Reorder Integration (EDIT-004)

### Reorder Can Be Undone

Given measures `[A, B, C]` and `A` is moved to index 2 (order becomes `[B, C, A]`)
When the user calls `undo()`
Then the order returns to `[A, B, C]`
And the notes of each measure are unchanged.

### Reorder Is A Single History Step

Given measures `[A, B, C]` reordered to `[B, C, A]`
When the user calls `undo()` once
Then the entire move is reversed in one step.

---

## UI — Toolbar Controls

### Undo Button Is Disabled Initially

Given the editor is open with no edits
Then the Undo button has `disabled` attribute and `aria-label="Undo"`.

### Undo Button Enables After An Edit

Given the user makes one edit
Then the Undo button is enabled (no `disabled` attribute).

### Redo Button Enables After Undo

Given one edit has been made and undone
Then the Redo button is enabled.

---

## UI — Keyboard Shortcuts

### Ctrl+Z Triggers Undo

Given an edit has been made and the editor is focused (no input focused)
When the user presses Ctrl+Z (or Cmd+Z on macOS)
Then `undo()` is called.

### Ctrl+Shift+Z Triggers Redo

Given an edit has been undone and the editor is focused
When the user presses Ctrl+Shift+Z (or Cmd+Shift+Z on macOS)
Then `redo()` is called.

### Shortcut Is Suppressed Inside Text Input

Given a text input inside the editor has focus (e.g. the title or BPM field)
When the user presses Ctrl+Z
Then `undo()` is NOT called (native input undo runs instead).
