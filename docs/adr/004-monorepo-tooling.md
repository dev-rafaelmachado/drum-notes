# ADR-004 — Monorepo Tooling (pnpm + Turborepo, JIT internal packages)

## Status

Accepted

## Context

The [architecture](../architecture/overview.md) mandates a monorepo with a
framework-agnostic domain shared across `apps/web` and the `packages/*`
libraries, with future reuse on mobile and a backend. The
[tech-stack](../../.claude/tech-stack.md) already fixes **pnpm** as the package
manager and **Turborepo** as the monorepo orchestrator. What remained undecided
was *how* internal packages are consumed and how shared tooling (TypeScript,
ESLint, Prettier, tests) is organised — decisions worth recording so the setup
stays consistent as the repo grows.

## Decision

* **Workspaces:** pnpm workspaces (`apps/*`, `packages/*`); internal deps use the
  `workspace:*` protocol. pnpm is provisioned via **corepack** and pinned through
  the root `packageManager` field.
* **Task orchestration:** **Turborepo** (`turbo.json`) runs `build`, `dev`,
  `type-check` and `test` across workspaces with caching.
* **Internal packages are consumed as TypeScript source** (Turborepo
  "Just-in-Time" packages): each package's `exports` points at `./src/index.ts`
  and has **no build step**. The Next.js app transpiles them via
  `transpilePackages`. This removes a compile stage from the inner loop and keeps
  types live across package boundaries.
* **Centralised linting:** a single root ESLint **flat config**
  (`eslint.config.mjs`) lints the whole repo. The domain's framework-agnostic
  rule is **encoded as lint**: `packages/core` and `packages/notation-engine`
  forbid importing `react` / `next` / `zustand`.
* **Per-package config where it must be local:** each package keeps its own
  `tsconfig.json` (extending `tsconfig.base.json`) and `vitest.config.ts`.
* **Bundler:** the web app uses **Turbopack** for `next dev --turbopack`.
* **Runtime:** the repo lives on the WSL filesystem; the toolchain runs
  natively in WSL (Node via nvm, pinned by `.nvmrc`).

## Consequences

* Fast inner loop: no per-package build, live types, cached Turbo tasks.
* Architecture boundaries are enforced automatically by ESLint, not just by
  convention.
* `apps/web` must list internal packages in `transpilePackages` (and any future
  consumer outside Next must transpile TS source too).
* If a package ever needs to be published or consumed by a non-transpiling
  runtime, it will need a build step — a future ADR would revisit this.

## Alternatives considered

* **Pre-compiled internal packages** (each package builds to `dist`) — adds a
  build stage and stale-output risk for an app-only monorepo; rejected for now.
* **Per-package ESLint configs** instead of a central one — more duplication and
  weaker enforcement of the cross-cutting domain rule; rejected.
* **npm/yarn workspaces or Nx** — contradicts the fixed pnpm + Turborepo stack;
  rejected.
