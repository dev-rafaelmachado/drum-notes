# Architecture Overview

This document describes the system architecture at a high level. It elaborates
on the constraints in [.claude/architecture.md](../../.claude/architecture.md),
which remains the authoritative set of rules.

---

## Architecture Style

* **Domain-Driven Design (DDD) inspired** — the domain model is the centre of
  the system; everything else depends on it, never the reverse.
* **Monorepo** — managed with pnpm workspaces and Turborepo.
* **Feature-oriented frontend** — the web app is organised by feature, not by
  technical type.
* **Offline-first** — the editor functions without a network connection.

---

## Layering & Dependency Direction

The system is layered. Dependencies may only point **downward**:

```
UI            (React components, pages — apps/web)
  │
  ▼
Application   (Zustand stores, services, orchestration)
  │
  ▼
Domain        (Score / Measure / Note — framework-agnostic)
```

**Forbidden:** the Domain layer must never depend on React, Browser APIs,
storage, or UI. If the domain imported any of those, the model would stop being
portable to mobile (Phase 4) and the backend (Phase 5).

The domain layer is pure TypeScript: given the same input it produces the same
output, with no side effects.

---

## Package Map

| Package | Responsibilities | Must NOT contain |
|---------|------------------|------------------|
| `packages/core` | Shared types, utilities, constants. | React, Browser APIs. |
| `packages/notation-engine` | Domain models, score manipulation, validation, playback preparation, export preparation. | React, UI logic. |
| `packages/ui` | Shared components, design system. | Business logic, domain rules. |
| `apps/web` | User interface, user interactions, state orchestration. | Core domain logic. |

The canonical domain model lives in `packages/notation-engine` and is consumed
everywhere else. No package may introduce an alternative score representation
(see [ADR-003](../adr/003-score-model.md)).

---

## State Management

* Business rules belong to the **domain**.
* **Zustand stores** orchestrate state and call into the domain.
* React **components render** state and dispatch user intent.
* Business rules never live inside React components.

See [frontend.md](frontend.md) for the concrete app structure and
[ADR-001](../adr/001-zustand.md) for the state-library decision.

---

## Persistence

Local-first persistence uses **IndexedDB** (via the `idb` library), with
autosave on every meaningful edit. The score is serialised from the domain
model — storage consumes the model, it does not define its own shape. See
[storage.md](storage.md) and [ADR-002](../adr/002-indexeddb.md).

---

## Future Compatibility

The architecture must support **web, mobile and desktop**. The rule that makes
this possible is singular: **domain code stays platform-independent**, and all
platform-specific code lives inside applications, never in `packages/core` or
`packages/notation-engine`.

---

## Documentation Discipline

Architecture changes require both an **ADR** and an update to this
documentation. Code and documentation must stay synchronized; when they
disagree, documentation is the source of truth unless explicitly marked
outdated.
