# ADR-005 — Use Tone.js for Audio Playback

## Status

Accepted

## Context

[AUDIO-001](../specs/audio-upload/spec.md) lets a drummer upload a reference
recording and control its playback (play, pause, stop, seek, volume) while
transcribing. We need a playback engine.

The issue's technical note suggests "browser audio APIs for the initial
implementation". However, [tech-stack](../../.claude/tech-stack.md) already
designates **Tone.js** for playback and **Tone.js Transport** for scheduling,
and the [roadmap](../product/roadmap.md) builds toward Phase 1 (score playback)
and Phase 2 (score ↔ audio synchronization) on the same engine. Tone.js is a
thin layer over the Web Audio API, so adopting it still satisfies the "browser
audio APIs" intent while avoiding a throwaway implementation we would replace one
phase later.

## Decision

Use **Tone.js** as the audio playback engine for uploaded reference tracks.

* A `Tone.Player` loads the uploaded blob (via an object URL) and provides
  start / stop / seek; a `Tone.Volume` (or the player's gain) handles volume so
  changes apply live without restarting playback.
* The player and all Tone.js usage live in the **application layer**
  (`apps/web/src/features/audio`), never in the domain — the domain stays
  framework- and Browser-API-agnostic ([ADR-003](003-score-model.md)).
* Playback state (status, position, duration, volume) is orchestrated by a
  Zustand store ([ADR-001](001-zustand.md)); components only render it.

## Consequences

* One engine carries forward to Phase 1 (score playback) and Phase 2
  (synchronization) — no rewrite, and Tone.Transport is available when those
  arrive.
* Adds the `tone` dependency (approved here, as required by tech-stack).
* Tone.js is Browser-only; it is confined to the app layer and must never leak
  into `packages/notation-engine`.
* Position tracking needs an explicit update loop feeding the store, since
  playback time is not a React value.

## Alternatives considered

* **HTMLAudioElement (`<audio>`)** — gives play/pause/seek/volume/position for
  free with zero dependencies, but is a parallel engine we would replace at
  Phase 1; contradicts the designated stack; rejected.
* **Web Audio API directly** — full control, no library, but reimplements
  transport/seek plumbing that Tone.js already provides and that later phases
  need; rejected.

Replacing Tone.js would require a superseding ADR.
