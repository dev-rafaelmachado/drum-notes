# Tasks — Drag-and-Drop Measure Reordering (EDIT-004)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Domain → Tests → State → UI**. There
is no new service or storage layer — reorder flows through the existing
editor-store `edit()` → IndexedDB autosave path. Each task is independently
testable and carries a one-line acceptance note. Never start from the UI.

## Domain (`packages/notation-engine`)

- [x] `moveMeasure(score, measureId, toIndex)` in `operations/measures.ts` — *splices the existing `Measure` (same `id`, same `notes`) to `toIndex`; clamps `toIndex` to `[0, length-1]`; same-position move returns an equivalent score; unknown `measureId` throws `MeasureNotFoundError`.*
- [x] Export `moveMeasure` from the package index next to `addMeasure` / `removeMeasure` / `duplicateMeasure` — *consumed by the editor store.*

## Tests (domain)

- [x] Unit tests for `moveMeasure` — *see [tests.md](tests.md). Covers: move forward, move backward, move to first, move to last, no-op self-move, out-of-range clamp, id + notes preserved, unknown id throws, other measures' order preserved.*

## State (Zustand — `features/editor/stores`)

- [x] `editor-store` gains `moveMeasure(measureId, toIndex)` wired through the existing `edit()` helper — *applies the domain op, sets the new score, and autosaves like every other edit.*
- [x] Store test for the action — *moving a measure updates `Score.measures` order and triggers a save; notes unchanged.*

## UI (`apps/web/src/features/editor`)

- [x] Drag handle in the measure header — *`MeasureDragHandle` (a `GripVertical` grip) rendered before the title via `MeasureView`'s new `dragHandle` slot; existing header actions (loop, playback, sync, duplicate, remove) remain clickable.*
- [x] Native HTML drag-and-drop wiring — *`useMeasureReorder` hook + transient `reorder-store`: `dragstart`/`dragover`/`drop` compute the target slot and dispatch `moveMeasure`; no new dependency. Handlers read state via `getState()` so the measure does not re-render on every `dragover`.*
- [x] Drop indicator between measures — *a violet bar in the gap where the measure will land; per-measure store selector keeps re-renders local; suppressed for a no-op drop; not colour-only (position carries the signal).*
- [x] Keyboard move controls — *`MeasureMoveButtons` "Move left"/"Move right" calling `moveMeasure(id, index∓1)`; first/last disabled; accessible labels (e.g. "Move measure 3 left").*
- [x] Accessibility pass — *move controls are keyboard-operable with accessible labels; the drag-only grip is `aria-hidden` with the buttons as the accessible path.*

## Undo / Redo (depends on EDIT-001)

- [ ] Confirm a reorder is a single, atomic, invertible entry in the EDIT-001 history — *undo restores the previous order, redo re-applies the move; no bespoke undo stack is added here. **Blocked on EDIT-001 (not yet implemented).** `moveMeasure` already flows through the shared `edit()` path, so it will be recorded like any other edit once history lands.*

## Validation

- [x] Verify the critical flow — *domain + store unit tests cover the reorder math and the autosaving store action; drag/keyboard interaction verified via type-check + build (pointer drag is not reliable under jsdom).*
- [x] Verify [acceptance criteria](spec.md#acceptance-criteria) — *type-check, lint, all 120 tests, and production build green (AC 5 completes once EDIT-001 lands).*
- [x] Sync docs — *[backlog.md](../../product/backlog.md) status set to Specified. domain.md has no operations catalogue to extend (it describes the model, which is unchanged — measures stay an ordered, id-keyed list). No ADR required (see [spec](spec.md#dependencies--decisions)).*
