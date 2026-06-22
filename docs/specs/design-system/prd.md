# PRD — Design System Migration (shadcn defaults → Drum Notes DS)

> **Status:** Backlog (not started) · **Type:** Cross-cutting / Tech + Design
> **Owner:** Rafael Machado · **Created:** 2026-06-22
> **Decision record:** [ADR-012 — Design tokens & design system](../../adr/012-design-system.md) *(Proposed)*
> **Brand source:** [docs/brand](../../brand) (logo, banner, palette, voice)

This is a **PRD only** — nothing is implemented yet. It scopes the work, breaks
it into backlog issues (`DESIGN-00x`), and records the chosen approach so the
migration can start later without re-deciding fundamentals.

---

## 1. Summary

Drum Notes now has a **brand identity** ([docs/brand](../../brand)) — a warm
`#FFB020 → #FF4D2E` gradient, ink/slate neutrals, a logo and a voice. The
**application UI does not reflect it**: it is the stock shadcn/ui "new-york"
theme on a flat `neutral` base color, with colors hardcoded ad-hoc across
components. The product feels generic and off-brand.

This migration replaces the default shadcn look with a **token-driven Drum Notes
design system**: one canonical set of design tokens (color, radius, typography,
elevation, motion) that every surface consumes — DOM components **and** the PDF/PNG
export canvas — so the app, the marketing brand, and the exports all look like the
same product.

---

## 2. Goals / Non-goals

### Goals

* Establish **semantic design tokens** as the single source of truth for styling.
* Make the app visually express the **Drum Notes brand** (gradient, accent, ink).
* Remove **hardcoded color classes** (`neutral-900`, `blue-600`, …) from
  components in favour of tokens.
* Keep **exports on-brand** — the canvas renderer reads the same tokens.
* Introduce a **dark theme** built from the same tokens.
* Make styling **governable**: a documented rule + lint that forbids raw color
  classes in feature code.

### Non-goals (this initiative)

* No change to product behaviour, flows, or the domain model.
* No replacement of shadcn/Radix primitives with a different component library.
* No full visual redesign of layouts/UX (this is a **re-skin**, not a re-design).
* No new icon set (Lucide stays).
* No mobile-specific design work (Phase 4 of the [roadmap](../../product/roadmap.md)).
* No Storybook/visual-regression tooling commitment (tracked as a stretch idea).

---

## 3. Current State (baseline)

| Area | Today | Problem |
|------|-------|---------|
| Theme base | shadcn `new-york`, `baseColor: neutral`, `cssVariables: true` (`apps/web/components.json`) | Generic; no brand color. |
| Tokens | `globals.css` defines a **grayscale-only** token set (`--primary` is near-black, no accent). | No brand hue; tokens underused. |
| Components | `apps/web/src/components/ui/` has 4 shadcn primitives (`button`, `input`, `label`, `select`) with **hardcoded** `neutral-*` / `red-*` classes. | Not theme-driven. |
| Feature UI | **18 components** use ~80 hardcoded `neutral/blue/red/green` classes (editor, audio, project, sync, metronome, playback). | Color logic scattered, off-brand, hard to retheme. |
| Shared DS package | `packages/ui` is an **empty stub** (`export {}`). | No home for shared, branded primitives. |
| Export | `render-score-canvas.ts` paints **8 literal hex values** (`#111111`, `#e2e2e2`, …). | Canvas can't read CSS vars → brand drift between screen and export. |

> Inventory snapshot (2026-06-22): `grep` of `apps/web/src` for palette classes →
> 18 files; export canvas → 8 hex literals. Numbers will shift as the app grows;
> the migration must be **incremental**, not a freeze-and-rewrite.

---

## 4. Target: the Drum Notes Design System

### 4.1 Token layers

A **three-layer** model keeps brand decisions separate from component usage:

1. **Primitive (brand) tokens** — raw brand values from [docs/brand](../../brand):
   `heat #FFB020`, `strike #FF4D2E`, `ink #0B0B0F`, `slate #9CA3AF`, `paper #FFFFFF`,
   plus the signature `gradient(heat → strike)`.
2. **Semantic tokens** — role-based aliases the UI references:
   `background`, `foreground`, `primary`, `accent`, `muted`, `border`, `ring`,
   `destructive`, `success`. Themed per mode (light/dark).
3. **Component/domain tokens** — editor-specific roles so the grid stays
   intentional: `grid-line`, `beat-line`, `note`, `note-foreground`, `playhead`,
   `active-measure`, `surface`.

### 4.2 Proposed semantic mapping (light)

| Semantic token | Value | Notes |
|----------------|-------|-------|
| `background` | `paper #FFFFFF` | |
| `foreground` | `ink #0B0B0F` | |
| `primary` / `primary-foreground` | `strike #FF4D2E` / `paper` | Primary actions, accents. |
| `accent` / `accent-foreground` | `heat #FFB020` / `ink` | Highlights, secondary emphasis. |
| `muted` / `muted-foreground` | `neutral-100` / `slate #9CA3AF` | Subtle surfaces, hints. |
| `border` | `neutral-200` | |
| `ring` | `strike @ 45%` | Focus rings. |
| `destructive` | a **distinct crimson** (e.g. `#DC2626`) | ⚠️ Must read as different from `primary`, which is now red-ish — see Risks. |
| Editor `note` / `note-foreground` | `ink` / `paper` | Note cells. |
| Editor `playhead` / `active-measure` | `strike` / `heat` | Playback emphasis (today: blue). |

Dark mode flips `background → ink`, `foreground → paper`, with elevated surfaces
(`#14141A`) and brand accents kept vivid.

### 4.3 One token source, two consumers

Per the project's source-of-truth principle (cf. [ADR-003](../../adr/003-score-model.md)
for the domain), tokens get **one canonical definition** that feeds:

* **Tailwind v4 `@theme` / CSS variables** in `globals.css` → all DOM components.
* **The export canvas** (`render-score-canvas.ts`), which needs literal colours.

Proposed home: a framework-agnostic `packages/ui/src/tokens.ts` (TS constants),
mirrored into the CSS-variable block (manually, or generated by a small script as
a stretch). This prevents screen/export drift. See
[ADR-012](../../adr/012-design-system.md) for the decision and alternatives.

### 4.4 Component strategy

* **Keep shadcn/Radix primitives**; re-skin them through tokens (no rewrite).
* **Promote shared primitives** (`button`, `input`, `label`, `select`) into
  `packages/ui` so web/mobile/desktop reuse one branded set
  ([architecture.md](../../../.claude/architecture.md): `packages/ui` owns the
  design system; no business logic).
* Feature components consume tokens (`bg-primary`, `text-muted-foreground`, …)
  instead of raw palette classes.

### 4.5 Typography

Brand typefaces (all free/OFL — see [docs/brand](../../brand#typography)):

| Role | Typeface | Tokens |
|------|----------|--------|
| Display / headings | **Space Grotesk** | `--font-display` |
| Body / UI | **Inter** | `--font-sans` |
| Numeric / mono *(optional)* | **Space Mono** | `--font-mono` |

* Loaded via `next/font` (self-hosted, no layout shift, offline-friendly).
* Type-scale tokens (`--text-xs … --text-3xl`) plus weight/letter-spacing rules
  from the brand guide; display tightens tracking, body stays neutral.
* Numeric/mono is reserved for tempo (BPM) and timecodes.

### 4.6 Gradient usage

The `heat → strike` gradient (`linear-gradient(135deg, #FFB020, #FF4D2E)`) is a
**brand accent, not a default surface**. The authoritative do/don't rules live in
the [brand guide](../../brand#gradient); in product UI that means: reserve it for
the logo/brand mark, **one** hero moment per view, and playback emphasis
(playhead, active measure, progress); default interactive elements use flat
`primary` (strike); never on body text, large backgrounds, or destructive states;
never recolour or re-angle it. A `gradient-brand` utility/token encodes the one
true definition so usage can't drift.

---

## 5. Migration Plan (incremental, ship-in-slices)

Each phase is independently shippable and visually verifiable. No big-bang.

| Phase | Issue | Outcome | Risk |
|-------|-------|---------|------|
| A | `DESIGN-001` | Token foundation: `tokens.ts` + Tailwind `@theme` wiring, mapped to **current neutrals** (visual parity, zero brand change). | Low |
| B | `DESIGN-002` | Apply **brand palette** via tokens (primary/accent/ring/playhead). First visible brand shift. | Med |
| C | `DESIGN-003` | Promote `button/input/label/select` to `packages/ui`, token-driven. | Med |
| D | `DESIGN-004` | Restyle the **18 feature components** to tokens; delete raw color classes. | Med |
| E | `DESIGN-005` | **Editor visual language** tokens (grid/beat/note/playhead) applied to `InstrumentRow`/`MeasureView`. | Med |
| F | `DESIGN-006` | **Export parity**: canvas reads shared tokens. | Med |
| G | `DESIGN-007` | **Dark mode** from the same tokens. | Med |
| H | `DESIGN-008` | **Docs + governance**: usage guide, **Storybook**, lint rule banning raw color classes. | Low |
| I | `DESIGN-009` | **Brand typography**: Space Grotesk + Inter (+ optional Space Mono) via `next/font`, type-scale tokens. | Med |

Sequencing rule: **A → B** first (parity then brand). C–F and I can parallelise
after B. G and H land last (H includes Storybook).

---

## 6. Backlog Issues

Tracked in [docs/product/backlog.md → Design System](../../product/backlog.md#design-system).
`DESIGN-001` (token foundation) is the only hard prerequisite; the rest depend on it.

---

## 7. Acceptance Criteria

The migration is **done** when:

1. A documented **token set** exists as the single source of truth (DS + CSS vars + canvas).
2. The app uses the **brand palette** (gradient/accent/ink) — no stock-shadcn neutral look.
3. **No feature component** references raw color classes (`neutral-*`, `blue-*`, …);
   a lint rule enforces it.
4. Shared primitives live in **`packages/ui`** and are token-driven.
5. **Exports** (PDF/PNG) match on-screen brand colours.
6. A **dark theme** is available and passes contrast checks.
7. **Light & dark** meet **WCAG AA** for text and UI contrast.
8. **Brand typography** is applied (Space Grotesk display + Inter body, via
   `next/font`), and the **gradient** follows the documented usage rules.

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **`primary` (vermilion) vs `destructive` (red) confusion.** | Pick a clearly distinct destructive crimson; validate side-by-side; reserve gradient for brand, flat red for danger. |
| **Contrast regressions** with bright accents on white. | AA audit per phase; use accent for emphasis, not body text; tune `-foreground` pairs. |
| **Screen/export drift** (canvas can't read CSS vars). | Single `tokens.ts` consumed by both (`DESIGN-006`); no hex literals in canvas. |
| **Visual regressions** across 18 files. | Phase A keeps parity; ship per-feature; manual visual check (Storybook/VRT optional, not required). |
| **Scope creep into UX redesign.** | This is a re-skin; layout/flow changes are out of scope and need their own spec. |

---

## 9. Success Metrics

* 0 raw color-class occurrences in `apps/web/src` feature code (lint-enforced).
* 100% of shared primitives sourced from `packages/ui`.
* Screen vs. exported score: visually identical palette.
* Brand recognition: app, README banner, and exports read as one product.

---

## 10. Resolved Decisions

* **Typography — adopt brand typefaces.** Space Grotesk (display) + Inter (body),
  with optional Space Mono for numerics, loaded via `next/font`. Tracked as
  `DESIGN-009`; details in the [brand guide](../../brand#typography).
* **Storybook — yes, in `DESIGN-008`.** Storybook (and optional visual-regression)
  is part of the docs/governance phase, not deferred.
* **Gradient — documented in-app usage rules.** Brand accent only: logo, one hero
  moment per view, and playback emphasis; flat `primary` for default interactions.
  See §4.6 and the [brand guide](../../brand#gradient).

### Still open

* Exact type scale ratio and base size (tune during `DESIGN-009`).
* Whether visual-regression (e.g. Chromatic/Playwright snapshots) ships with
  Storybook or follows later.
