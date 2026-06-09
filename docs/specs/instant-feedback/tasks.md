# Tasks — Instant Audio Feedback (AUDIO-004)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md). There is **no domain, storage, or
state** work — the feature reuses the existing `Instrument` set, the engine is
stateless, and feedback never touches the `Score`. So the order is **Engine →
Tests → UI**. Each task is independently testable and carries a one-line
acceptance note.

## Engine (`features/instrument-audio/services`)

- [ ] Pure `instrument-voices` table mapping every `Instrument` to a synth voice config — *no Tone import; covers all eight instruments.*
- [ ] `instrument-player` with `play(instrument)` — *lazy Tone import (SSR-safe); resumes the audio context on first call; fire-and-forget, never throws to the caller.*
- [ ] Synthesized default kit (membrane / noise / metal voices) — *each instrument sounds distinct; no sample assets.*
- [ ] Stable, reusable API — *`play(instrument)` is the single entry point a future Score Playback can reuse unchanged.*

## Tests (engine)

- [ ] Unit test: the voices table has an entry for **every** `Instrument` — *guarantees all supported instruments have feedback. See [tests.md](tests.md).*
- [ ] Unit test: `play` is safe to call when Tone/audio is unavailable — *no throw; editing is never interrupted.*

## UI (`apps/web/src/features/editor`)

- [ ] Wrap the editor's note-toggle so each cell click also calls `play(instrument)` — *empty-cell add and existing-note click both sound; the wrap is in the UI, the editor store and Score stay untouched.*
- [ ] Keep feedback off the edit's critical path — *play is fire-and-forget; the toggle/autosave is unaffected.*

## Validation

- [ ] Verify all [acceptance criteria](spec.md#acceptance-criteria) — *type-check, lint, tests and production build green.*
- [ ] Sync docs — *[backlog.md](../../product/backlog.md) status updated; [roadmap.md](../../product/roadmap.md) note covers the shared instrument engine.*
