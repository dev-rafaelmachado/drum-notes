# ADR-010 — Score Playback From the Domain Model via Tone.js Transport

## Status

Accepted

## Context

[AUDIO-005 Score Playback](../specs/score-playback/spec.md) plays the written
notation with drum sounds: start / pause / resume / stop, follow the project BPM,
highlight measures and notes as they play, and begin from any measure. It is
roadmap Phase 1.

The issue is prescriptive: playback must be **generated directly from the
notation domain model** (Score / Measure / Note), **no playback-specific notation
model** may be created, it must **reuse the AUDIO-004 instrument engine**, and it
should prefer **Tone.js** for scheduling and transport — while leaving room for
future MIDI export, looping, variable speed and velocity.

Constraints / precedent:

* The canonical model is the single source of truth ([ADR-003](003-score-model.md));
  projections of it (e.g. the export [`ScoreLayout`](../architecture/domain.md))
  are allowed, parallel notation models are not.
* The metronome ([ADR-007](007-metronome.md)) already owns the **global**
  Tone.Transport; "a future feature that also needs the transport must
  coordinate."
* The instrument-audio engine ([ADR-009](009-instrument-audio.md)) is the shared
  per-instrument sound source.

## Decision

* **Timing is a pure domain projection.** `packages/notation-engine` gains
  `buildPlaybackSchedule(score)` → timed `ScheduledNote`s (`time`, `instrument`,
  `measureIndex`, `step`), `measureStarts`, `stepDuration`, `duration`. It is
  derived from Score / Measure / Note using the existing timing helpers and adds
  **no** new notation representation — the same pattern as `ScoreLayout`.
* **Scheduling uses Tone.js Transport** in the app layer
  (`apps/web/src/features/score-playback`): each note is `Transport.scheduleOnce`
  at its `time`; pause/resume map to `Transport.pause`/`start`; stop cancels and
  resets; **seek-from-measure** starts the transport at `measureStarts[k]`.
* **Sound reuses AUDIO-004.** The instrument engine is extended with a
  time-scheduled `trigger(instrument, time)` (the immediate `play` stays for
  feedback); playback schedules `trigger` at each note's transport time. One
  sound source, no duplication.
* **Single transport owner.** Because the metronome also drives the global
  Transport, the two are **mutually exclusive**: starting score playback stops
  the metronome.
* **Extensible by construction.** The schedule already carries per-note time,
  instrument and position, so MIDI export, loop, variable speed and velocity can
  be layered on without reshaping the engine.

## Consequences

* Playback always reflects the current model; editing the score changes what
  plays, with no second representation to keep in sync.
* The schedule is unit-testable without a browser; transport/audio is mocked in
  tests and verified by ear in the app.
* Mutual exclusion with the metronome is a deliberate limitation (no click track
  over playback) that keeps a single, conflict-free transport owner.
* Reusing the instrument engine keeps one sound source for feedback and playback.

## Alternatives considered

* **A dedicated playback/MIDI-like notation model** — explicitly forbidden by the
  issue and would duplicate the source of truth; rejected in favour of a pure
  schedule projection.
* **`setInterval`/manual clock scheduling** — drifts, not sample-accurate;
  rejected for Tone.Transport.
* **A second instrument sound engine for playback** — duplicates AUDIO-004;
  rejected in favour of extending the shared engine with a scheduled trigger.
* **Concurrent metronome + playback on the global transport** — start/stop/pause
  contention on a single shared Transport; deferred via mutual exclusion.
