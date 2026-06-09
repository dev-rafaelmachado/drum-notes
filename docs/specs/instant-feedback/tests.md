# Test Cases — Instant Audio Feedback (AUDIO-004)

Given/When/Then cases covering the [acceptance criteria](spec.md#acceptance-criteria).
Tests verify behavior, not implementation details. Sound output cannot be
asserted in a headless test, so coverage targets the **voice mapping** (every
instrument is supported) and the **safety/read-only** guarantees; the audible
result is confirmed in the browser.

---

## Every Instrument Has A Voice

Given the eight supported instruments
When the voices table is read
Then each instrument maps to a voice config (none missing).

## Play Is Safe Without Audio

Given an environment where the audio engine cannot start
When `play(instrument)` is called
Then it does not throw and editing continues uninterrupted.

## Feedback On Adding A Note

Given an empty cell
When the user clicks it
Then a note is created and that instrument's sound plays.

## Feedback On Clicking An Existing Note

Given a cell that already has a note (e.g. kick / snare / hi-hat / crash)
When the user clicks it
Then that instrument's sound plays.

## Feedback Does Not Modify Score Data

Given any cell click
When feedback plays
Then the only change to the score is the toggle itself — the audio path reads
and writes no score data.

## Latency

Given the audio context has been resumed by a prior interaction
When the user clicks a cell
Then the sound plays within an acceptable latency threshold (verified in the
browser).
