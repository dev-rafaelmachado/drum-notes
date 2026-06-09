# ADR-006 — Audio Storage and the Score Audio Reference

## Status

Accepted

## Context

[AUDIO-001](../specs/audio-upload/spec.md) requires an uploaded audio file to be
**associated with the project** and to **survive reopen**, offline. Two things
must be decided: how the audio relates to the canonical
[`Score`](../architecture/domain.md), and where the audio bytes live.

Constraints:

* The domain is the single source of truth and must stay **framework- and
  Browser-API-agnostic** ([ADR-003](003-score-model.md)) — it cannot hold a
  `Blob`.
* Persistence is **offline-first IndexedDB** ([ADR-002](002-indexeddb.md)) and
  *consumes* the domain model rather than defining a parallel one.
* The architecture rules prefer **extending** existing entities over adding
  parallel structures.

## Decision

Split the audio into **metadata on the Score** and **bytes in storage**.

* Extend `Score` with an optional **`audio: AudioReference`** — `id`,
  `fileName`, `mimeType`, `duration`. This is plain, portable metadata (no
  `Blob`, no Browser API), so the domain stays agnostic while still owning the
  association.
* Store the audio **blob** in a new IndexedDB **`audio`** object store, keyed by
  the reference `id` (DB version bump 1 → 2, additive upgrade). The blob is a
  storage/application concern and never enters the domain.
* The `Score.audio` reference autosaves with the Score through the existing
  `scores` store; the blob is written/read/deleted via a dedicated
  `audio-repository`.
* Deleting a project deletes its blob; replacing the audio deletes the previous
  blob. One reference track per project.

## Consequences

* The project owns its audio through the source-of-truth model, yet the domain
  remains free of Browser APIs and portable to mobile/backend (Phases 4–5).
* IndexedDB gains a second store; the upgrade is additive and leaves `scores`
  untouched.
* Reference and blob can momentarily diverge (e.g. a missing blob for a present
  reference); load paths must tolerate a missing blob gracefully.
* Sets the storage shape that Phase 2 synchronization will build on.

## Alternatives considered

* **Store the blob inside the Score** — would force a `Blob` into the
  framework-agnostic domain and bloat every score read/list; rejected.
* **Storage-only association keyed by `score.id`, domain untouched** — keeps the
  domain pure but moves the association *outside* the source-of-truth model,
  against the "extend the domain" rule; rejected in favour of the metadata
  reference.
* **Separate the metadata into its own store too** — needless second lookup; the
  reference is small and belongs with the Score it describes; rejected.

Any change to the `Score` audio reference shape requires updating
[domain.md](../architecture/domain.md) and a superseding/related ADR.
