# Drum Notes — Technical Specification (Index)

Drum Notes is built as a **DDD-inspired, offline-first monorepo**: a Next.js +
React + TypeScript web app (TailwindCSS, shadcn/ui), Zustand for state, and
IndexedDB for local persistence, all consuming a single canonical Score →
Measure → Note domain model.

This document is an **index**. The detail lives in the architecture docs and
decision records below — there is intentionally no duplicated content here.

## Architecture

* [Overview](architecture/overview.md) — style, layering, dependency direction,
  package map (`core`, `notation-engine`, `ui`, `apps/web`).
* [Domain model](architecture/domain.md) — Score → Measure → Note, fields and
  invariants.
* [Frontend](architecture/frontend.md) — `apps/web` structure, feature folders,
  state orchestration.
* [Storage](architecture/storage.md) — IndexedDB schema, autosave, offline-first.

## Decision Records

* [ADR-001 — Zustand](adr/001-zustand.md) — state management.
* [ADR-002 — IndexedDB](adr/002-indexeddb.md) — local persistence.
* [ADR-003 — Score model](adr/003-score-model.md) — single source of truth.
* [ADR-012 — Design system](adr/012-design-system.md) — design tokens & brand DS *(Proposed)*.

## Specification

* [Score Editor](specs/score-editor/spec.md) · [Tasks](specs/score-editor/tasks.md) · [Tests](specs/score-editor/tests.md)
* [Design System Migration](specs/design-system/prd.md) — PRD (Backlog).

## Governing Rules

The authoritative engineering rules live in
[`.claude/`](../.claude): [architecture](../.claude/architecture.md),
[tech-stack](../.claude/tech-stack.md),
[coding-standards](../.claude/coding-standards.md),
[workflow](../.claude/workflow.md). Where these docs expand on those rules, they
elaborate rather than contradict.
