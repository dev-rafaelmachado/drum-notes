# ADR-012 — Design Tokens & the Drum Notes Design System

## Status

**Proposed** — scoped in the [Design System PRD](../specs/design-system/prd.md);
not yet implemented (backlog: `DESIGN-00x`).

## Context

Drum Notes has a defined **brand** ([docs/brand](../brand)) — the
`#FFB020 → #FF4D2E` gradient, ink/slate neutrals, a logo and a voice — but the
application UI is the **stock shadcn/ui "new-york" theme on a flat `neutral`
base**. Colours are hardcoded across components (an inventory on 2026-06-22 found
~80 raw palette classes across 18 files), the shared `packages/ui` design-system
package is an empty stub, and the PDF/PNG export canvas paints **literal hex
values**, so screen and export can drift.

We want the app, the marketing brand, and the exports to look like **one
product**, and we want styling to be **token-driven and governable** rather than
ad-hoc. The [architecture rules](../../.claude/architecture.md) say `packages/ui`
owns the design system and must hold no business logic; the
[tech-stack](../../.claude/tech-stack.md) keeps TailwindCSS + shadcn/ui + Lucide.

## Decision

Adopt a **token-driven design system** with these decisions:

1. **Semantic design tokens are the single source of truth for styling.** A
   three-layer model: **primitive** (brand) → **semantic** (role-based) →
   **component/domain** (editor grid roles). Components reference semantic tokens,
   never raw palette values.

2. **One canonical token definition feeds two consumers.** Tokens are defined once
   (framework-agnostic, e.g. `packages/ui/src/tokens.ts`) and drive both:
   * Tailwind v4 `@theme` / CSS variables in `globals.css` (DOM components), and
   * the export canvas renderer (which needs literal colours).
   This mirrors the domain's single-source-of-truth principle
   ([ADR-003](003-score-model.md)) and prevents screen/export drift.

3. **Re-skin, don't replace.** Keep shadcn/Radix primitives and Tailwind; restyle
   them through tokens. No new component library, no UX redesign.

4. **Promote shared primitives to `packages/ui`.** `button`, `input`, `label`,
   `select` (and future shared components) move out of `apps/web` into the
   design-system package, token-driven, so web/mobile/desktop reuse one set.

5. **Brand palette mapping.** `primary = strike (#FF4D2E)`, `accent = heat
   (#FFB020)`, `ring = strike @ alpha`, editor `playhead/active = strike/heat`
   (replacing today's blue); `destructive` becomes a **distinct crimson** so it is
   not confused with the now-warm `primary`.

6. **Dark mode is first-class**, built from the same semantic tokens.

7. **Governance.** A lint rule forbids raw color classes (`neutral-*`, `blue-*`,
   …) in feature code; usage is documented in the design-system guide.

8. **Incremental migration.** Phase A wires tokens at **visual parity** (neutral
   mapping), then brand colour, components, editor, export, dark mode, and docs
   land in slices (see the PRD plan). No big-bang rewrite.

## Consequences

* Retheming becomes a token edit, not a find-replace across components.
* Screen and exported scores stay on-brand because they share one token source.
* A small upfront cost (token plumbing, parity verification) and an ongoing rule
  (no raw colours) that contributors must follow.
* `packages/ui` gains real content and a build surface; its tokens stay
  framework-agnostic so they port to mobile (Phase 4) and desktop.
* This ADR will move to **Accepted** when `DESIGN-001` (token foundation) lands,
  and may be amended as later phases refine the palette or add typography tokens.

## Alternatives considered

* **Big-bang restyle** (rewrite all components at once) — high regression risk,
  unshippable in slices; rejected.
* **New component library** (hand-rolled or a different kit) — large effort, loses
  shadcn velocity, no brand benefit over re-skinning; rejected.
* **CSS-variables only, no shared TS token module** — leaves the export canvas
  unable to read tokens, perpetuating screen/export drift; rejected.
* **Keep the neutral shadcn theme** — fastest, but the product stays generic and
  off-brand; rejected (the whole point of the brand work).
