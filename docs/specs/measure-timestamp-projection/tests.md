# Test Cases — Measure Timestamp Projection (AUDIO-006)

Given/When/Then cases covering the [acceptance criteria](spec.md#acceptance-criteria).
Tests verify behavior, not implementation details. Timing math is tested in
the domain; projection wiring is exercised through the stores with mocked
audio and storage.

---

## Project Forward From Anchor

Given a score with 4 measures at 120 BPM in 4/4 (measure duration = 2 s)
When the user sets measure 2 (0-indexed: 1) as the anchor at start = 5 s
Then measure 1 starts at 5 s and ends at 7 s;
And measure 2 starts at 7 s and ends at 9 s;
And measure 3 starts at 9 s and ends at 11 s.

## Anchor Measure Receives Its Timestamp

Given the same score and anchor
When projection runs
Then the anchor measure's start equals the user-provided timestamp;
And its end equals start + measureDuration.

## Pre-Anchor Measures Are Untouched

Given a score with 4 measures and an anchor at measure 2
When projection runs
Then measures before the anchor (0 and 1) have no entries in the SyncMap.

## Duration Varies With Time Signature

Given a score at 120 BPM in 3/4 (measure duration = 1.5 s)
When the user sets measure 1 as the anchor at start = 0 s
Then measure 1 starts at 0 s and ends at 1.5 s;
And measure 2 starts at 1.5 s and ends at 3 s.

## Duration Varies With BPM

Given two scores — one at 60 BPM and one at 120 BPM — both 4/4
When the user sets measure 1 as the anchor at start = 0 s in each
Then the 120 BPM score yields half the measure duration of the 60 BPM score.

## Single Measure Score

Given a score with exactly 1 measure
When the user sets that measure as the anchor
Then the SyncMap contains exactly 1 entry with the correct start and end.

## Anchor At First Measure

Given a score with 3 measures
When the user sets measure 1 (the first) as the anchor at start = 0 s
Then all 3 measures are projected.

## Anchor At Last Measure

Given a score with 3 measures
When the user sets measure 3 (the last) as the anchor
Then only the last measure is projected;
And measures 1 and 2 have no entries.

## Manual Override After Projection

Given projected timestamps from an anchor
When the user manually marks a projected measure at a different position
Then that measure's timestamp is updated to the manual value;
And other projected measures remain unchanged.

## Regenerate From Anchor

Given projected timestamps from an anchor at measure 2, start = 5 s
When the user triggers regeneration
Then all measures after the anchor are re-projected from the same anchor;
And any manual overrides on projected measures are overwritten.

## Regeneration Is A No-Op Without Anchor

Given a sync map with no stored anchor
When the user triggers regeneration
Then the sync map is unchanged.

## Projected Entries Participate In Active Measure

Given projected timestamps from an anchor
When the audio playback position falls within a projected measure's window
Then `activeMeasureAt` returns that measure's id.

## Projected Entries Support Seeking

Given projected timestamps from an anchor
When the user seeks to a projected measure
Then audio playback moves to that measure's projected start.

## Anchor Survives Reload

Given a sync map with a stored anchor
When the project is reloaded
Then the anchor is available for regeneration.

## Projection Persists Like Manual Mappings

Given projected timestamps
When the project is reloaded
Then the projected entries reload unchanged from IndexedDB.
