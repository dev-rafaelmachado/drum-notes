# ADR-002 — Use IndexedDB for Local Persistence

## Status

Accepted

## Context

The MVP must let a user **save locally and reopen a project unchanged**, with no
login and no backend (see [PRD](../PRD.md) and
[score-editor spec](../specs/score-editor/spec.md)). The product is
**offline-first**, so persistence cannot depend on the network.

A drum score can grow to many measures and notes, and autosave fires on every
edit, so we need durable structured storage with reasonable capacity — not just
a string blob.

## Decision

Use **IndexedDB**, accessed through the **`idb`** library, as the local
persistence layer for the MVP.

Scores are stored in a single `scores` object store keyed by `score.id`. The
stored value is a serialisation of the [domain model](../architecture/domain.md);
storage does not define its own structure. Autosave writes the current Score on
every meaningful edit (see [storage.md](../architecture/storage.md)).

## Consequences

* Works fully offline; durable across reloads and restarts.
* Structured, higher-capacity storage suitable for growing scores and frequent
  autosaves.
* `idb` gives a promise-based API over IndexedDB's verbose native interface.
* Browser-only API — it lives behind the application/storage layer and must
  never leak into the framework-agnostic domain.

## Alternatives considered

* **localStorage** — small quota and synchronous/string-only; unsuitable for
  growing structured scores; rejected.
* **Backend database now** — contradicts the no-backend, offline-first MVP
  scope; rejected (planned for Phase 5 via Supabase).
* **In-memory only** — fails the "reopen a saved project" requirement; rejected.

A future cloud-sync layer (Supabase) will be added on top of, not in place of,
local IndexedDB, and will require its own ADR.
