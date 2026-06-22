# Tasks — Drag-and-Drop Measure Reordering (EDIT-004)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Domain → Tests → State → UI**. There
is no new service or storage layer — reorder flows through the existing
editor-store `edit()` → IndexedDB autosave path. Each task is independently
testable and carries a one-line acceptance note. Never start from the UI.

## Domain (`packages/notation-engine`)

- [ ] `moveMeasure(score, measureId, toIndex)` in `operations/measures.ts` — *splices the existing `Measure` (same `id`, same `notes`) to `toIndex`; clamps `toIndex` to `[0, length-1]`; same-position move returns an equivalent score; unknown `measureId` throws `MeasureNotFoundError`.*
- [ ] Export `moveMeasure` from the package index next to `addMeasure` / `removeMeasure` / `duplicateMeasure` — *consumed by the editor store.*

## Tests (domain)

- [ ] Unit tests for `moveMeasure` — *see [tests.md](tests.md). Covers: move forward, move backward, move to first, move to last, no-op self-move, out-of-range clamp, id + notes preserved, unknown id throws, other measures' order preserved.*

## State (Zustand — `features/editor/stores`)

- [ ] `editor-store` gains `moveMeasure(measureId, toIndex)` wired through the existing `edit()` helper — *applies the domain op, sets the new score, and autosaves like every other edit.*
- [ ] Store test for the action — *moving a measure updates `Score.measures` order and triggers a save; notes unchanged.*

## UI (`apps/web/src/features/editor/components`)

- [ ] Drag handle in the measure header — *a dedicated grabbable control in `MeasureView`/`EditorMeasure`; existing header actions (loop, playback, sync, duplicate, remove) remain clickable.*
- [ ] Native HTML drag-and-drop wiring — *`dragstart`/`dragover`/`drop` compute the target index and dispatch `moveMeasure`; no new dependency.*
- [ ] Drop indicator between measures — *a placeholder/line marks the landing gap, updates as the pointer moves, and is not colour-only.*
- [ ] Keyboard move controls — *per-header "Move left"/"Move right" buttons calling `moveMeasure(id, index∓1)`; first/last disabled; accessible labels (e.g. "Move measure 3 left").*
- [ ] Accessibility pass — *handle and move controls are keyboard-operable with accessible labels; drop target communicated non-visually.*

## Undo / Redo (depends on EDIT-001)

- [ ] Confirm a reorder is a single, atomic, invertible entry in the EDIT-001 history — *undo restores the previous order, redo re-applies the move; no bespoke undo stack is added here. **Blocked on EDIT-001.***

## Validation

- [ ] Integration test for the critical flow — *drag/keyboard move reorders the rendered measures; numbering updates; notes preserved (mocked/in-memory store).*
- [ ] Verify all [acceptance criteria](spec.md#acceptance-criteria) — *type-check, lint, tests and production build green (AC 5 once EDIT-001 lands).*
- [ ] Sync docs — *[backlog.md](../../product/backlog.md) status updated; [domain.md](../../architecture/domain.md) notes `moveMeasure`; [roadmap.md](../../product/roadmap.md) if the editing milestone moves. No ADR required (see [spec](spec.md#dependencies--decisions)).*
