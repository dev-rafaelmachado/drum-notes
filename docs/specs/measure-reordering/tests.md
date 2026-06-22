# Test Cases — Drag-and-Drop Measure Reordering (EDIT-004)

Given/When/Then cases covering the [acceptance criteria](spec.md#acceptance-criteria).
Tests verify behavior, not implementation details. The reorder math is tested in
the domain; store wiring is exercised through the editor store; the drag/keyboard
interaction is tested at the component level. Native Drag and Drop has no Web
Audio dependency, but pointer drag is awkward in jsdom — the keyboard path and
the dispatched store action are the primary UI assertions.

---

## Domain — `moveMeasure`

### Move A Measure Forward

Given a score with measures `[A, B, C, D]`
When `moveMeasure(score, B.id, 2)` is applied
Then the order is `[A, C, B, D]`.

### Move A Measure Backward

Given a score with measures `[A, B, C, D]`
When `moveMeasure(score, D.id, 1)` is applied
Then the order is `[A, D, B, C]`.

### Move To First Position

Given `[A, B, C]`
When `moveMeasure(score, C.id, 0)` is applied
Then the order is `[C, A, B]`.

### Move To Last Position

Given `[A, B, C]`
When `moveMeasure(score, A.id, 2)` is applied
Then the order is `[B, C, A]`.

### Self-Move Is A No-Op

Given `[A, B, C]`
When `moveMeasure(score, B.id, 1)` is applied
Then the order is unchanged: `[A, B, C]`.

### Out-Of-Range Index Is Clamped

Given `[A, B, C]`
When `moveMeasure(score, A.id, 99)` is applied
Then `A` lands at the last position: `[B, C, A]` (and a negative index clamps to 0).

### Identity And Notes Are Preserved

Given measure `B` carries specific notes
When `B` is moved to any position
Then the moved entry has the **same `id`** and the **same notes** (no new measure
is created, nothing is emptied).

### Unknown Measure Id Throws

Given any score
When `moveMeasure` is called with an id not in the score
Then it throws `MeasureNotFoundError`.

### Untouched Measures Keep Their Relative Order

Given `[A, B, C, D, E]`
When `C` is moved to index 0
Then the others keep their relative order: `[C, A, B, D, E]`.

---

## Store — Editor

### Reorder Updates The Score And Autosaves

Given a loaded score with measures `[A, B, C]`
When the user moves `A` to index 2
Then `Score.measures` is `[B, C, A]` and a save is triggered (saveStatus leaves
`idle`).

### Reorder Leaves Note Data Unchanged

Given a measure with notes
When it is reordered
Then its notes are byte-for-byte the same after the move.

### No-Op Move Does Not Corrupt State

Given a loaded score
When a measure is "moved" to its current index
Then the resulting score is equivalent and still valid.

---

## UI — Interaction

### Drag Drops A Measure At The Target

Given the editor renders measures `[A, B, C]`
When the user drags `A`'s handle and drops it after `C`
Then the store receives `moveMeasure(A.id, 2)` and the rendered order becomes
`[B, C, A]` with numbering `1, 2, 3`.

### Drop Indicator Marks The Landing Gap

Given a drag is in progress over the gap between `B` and `C`
Then a drop indicator is shown at that gap and is not conveyed by colour alone.

### Keyboard Move Reorders

Given measure 2 (`B`) is focused
When the user activates "Move left"
Then the store receives `moveMeasure(B.id, 0)` and the order becomes `[B, A, C]`.

### Edge Move Controls Are Disabled

Given the first measure
Then its "Move left" control is disabled; the last measure's "Move right" control
is disabled.

### Reorder Controls Are Labelled

Given any measure header
Then the drag handle and move controls expose accessible labels (e.g. "Move
measure 3 left").

---

## Undo / Redo (via EDIT-001)

> Verified once [EDIT-001](../../product/backlog.md) lands; `moveMeasure` is a
> single, invertible history entry.

### A Reorder Can Be Undone

Given measures `[A, B, C]` reordered to `[B, A, C]`
When the user undoes
Then the order returns to `[A, B, C]`; redo re-applies `[B, A, C]`.

### A Reorder Is A Single History Step

Given one reorder
When the user undoes once
Then the entire move is reverted in a single step (not multiple sub-edits).
