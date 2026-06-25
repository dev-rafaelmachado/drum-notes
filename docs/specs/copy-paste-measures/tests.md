# Test Cases — Copy / Paste Measures (EDIT-003)

Given/When/Then cases covering the [acceptance criteria](spec.md#acceptance-criteria).
Tests verify behavior, not implementation details. Domain math is tested in the
domain; store wiring is exercised through the editor store.

---

## Domain — `pasteMeasures`

### Paste At Start

Given a score with measures `[A, B, C]` and a clipboard `[X, Y]`
When `pasteMeasures(score, [X, Y], 0)` is applied
Then the order is `[X', Y', A, B, C]` where X' and Y' are new-id copies.

### Paste At End

Given `[A, B, C]` and clipboard `[X]`
When `pasteMeasures(score, [X], 3)`
Then the order is `[A, B, C, X']`.

### Paste In Middle

Given `[A, B, C]` and clipboard `[X]`
When `pasteMeasures(score, [X], 1)`
Then the order is `[A, X', B, C]`.

### Multi-measure Paste Preserves Relative Order

Given clipboard `[X, Y, Z]`
When pasted at any index
Then the pasted block appears in the same order: `... X' Y' Z' ...`.

### Empty Clipboard Is A No-op

Given any score
When `pasteMeasures(score, [], atIndex)` is applied
Then the score is returned unchanged.

### Pasted Measures Receive New Ids

Given clipboard `[X]`
When pasted into any score
Then `X'.id !== X.id`.

### Notes Are Preserved

Given clipboard `[X]` where `X` has a snare at position 4
When pasted
Then `X'.notes` contains the same note (same instrument, position, velocity).

### Notes Are Independent From Originals

Given clipboard `[X]` with a note
When pasted and the pasted measure's note is modified
Then the original clipboard measure's notes are unaffected.

### Out-Of-Range Insertion Index Is Clamped

Given `[A, B, C]` (length 3)
When `pasteMeasures(score, [X], 99)` is applied
Then `X'` is appended at the end: `[A, B, C, X']`.
When `pasteMeasures(score, [X], -5)` is applied
Then `X'` is prepended: `[X', A, B, C]`.

### Cross-Project: Out-Of-Range Notes Are Dropped

Given a source score with 16 steps per measure containing a note at position 12
And a target score configured for 8 steps per measure
When `pasteMeasures(targetScore, [sourceM], 0)` is applied
Then the pasted measure's notes do **not** include the note at position 12.
And the pasted measure's notes that are in range are preserved.

---

## Store — copy / paste

### Copy Stores Selected Measures In Score Order

Given a score `[A, B, C]` with B and A selected (in that selection click order)
When `copySelectedMeasures()` is called
Then `clipboard` contains `[A, B]` (score order, not click order).

### Copy Does Not Edit Score Or History

Given a score with undo history
When `copySelectedMeasures()` is called
Then `score` is unchanged and the undo stack depth is unchanged.

### Paste Inserts Copies With New Ids

Given clipboard `[X]` and score `[A, B]`
When `pasteMeasures(1)` is called
Then score becomes `[A, X', B]` with `X'.id !== X.id`.

### Paste Is Undoable

Given clipboard `[X]` and score `[A, B]`
When `pasteMeasures(2)` then `undo()`
Then score is restored to `[A, B]`.

### canPaste Reflects Clipboard

Given an empty clipboard (`null`)
Then `canPaste` is `false`.
When `copySelectedMeasures()` is called with a non-empty selection
Then `canPaste` is `true`.

### Selection Clears On Score Load

Given a score with measure B selected
When `loadScore(otherId)` is called
Then `selectedMeasureIds` is empty.
