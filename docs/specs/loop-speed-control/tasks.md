# Tasks — Loop Playback + Speed Control (PRACT-001)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Domain → Tests → Engine → State →
UI**. There is no storage work (loop/speed are session-only). Each task is
independently testable and carries a one-line acceptance note. Never start from
the UI.

## Domain (`packages/notation-engine`)

- [x] `loopRegion(schedule, startIndex, endIndex)` in the `playback` module — *returns the `[start, end)` window in seconds for an inclusive measure range; normalises order and clamps to the schedule's measure count.*
- [x] Export the `LoopRegion` type and `loopRegion` from the package index — *consumed by the playback engine.*

## Tests (domain)

- [x] Unit tests for `loopRegion` — *see [tests.md](tests.md). Covers: window from a range, single-measure loop, reversed indices normalised, out-of-range clamped, duration scales with tempo.*

## Engine (`features/score-playback/services`)

- [x] Schedule notes with `Transport.schedule` (not `scheduleOnce`) so notes re-fire each loop iteration — *non-loop playback still fires each note once because the transport stops at `duration`.*
- [x] `setSpeed(rate)` scales the transport rate live via `Transport.bpm` (Tone v15 has no `playbackRate`) — *changing speed mid-playback takes effect immediately; pitch unaffected (synthesised voices); note times divided by speed stay musically fixed.*
- [x] `setLoop(range | null)` applies `Transport.loop`/`loopStart`/`loopEnd` from `loopRegion`, recomputing from the current schedule — *works before and during playback; clearing disables the loop.*
- [x] Apply the stored speed and loop on `start`; suppress end-of-score auto-stop while looping — *a looping transport never reaches `duration`, so the rAF tick must not stop it.*

## State (Zustand — `features/score-playback/stores`)

- [x] `playback-store` gains `speed: number` and `loop: { start: number; end: number } | null` (measure indices), defaulting to `1` and `null` — *session-only; held in memory, never persisted.*
- [x] Actions `setSpeed(rate)` and `clearLoop()` — *forward to the engine; speed change is allowed at any status.*
- [x] Action `toggleLoopMeasure(measureIndex)` — *no loop → single-measure region; later measure → extend end; earlier/inside → adjust; same lone measure → clear. Forwards the resulting range to the engine.*
- [x] Re-apply loop/speed to the engine on `play`/`playFrom` start — *a fresh transport picks up the session settings.*

## UI (`apps/web/src/features/score-playback` + editor)

- [x] `SpeedControl` in the editor toolbar — *segmented 0.5×–2× selector bound to `setSpeed`; usable while playing.*
- [x] `MeasureLoopButton` per-measure header control — *toggles the measure into the loop range via `toggleLoopMeasure`.*
- [x] Loop region indicator on measure headers — *measures in `[start, end]` are highlighted; boundaries marked; per-measure selector keeps re-renders local.*
- [x] Accessibility pass — *speed and loop controls are keyboard-operable with accessible labels; looped measures announced, not colour-only.*

## Validation

- [x] Store/engine test for the critical flow — *toggleLoopMeasure builds the right range; setSpeed forwards the rate; loop/speed applied on play (mocked engine).*
- [x] Verify all [acceptance criteria](spec.md#acceptance-criteria) — *type-check, lint, tests and production build green.*
- [x] Sync docs — *[ADR-011](../../adr/011-loop-speed.md), [domain.md](../../architecture/domain.md), [roadmap.md](../../product/roadmap.md), [backlog.md](../../product/backlog.md) updated.*
