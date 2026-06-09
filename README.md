# Drum Notes

A drum-notation editor focused on simplicity and speed. Drummers can create,
edit, save and export drum scores without the complexity of traditional
music-notation software.

> Status: project scaffold. The MVP (score editor) is specified but not yet
> implemented — see [docs/specs/score-editor/spec.md](docs/specs/score-editor/spec.md).

## Documentation

* **Product** — [vision](docs/product/vision.md) · [roadmap](docs/product/roadmap.md) · [glossary](docs/product/glossary.md)
* **Architecture** — [overview](docs/architecture/overview.md) · [domain](docs/architecture/domain.md) · [frontend](docs/architecture/frontend.md) · [storage](docs/architecture/storage.md)
* **Decisions** — [ADRs](docs/adr)
* **Specs** — [score-editor](docs/specs/score-editor/spec.md)
* **Engineering rules** — [.claude](.claude)

## Tech Stack

Next.js · React · TypeScript · TailwindCSS · shadcn/ui · Zustand · IndexedDB ·
Vitest. Monorepo with pnpm + Turborepo. See [docs/TS.md](docs/TS.md).

## Repository Layout

```
apps/
  web/                  # Next.js application (UI + state orchestration)
packages/
  core/                 # shared types, utilities, constants (framework-agnostic)
  notation-engine/      # canonical domain: Score -> Measure -> Note
  ui/                   # shared components / design system
docs/                   # product, architecture, ADRs, specs
.claude/                # authoritative engineering rules
```

## Getting Started

Requires **Node 20+** (a `.nvmrc` pins `22.17.0`) and **pnpm** (provisioned via
`corepack` from the `packageManager` field).

```bash
nvm use            # picks up .nvmrc
corepack enable    # makes pnpm available at the pinned version
pnpm install
pnpm dev           # runs the web app with Turbopack
```

### Common Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Run the web app (`next dev --turbopack`). |
| `pnpm build` | Build all packages and the app via Turborepo. |
| `pnpm type-check` | Type-check every workspace. |
| `pnpm test` | Run Vitest across workspaces. |
| `pnpm lint` | Lint the whole repo (ESLint flat config). |
| `pnpm format` | Format with Prettier. |

## Workflow

This project follows **spec-driven development**: no code before a spec. See
[.claude/workflow.md](.claude/workflow.md). Architecture changes require an ADR.
