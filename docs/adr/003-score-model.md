# ADR-003 — Single Canonical Score Model as Source of Truth

## Status

Accepted

## Context

Drum Notes has many consumers of score data: the editor UI, local persistence,
future playback, and export (PDF/PNG). If each consumer modelled the score in
its own way, the representations would drift, bugs would multiply at the seams,
and reuse across web/mobile/desktop would break.

We need one authoritative structure that every part of the system reads from and
writes to.

## Decision

Adopt a **single canonical domain model — Score → Measure → Note** — as the
source of truth, owned by `packages/notation-engine` and described in
[domain.md](../architecture/domain.md).

* A **Score** owns ordered **Measures**; a Measure owns **Notes**; a Note targets
  one **Instrument** at one **Position** with a **Velocity**.
* **No feature may introduce an alternative or parallel score representation.**
* UI, persistence, playback and export all **consume** this model.
* The model is **framework-agnostic** (no React, Browser APIs, storage, or UI),
  so it ports unchanged to mobile (Phase 4) and the backend (Phase 5).
* Invariants (a Note belongs to a Measure; a Measure to a Score; Position
  respects Subdivision) are enforced in the domain layer.

## Consequences

* One change to the model propagates consistently to every consumer.
* Reuse across platforms is preserved because the model carries no platform
  dependencies.
* New concepts must be expressed by **extending** the existing model, not by
  adding parallel structures.
* Any structural change to the model requires updating `domain.md` and recording
  a superseding/related ADR.

## Alternatives considered

* **Per-feature models** (separate shapes for editor, storage, export) — causes
  drift and duplicated logic; rejected.
* **Storage-shaped model** (let IndexedDB's schema drive the structure) — couples
  the domain to a browser API and breaks portability; rejected.
* **UI-shaped model** (grid-centric structure) — couples the domain to React and
  the editor layout; rejected.
