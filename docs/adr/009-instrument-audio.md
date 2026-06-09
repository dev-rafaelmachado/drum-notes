# ADR-009 — Reusable Instrument Audio Engine (Synthesized Default Kit)

## Status

Accepted

## Context

[AUDIO-004 Instant Audio Feedback](../specs/instant-feedback/spec.md) must sound
a drum voice the instant a note is placed or clicked, for all eight instruments,
with minimal latency and without interrupting editing. The issue asks for a
simple `play(instrument)` API, prefers **Tone.js**, and wants the audio to be
**reusable by future playback features** (Phase 1 Score Playback uses
per-instrument sound).

Two questions: **where the sound comes from** (synthesized vs recorded samples),
and **where the play call is wired** (editor store vs UI).

Constraints / precedent:

* **Tone.js** is the approved engine ([ADR-005](005-audio-playback.md)); the
  metronome already uses a **zero-asset synthesized** source ([ADR-007](007-metronome.md))
  to stay offline-first.
* The domain is the source of truth and must not gain audio concerns
  ([ADR-003](003-score-model.md)); feedback must be **read-only** w.r.t. the
  `Score`.
* The acceptance criteria require that the **correct instrument sound plays** at
  low latency — they do not require a specific recording.

## Decision

Introduce a small, **stateless, reusable instrument-audio engine** in
`apps/web/src/features/instrument-audio`, exposing **`play(instrument)`**.

* The default kit is **synthesized with Tone.js voices** (membrane for
  kick/toms, filtered noise for snare/hi-hat, metal for ride/crash). A pure
  `instrument-voices` table maps every `Instrument` to a voice config and is unit
  tested for completeness.
* Tone is **imported lazily** (dynamic `import`) so the engine is SSR-safe; the
  audio context resumes on first call (a user gesture). `play` is
  **fire-and-forget** and never throws to the caller.
* **Feedback is wired in the UI**, not the store: the editor wraps its
  note-toggle so a cell click also calls `play(instrument)`. The editor store and
  the `Score` are untouched, keeping notation free of audio concerns.
* The `play(instrument)` API is the **stable seam**: Phase 1 Score Playback
  reuses the same engine, and a recorded sample pack can replace the synth voices
  behind the same API without changing callers.

## Consequences

* Instant, offline, zero-asset feedback consistent with the metronome's approach;
  nothing to fetch or license now.
* One engine serves both instant feedback and future score playback — a single
  per-instrument sound source.
* Feedback cannot corrupt notation (no `Score` access), satisfying "does not
  modify score data".
* Synthesized drums are functional but not studio-realistic; swapping in a sample
  pack later is an additive change behind the same API.

## Alternatives considered

* **Bundled recorded sample pack now** — more realistic, but adds bundle weight,
  asset sourcing/licensing, and load latency; "custom sample packs" are already
  out of scope. Deferred behind the stable API; rejected for this phase.
* **Play feedback inside the editor store / `toggleNote`** — couples notation
  orchestration to audio and forces store tests to mock the engine; rejected in
  favour of a thin UI wrap.
* **HTMLAudioElement per click** — parallel engine, weaker scheduling, and not
  reusable for scheduled score playback; rejected (Tone.js preferred).
