# ADR-001 — Use Zustand for State Management

## Status

Accepted

## Context

The web app needs to manage client-side state: the global editor state, project
state, and user preferences. We require a solution that:

* keeps **business rules out of React** — the [domain model](../architecture/domain.md)
  must stay framework-agnostic so it can be reused on mobile and the backend;
* has **minimal boilerplate** so simple, fast interactions stay simple;
* lets **stores orchestrate** state while components only render it.

The candidates considered were Redux, MobX, Recoil, React Context, and Zustand.

## Decision

Use **Zustand** as the primary state-management library.

Stores orchestrate state and call into the domain; components consume stores and
render. Business rules never live in components or in the store itself — the
store delegates to `packages/notation-engine`.

Zustand is used for:

* global editor state
* project state
* user preferences

## Consequences

* Low boilerplate keeps feature stores small and readable.
* Clear separation: domain (rules) → store (orchestration) → component (render).
* Stores are testable without React.
* Team must hold the discipline of keeping rules in the domain, since Zustand
  does not enforce it structurally.

## Alternatives considered

* **Redux** — too much boilerplate for this app's size; rejected.
* **MobX** — observable/reactive model adds conceptual overhead; rejected.
* **Recoil** — atom model and maturity concerns; rejected.
* **React Context only** — insufficient for frequent editor updates; rejected.

Redux, MobX and Recoil may not be introduced without a superseding ADR
(see [tech-stack](../../.claude/tech-stack.md)).
