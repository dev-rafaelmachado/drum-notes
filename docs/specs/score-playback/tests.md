# Test Cases — Score Playback (AUDIO-005)

Given/When/Then cases covering the [acceptance criteria](spec.md#acceptance-criteria).
Tests verify behavior, not implementation details. The schedule math is tested in
the domain; transport/audio is exercised through the store/engine with Tone
mocked (headless tests cannot assert sound).

---

## Schedule Note Times

Given a score in 4/4 at 120 BPM with sixteenth subdivision
When the playback schedule is built
Then each note's `time` equals `measureStart + step * stepDuration`;
And `stepDuration` is a sixteenth note (0.125 s).

## Schedule Measure Starts And Duration

Given a score with N measures (4/4 @ 120 → 2 s per measure)
When the schedule is built
Then `measureStarts[i] = i * 2`;
And total `duration = N * 2`.

## Empty Measures Still Advance Time

Given a score with a measure that has no notes
When the schedule is built
Then it contributes no notes but still advances `measureStarts` and `duration`.

## Start Playback

Given a stopped score
When the user presses play
Then playback status is playing and notes are scheduled from the start.

## Pause And Resume

Given a playing score
When the user pauses
Then status is paused and the position is kept;
And resuming continues from that position.

## Stop

Given a playing or paused score
When the user stops
Then status is idle, the position resets, and the highlight clears.

## Follows BPM

Given a score at a given BPM
When playback starts
Then notes are scheduled at that tempo (a faster BPM yields a shorter duration).

## Correct Instrument Sound

Given a scheduled note for an instrument
When its scheduled time arrives
Then the instrument-audio engine is triggered for that instrument.

## Active Measure Highlighted

Given a score playing
When the position enters a measure
Then that measure is highlighted, and the playhead marks the current step.

## Play From A Measure

Given a score
When the user starts playback from measure k
Then playback begins at `measureStarts[k]` and earlier notes do not sound.

## Stops At The End

Given a score playing
When the position reaches the total duration
Then playback stops on its own and returns to the stopped state.

## Mutually Exclusive With The Metronome

Given the metronome is running
When the user starts score playback
Then the metronome stops (a single transport owner).
