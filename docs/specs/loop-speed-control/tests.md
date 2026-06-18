# Test Cases — Loop Playback + Speed Control (PRACT-001)

Given/When/Then cases covering the [acceptance criteria](spec.md#acceptance-criteria).
Tests verify behavior, not implementation details. Loop-window math is tested in
the domain; loop/speed wiring is exercised through the store with a mocked
playback engine. Transport behaviour (actual looping, `playbackRate`) is verified
by ear in the app — jsdom has no Web Audio.

---

## Domain — Loop Window

### Window From A Measure Range

Given a score with 4 measures at 120 BPM in 4/4 (measure duration = 2 s)
When the loop region for measures 1–2 (0-indexed) is computed
Then the window is `[2, 6)` — start at measure 1, end at measure 2 + duration.

### Single-Measure Loop

Given the same schedule
When the loop region for measures 0–0 is computed
Then the window is `[0, 2)`.

### Reversed Indices Are Normalised

Given the same schedule
When the loop region is computed with start = 3 and end = 1
Then the window equals the region for measures 1–3: `[2, 8)`.

### Out-Of-Range Indices Are Clamped

Given a schedule with 4 measures
When the loop region is computed with start = -1 and end = 10
Then the window spans the whole score: `[0, 8)`.

### Window Scales With Tempo

Given two schedules — 60 BPM and 120 BPM, both 4/4
When the loop region for measures 0–1 is computed in each
Then the 120 BPM window is half the length of the 60 BPM window.

---

## Store — Loop Selection

### Select A Single Measure Starts The Loop

Given no active loop
When the user toggles the loop on measure 2
Then the loop region is `{ start: 2, end: 2 }`.

### Selecting A Later Measure Extends The Loop

Given a loop on measure 1
When the user toggles the loop on measure 3
Then the loop region is `{ start: 1, end: 3 }`.

### Selecting An Earlier Measure Moves The Start

Given a loop on measures 2–4
When the user toggles the loop on measure 0
Then the loop region is `{ start: 0, end: 4 }`.

### Toggling The Lone Loop Measure Clears It

Given a loop on measure 2 only
When the user toggles the loop on measure 2 again
Then the loop is cleared (null).

### Clearing The Loop

Given an active loop
When the user clears the loop
Then the loop region is null and the engine loop is disabled.

### Loop Range Is Forwarded To The Engine

Given the user selects a loop range
When the region changes
Then the engine receives the new range (and null when cleared).

---

## Store — Speed

### Default Speed Is 1×

Given a fresh playback store
Then the speed is 1.

### Changing Speed Forwards To The Engine

Given any playback status
When the user sets the speed to 0.5×
Then the store speed is 0.5 and the engine receives 0.5.

### Speed Can Change While Playing

Given playback is in progress
When the user sets the speed to 1.5×
Then the engine playback rate is updated without stopping playback.

---

## Store — Apply On Play

### Play Applies Session Loop And Speed

Given a loop region and a non-default speed are set while idle
When the user presses play
Then the engine is started with that loop and speed applied.

---

## Session Persistence

### Loop And Speed Are Not Saved To The Score

Given a loop and speed are set
When the score is saved/reloaded
Then the persisted Score contains no loop or speed fields, and a reloaded store
is back to defaults (speed 1, no loop).
