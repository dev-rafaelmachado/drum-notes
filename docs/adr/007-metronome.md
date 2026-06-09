# ADR-007 — Metronome Timing in the Domain, Click Synthesis via Tone.js

## Status

Accepted

## Context

[AUDIO-002](../specs/metronome/spec.md) adds a metronome that clicks at the
project tempo, accents the downbeat, and follows the score's BPM. Two questions
need deciding: **where the timing lives**, and **how the click is produced**.

Constraints:

* The domain is the single source of truth and stays **framework-agnostic**
  ([ADR-003](003-score-model.md)); `architecture.md` lists **playback
  preparation** as a `notation-engine` responsibility.
* The app is **offline-first** — no dependency on network-hosted assets.
* **Tone.js** is the approved audio engine ([ADR-005](005-audio-playback.md)),
  and the issue prefers Tone.js for scheduling; `tech-stack.md` already names
  **Tone.js Transport** for audio scheduling. No new dependency is introduced.

## Decision

Split the metronome into **timing (domain)** and **sound (app layer)**.

* **Timing math** lives in `packages/notation-engine` as pure
  playback-preparation helpers — `beatsPerMeasure(timeSignature)`,
  `secondsPerBeat(bpm)`, `isAccentBeat(beatIndex, timeSignature)`. They read the
  canonical `Score` fields and add **no** new tempo representation and **no**
  change to the `Score`.
* **Scheduling and sound** live in `apps/web/src/features/metronome`, using
  **Tone.js Transport** (`scheduleRepeat`) for sample-accurate timing and a
  **synthesized** click — two pitches, the higher one on the downbeat. No audio
  sample assets. Tone is imported lazily (dynamic `import`) so the module never
  evaluates browser-only code during server rendering.
* The metronome is **independent of the uploaded-track player**
  ([ADR-005](005-audio-playback.md)): both share the Tone audio context but use
  separate nodes and may sound simultaneously.
* Metronome **settings (volume, on/off) are session UI state**, not persisted to
  the `Score` — consistent with how the reference-track volume is treated.

## Consequences

* Timing is unit-testable without a browser; the same helpers can feed Phase 1
  score playback, keeping one tempo source.
* No assets to bundle or host; the metronome works fully offline.
* Tone.Transport is a global singleton — the metronome owns the transport schedule
  while the track player uses transport-free `Player.start`, so the two do not
  contend. A future feature that also needs the transport must coordinate.
* Browser/Tone code stays confined to the app layer, never the domain.

## Alternatives considered

* **`setInterval`/`setTimeout` scheduling** — drifts and is not sample-accurate;
  rejected in favour of Tone.Transport.
* **Sample-based click (audio files)** — needs an asset pipeline and undermines
  the offline-first, zero-asset goal; rejected for synthesis.
* **Timing math in the React component or store** — would put business rules
  outside the domain, against `architecture.md`; rejected.
* **Persisting metronome settings on the Score** — adds non-musical UI state to
  the source-of-truth model for no required benefit; rejected.
