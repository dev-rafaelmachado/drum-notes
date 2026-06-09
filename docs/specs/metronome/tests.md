# Test Cases — Project Metronome (AUDIO-002)

Given/When/Then cases covering the [acceptance criteria](spec.md#acceptance-criteria).
Tests verify behavior, not implementation details. Timing math is tested in the
domain; transport/audio scheduling is exercised through the store with a mocked
engine.

---

## Beats Per Measure From Time Signature

Given a score in 4/4
When the metronome computes beats per measure
Then it is 4;
And in 3/4 it is 3.

## Seconds Per Beat From BPM

Given a BPM of 120
When the metronome computes the beat duration
Then it is 0.5 seconds;
And at 60 BPM it is 1 second.

## Accent On The First Beat

Given a measure's beats
When the metronome evaluates each beat
Then beat 0 is an accent and the others are not.

## Start

Given a stopped metronome
When the user starts it
Then it is running and clicking at the project tempo.

## Stop

Given a running metronome
When the user stops it
Then clicking ceases and the beat counter resets.

## Follows BPM Live

Given a running metronome at the score's BPM
When the user changes the score's BPM
Then the click rate updates to the new BPM without restarting.

## Adjust Volume

Given the metronome
When the user changes its volume
Then the click level changes immediately;
And it does not affect the uploaded track's volume.

## First Beat Audibly Distinct

Given a running metronome in any time signature
When a measure begins
Then the first beat sounds with the accent click, distinct from the others.
