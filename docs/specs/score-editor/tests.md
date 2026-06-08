# Test Cases — Score Editor (MVP)

Given/When/Then cases covering the [acceptance criteria](spec.md#acceptance-criteria).
Tests verify behavior, not implementation details.

---

## Create Score

Given the app with no current score
When the user creates a score with a BPM, time signature and subdivision
Then a new score is created with those settings and an empty list of measures.

## Add Measure

Given a score
When the user clicks Add Measure
Then a new empty measure is appended to the score.

## Remove Measure

Given a score with at least one measure
When the user removes a measure
Then that measure is gone and the remaining measures keep their order.

## Duplicate Measure

Given a measure containing notes
When the user duplicates it
Then a new measure with the same notes is inserted, independent of the original.

## Toggle Note

Given a measure
When the user clicks a cell at a valid position
Then a note is added for that instrument at that position;
And when the user clicks it again, the note is removed.

## Position Respects Subdivision

Given a score with a configured subdivision
When a note is placed
Then its position must fall on the subdivision grid;
And a position outside the grid is rejected.

## Edit BPM

Given a score
When the user changes the BPM
Then the score's BPM is updated.

## Autosave

Given the user makes a meaningful edit (create, add/remove note, change BPM, change measure)
When the edit completes
Then the score is persisted locally without an explicit save action.

## Reopen Persisted Score

Given a score that was autosaved
When the user reopens it
Then the score is restored unchanged (same measures, notes, BPM, settings).

## Export PDF

Given a score
When the user exports to PDF
Then a PDF representing the score is produced.

## Export PNG

Given a score
When the user exports to PNG
Then a PNG image representing the score is produced.
