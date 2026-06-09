# Tasks — Project Metronome (AUDIO-002)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Domain → Tests → State → Service →
UI**. There is no storage work (metronome settings are session state). Each task
is independently testable and carries a one-line acceptance note. Never start
from the UI.

## Domain (`packages/notation-engine`)

- [x] Add pure metronome-timing helpers (`beatsPerMeasure`, `secondsPerBeat`, `isAccentBeat`) — *playback preparation; framework-agnostic, no Browser APIs.*
- [x] Derive beats-per-measure and accent from `Score.timeSignature`; seconds-per-beat from `bpm` — *consumes the domain model; no new tempo representation.*
- [x] Export the helpers from the package index — *consumed by the metronome state/service.*

## Tests (domain)

- [x] Unit tests for the timing helpers — *e.g. 4/4 → 4 beats, accent on beat 0; 120 bpm → 0.5 s/beat. See [tests.md](tests.md).*

## State (Zustand — `features/metronome/stores`)

- [x] `metronome-store` holding `isRunning` and `volume`, with `start` / `stop` / `setVolume` — *orchestrates the engine; holds no timing math.*
- [x] `sync(bpm, timeSignature)` action — *pushes the score's current tempo/meter to the engine; retempos a running metronome live.*

## Engine (`features/metronome/services`)

- [x] Tone.js Transport metronome engine — *schedules a repeating click via `Transport.scheduleRepeat`; lazy Tone import for SSR safety (see [ADR-007](../../adr/007-metronome.md)).*
- [x] Synthesized click with two pitches (accent vs normal) — *first beat of each measure is higher; no sample assets.*
- [x] `setTempo` / `setVolume` apply live; `start` resumes the audio context on the user gesture; `stop` halts and resets the beat counter — *no drift, immediate volume.*

## UI (`apps/web/src/features/metronome/components`)

- [x] `MetronomePanel` — start/stop toggle, volume slider, BPM readout — *reflects the project BPM.*
- [x] Sync effect — *on BPM / time-signature change, call `sync`; a running metronome follows live.*
- [x] Mount the metronome in the editor toolbar — *available next to the other transport controls.*
- [x] Accessibility pass — *keyboard operable, labelled controls (e.g. "Start metronome").*

## Validation

- [x] Store test for the critical flow — *start → running; sync forwards tempo to the engine; stop → idle (mocked engine).*
- [x] Verify all [acceptance criteria](spec.md#acceptance-criteria) — *type-check, lint, tests and production build green.*
- [x] Sync docs — *[backlog.md](../../product/backlog.md) status updated; [tech-stack](../../../.claude/tech-stack.md) Tone.js Transport usage confirmed.*
