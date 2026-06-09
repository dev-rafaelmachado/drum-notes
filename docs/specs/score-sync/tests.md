# Test Cases — Score Synchronization (AUDIO-003)

Given/When/Then cases covering the [acceptance criteria](spec.md#acceptance-criteria).
Tests verify behavior, not implementation details. Resolution math is tested in
the domain; highlight/scroll/seek wiring is exercised through the stores with
mocked audio.

---

## Associate A Measure With A Timestamp

Given a score and a sync map
When the user sets a measure's start and end timestamps
Then the map holds a `{ measureId, start, end }` entry for that measure;
And setting it again replaces the previous entry.

## Reject An Invalid Range

Given a sync map
When a timestamp is set with `start >= end` or a negative `start`
Then it is rejected (InvalidTimestampError) and the map is unchanged.

## Active Measure At A Position

Given a sync map with mapped measures
When the playback position falls within a measure's `[start, end)`
Then that measure is the active measure;
And a position before the first or after the last mapped range yields no active
measure.

## Active Measure Boundaries

Given a measure mapped to `[10, 14)`
When the position is exactly 10
Then the measure is active;
And at exactly 14 it is no longer active (the next range owns it).

## Highlight During Playback

Given a track playing and a sync map
When playback is within a mapped measure
Then that measure is visually highlighted as active.

## Active Measure Updates As Playback Progresses

Given a track playing across measure boundaries
When the position crosses from one mapped range into the next
Then the active measure updates to the new measure.

## Auto-Scroll To Active Measure

Given the active measure changes to one off screen
When the highlight moves
Then the score scrolls to bring the active measure into view.

## Seek In Audio Updates The Active Measure

Given a sync map
When the user seeks the audio to a new position
Then the active measure updates to the measure containing that position.

## Select Measure Moves Playback

Given a mapped measure
When the user selects it to seek
Then playback moves to that measure's start timestamp.

## Sync Map Persists Separately And Reloads

Given a project with a sync map that was saved
When the user reopens the project
Then the sync map reloads unchanged, and the notation is untouched.

## Deleting Project Removes Sync Map

Given a project with a sync map
When the project is deleted
Then its sync map is removed from storage (no orphan).
