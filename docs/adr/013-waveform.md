# ADR-013 — Waveform Data as Derived Session State + Canvas Rendering

## Status

Accepted

## Context

[AUDIO-007](../specs/waveform-display/spec.md) adds a waveform strip to the
audio panel and lets users drag-select loop regions on it. The
[tech-stack](../../.claude/tech-stack.md) lists "Audio Analysis: Future ADR
required" — this is that ADR.

Three decisions need to be made:

1. Where does waveform amplitude data live, and how is it generated?
2. How is the waveform rendered efficiently?
3. How does a waveform drag-selection connect to the existing
   [PRACT-001 loop infrastructure](../specs/loop-speed-control/spec.md)?

Constraints / precedent:

* The domain is framework- and Browser-API-agnostic
  ([ADR-003](003-score-model.md)); Web Audio APIs must not enter
  `packages/notation-engine`.
* The audio blob is already persisted in IndexedDB
  ([ADR-006](006-audio-storage.md)); regenerating data from it avoids a storage
  migration.
* The PRACT-001 loop region (`{ start, end }` inclusive measure indices) lives
  in the Zustand `playback-store` and is explicitly designed as "an integration
  surface" for AUDIO-007 ([ADR-011](011-loop-speed.md)).
* The score measures are laid out as **vertical cards** (not a horizontal
  timeline), so a waveform strip cannot scroll-sync 1:1 with measure positions.
  The waveform is a standalone horizontal timeline representing the full audio
  duration.

## Decision

### 1 — Waveform data is derived session state

On audio load the blob is decoded once with `AudioContext.decodeAudioData` (a
standard `BaseAudioContext` API), the channel data is downsampled to a fixed
`WAVEFORM_BUCKETS` peak array (`[min, max]` pairs per bucket, interleaved in a
`Float32Array`), and the result is stored in the `audio-store` as
`waveformData: Float32Array | null`. It is **never written to IndexedDB**:
it can be regenerated from the persisted blob on every load. This keeps the
storage schema and DB version unchanged.

Waveform generation is triggered explicitly via a dedicated `generateWaveform`
action on the audio store (not inside `upload` / `syncWithScore`), so the
existing store tests do not need an `AudioContext` mock.

### 2 — Waveform generation lives in the app layer

A new `waveform-service.ts` in `apps/web/src/features/audio/services` owns the
Web Audio decode and downsampling logic. It also exports pure coordinate
functions (`secondsToPixel`, `pixelToSeconds`) — these are unit-testable without
a browser and are the right seam to mock in integration tests.

### 3 — Rendering uses `<canvas>`

Thousands of amplitude peaks as DOM elements are prohibitively expensive.
A `WaveformCanvas` component holds a `<canvas>` ref and redraws via a
`useEffect` whenever its props change: waveform bars, playhead line, loop-region
overlay, measure tick marks.

### 4 — Playhead follows the reference audio position

The waveform visualises the **reference audio** track, so the playhead is driven
by `audio-store.position` (the Tone.Player clock), not by `playback-store`.
When score playback is in progress the waveform playhead is stationary unless
the audio player is also playing — this is correct behaviour (the two transports
are independent).

### 5 — Loop drag writes to the existing `playback-store.loop`

A waveform drag produces a time range `[t1, t2]` in seconds. If a SyncMap is
loaded, `activeMeasureAt` maps each endpoint to a measure id; the measure id is
resolved to a measure index via the score's ordered measure list; a new
`setLoop(range | null)` action on `playback-store` sets the loop directly
(complementing the existing `toggleLoopMeasure`). If no SyncMap is present the
selection renders visually on the waveform but the score-playback loop is not
activated (graceful degradation). The reference audio itself does not loop
— "reflected in playback controls" means the measure-header indicators update
and the score-playback transport loops.

`playback-store` gains `setLoop(range | null)` as a direct setter, so the
waveform bypasses the toggle state-machine (which is tailored for single-measure
clicks).

## Consequences

* No new domain models, no storage migration, no DB version bump.
* `AudioContext.decodeAudioData` is async; generation runs off the render cycle
  and does not block the UI.
* Waveform data is regenerated on page reload — accepted, since generation of a
  typical 3–4 minute song is well under 200 ms.
* Canvas drawing is imperative; the logic is encapsulated in `WaveformCanvas`
  and not mixed with store or domain concerns.
* Loop regions entered via measure headers (PRACT-001) and via waveform drag
  both target `playback-store.loop` — they stay visually synchronised
  automatically (the waveform derives the highlight from the store).
* The `setLoop` addition is additive and backward-compatible with all existing
  `toggleLoopMeasure` callers.

## Alternatives considered

* **Store waveform in IndexedDB** — eliminates regeneration cost on reload but
  requires a DB version bump, a new object store, and a delete-on-audio-change
  path; regeneration is fast enough; rejected.
* **SVG waveform** — semantic but ~10× more DOM nodes; rejected for canvas.
* **Waveform drag drives an independent time-range loop (not measure-based)** —
  disconnects from PRACT-001 and means two parallel loop concepts; ADR-011
  explicitly designated `playback-store.loop` as the integration surface;
  rejected.
* **Reuse the Tone.Player's decoded buffer** — `Tone.Player` decodes the blob
  internally; exposing `player.buffer.get()` would couple the waveform service
  to Tone internals; a second `decodeAudioData` call is cleaner; rejected.
* **WebWorker for generation** — adds complexity; `AudioContext.decodeAudioData`
  is already async and unblocks the render thread; deferred.
