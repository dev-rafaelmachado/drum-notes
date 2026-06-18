# Tasks — Score Playback (AUDIO-005)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Domain → Tests → Engine → State →
UI**. There is no storage work (playback is transient). Each task is
independently testable and carries a one-line acceptance note. Never start from
the UI.

## Domain (`packages/notation-engine`)

- [x] `buildPlaybackSchedule(score)` returning timed `ScheduledNote`s (`time`, `instrument`, `measureIndex`, `step`), `measureStarts`, `stepDuration`, `duration` — *pure projection from Score → Measure → Note; no new notation model.*
- [x] Derive step/measure durations from existing helpers (`secondsPerBeat`, `stepsPerBeat`, `stepsPerMeasure`) — *consumes the domain; tempo from `bpm`/time signature/subdivision.*
- [x] Export the schedule types/builder from the package index — *consumed by the playback engine.*

## Tests (domain)

- [x] Unit tests for the schedule — *note times, `measureStarts`, total `duration`; e.g. 4/4 @ 120 → measure = 2 s. See [tests.md](tests.md).*

## Instrument engine (`features/instrument-audio`)

- [x] Extend the instrument engine with a scheduled `trigger(instrument, time)` and `prepare()` — *plays a voice at a precise transport time; `play` stays the immediate path. Reuses AUDIO-004 voices.*

## Engine (`features/score-playback/services`)

- [x] Tone.js Transport playback engine: schedule `buildPlaybackSchedule` notes via `Transport.scheduleOnce` → `instrumentPlayer.trigger` — *lazy Tone import (SSR-safe); see [ADR-010](../../adr/010-score-playback.md).*
- [x] `playScore` / `pauseScore` / `resumeScore` / `stopScore` / `seekMeasure` — *pause keeps position; stop resets; seek starts from a measure's offset.*
- [x] Progress reporting (current measure + step) and end-of-score stop — *drives highlight; transport stops at `duration`.*
- [x] Stop the metronome on play — *single transport owner (mutual exclusion with [ADR-007](../../adr/007-metronome.md)).*

## State (Zustand — `features/score-playback/stores`)

- [x] `playback-store` holding `status` (idle/playing/paused), `currentMeasureIndex`, `currentStep` — *orchestrates the engine; holds no scheduling math.*
- [x] Actions `play` / `playFrom(measureIndex)` / `pause` / `resume` / `stop` taking the current `Score` — *engine builds the schedule from the model.*

## UI (`apps/web/src/features/score-playback` + editor)

- [x] `ScorePlaybackControls` (play/pause/resume/stop) in the editor toolbar — *available without an uploaded track.*
- [x] Per-measure "play from here" control — *starts playback at that measure.*
- [x] Drive the measure highlight from playback (reuse `isActive`) and add a within-measure playhead at `currentStep` — *measures and notes highlight as they play.*
- [x] Accessibility pass — *keyboard-operable controls; playing measure announced, not colour-only.*

## Validation

- [x] Store/engine test for the critical flow — *play → playing; seekMeasure starts at the right offset; stop → idle (mocked engine).*
- [x] Verify all [acceptance criteria](spec.md#acceptance-criteria) — *type-check, lint, tests and production build green.*
- [x] Sync docs — *[domain.md](../../architecture/domain.md), [roadmap.md](../../product/roadmap.md) (Phase 1), [backlog.md](../../product/backlog.md) updated.*
