# Frontend Architecture

This document describes the structure of `apps/web` — the Next.js application
that hosts the editor UI. It follows the layering defined in
[overview.md](overview.md): UI orchestrates state and renders the domain model,
but never owns business rules.

---

## Stack

* **Next.js** + **React** + **TypeScript**
* **TailwindCSS** for styling
* **shadcn/ui** for components, **Lucide React** for icons
* **Zustand** for state ([ADR-001](../adr/001-zustand.md))
* **React Hook Form** + **Zod** for forms and validation

---

## App Structure

The web app is organised **by feature**, not by technical type:

```
apps/web/src/
├── features/
│   ├── editor/     # the score grid and note editing
│   ├── project/    # create / open / configure a score
│   └── export/     # PDF and PNG export
└── shared/
    ├── ui/         # app-level shared components
    └── lib/        # app-level helpers (no domain rules)
```

---

## Feature Folder Convention

Each feature is self-contained and follows the same internal layout:

```
feature/
├── components/   # presentational + container React components
├── hooks/        # reusable feature logic
├── stores/       # Zustand stores orchestrating this feature
├── services/     # calls into the domain / persistence / export
└── types/        # feature-local types
```

Avoid generic catch-all folders (`utils`, `helpers`, `common`) unless a clear
shared purpose exists.

---

## State Orchestration

The division of responsibility is strict:

* **Domain** (`packages/notation-engine`) holds business rules.
* **Stores** (Zustand) orchestrate state — they call domain functions, hold the
  current Score, and expose actions to the UI.
* **Components** render store state and dispatch user intent. They contain no
  business rules.

A component should be able to render correctly given only store state, and a
store should be testable without React.

---

## Editing Flow (illustrative)

1. User clicks a cell in the editor grid.
2. The component dispatches an action on the editor store.
3. The store calls a domain operation (e.g. toggle note) on the current Score.
4. The domain returns an updated, validated Score (respecting subdivision).
5. The store updates state; the grid re-renders.
6. Persistence autosaves the new Score ([storage.md](storage.md)).

---

## Component Standards

* Prefer functional components and composition over inheritance.
* Keep components focused; extract reusable logic into hooks.
* Accessibility is not optional: interactive elements support keyboard
  navigation, carry accessible labels, and use semantic HTML.

See [.claude/coding-standards.md](../../.claude/coding-standards.md) for the
full standards.

---

## Design System

> **Status:** migration planned, not yet implemented.

**Today:** the UI uses the stock **shadcn/ui** "new-york" theme on a flat
`neutral` base, with colours hardcoded as Tailwind palette classes across
components. The shared `packages/ui` package is an empty stub.

**Target:** a **token-driven Drum Notes design system** — semantic design tokens
(brand → semantic → editor-domain) as the single styling source, consumed by both
DOM components and the export canvas, with shared primitives promoted to
`packages/ui` and a dark theme. Feature components reference tokens, never raw
palette classes.

See the [Design System Migration PRD](../specs/design-system/prd.md) and
[ADR-012](../adr/012-design-system.md) *(Proposed)*; brand assets live in
[docs/brand](../brand). Tracked as `DESIGN-00x` in the
[backlog](../product/backlog.md#design-system).
