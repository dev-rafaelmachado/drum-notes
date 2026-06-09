# ADR-008 — Score Synchronization Stored Separately From Notation

## Status

Accepted

## Context

[AUDIO-003](../specs/score-sync/spec.md) keeps the score aligned with the
uploaded track: it highlights the active measure during playback, scrolls to it,
and seeks both directions between a measure and its moment in the audio.

The issue is explicit that **synchronization data should be stored separately
from notation data**, and suggests a mapping of `{ measureId, start, end }`
designed to support **future automatic** synchronization.

Constraints:

* The canonical `Score → Measure → Note` model is the single source of truth and
  must not gain a parallel or derived representation ([ADR-003](003-score-model.md)).
* The domain stays framework-agnostic; "playback preparation" is a
  `notation-engine` responsibility (`architecture.md`).
* The feature consumes the audio player's position from
  [ADR-005](005-audio-playback.md) and persists offline via IndexedDB
  ([ADR-002](002-indexeddb.md)).

## Decision

Model synchronization as a **separate `SyncMap`**, not part of notation.

* A new domain module in `packages/notation-engine` defines
  **`MeasureTimestamp` (`measureId`, `start`, `end`)** and
  **`SyncMap` (`scoreId`, `entries`)**, with pure operations:
  `createSyncMap`, `setMeasureTimestamp`, `removeMeasureTimestamp`,
  `activeMeasureAt(map, seconds)`, `measureStart(map, measureId)`. It references
  measure **ids** only and **never** modifies `Score` / `Measure` / `Note`, so
  the source-of-truth notation model is unchanged.
* The map persists in a **dedicated `sync` IndexedDB store keyed by `scoreId`**
  (DB version bump 2 → 3, additive), separate from the `scores` and `audio`
  stores. Deleting a score deletes its sync map.
* In the app layer (`apps/web/src/features/sync`), a store hydrates and edits the
  map; the **active measure is derived** via `activeMeasureAt` from the audio
  player's position. Highlight and auto-scroll are UI concerns driven by the
  active measure id; **seek-to-measure** calls the audio player's `seek`.

## Consequences

* Notation and synchronization evolve independently; transcription never risks
  corrupting timing data and vice versa — honouring the issue's directive.
* Future **automatic** synchronization can regenerate `SyncMap.entries` wholesale
  without touching the `Score`.
* Active-measure resolution is pure and unit-testable without a browser.
* One more IndexedDB store (additive upgrade; existing data untouched).
* Synchronization depends on a loaded reference track ([AUDIO-001](../specs/audio-upload/spec.md));
  with no track, the score behaves exactly as before.

## Alternatives considered

* **Timestamps on `Measure`** (inside notation) — directly contradicts "store
  separately", couples notation to playback, and bloats every score read;
  rejected.
* **Mapping only in the app layer (no domain model)** — loses the pure,
  testable `activeMeasureAt` resolution and the DDD "playback preparation"
  placement; rejected.
* **Auto-derive the mapping from BPM / time signature** — that is the future
  automatic-sync work, explicitly out of scope; manual mapping ships now with a
  structure that auto-sync can later populate; rejected for this phase.
