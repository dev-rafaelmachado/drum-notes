# Tasks — Measure Timestamp Projection (AUDIO-006)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Domain → Tests → State → UI**.
Each task is independently testable and carries a one-line acceptance note.
Never start from the UI.

## Domain (`packages/notation-engine`)

- [x] `projectMeasureTimestamps(score, anchorMeasureId, anchorStart)` in the `sync` module — *returns a SyncMap with projected `[start, end)` windows for all measures at or after the anchor; uses `beatsPerMeasure` and `secondsPerBeat` for timing.*
- [x] Export `projectMeasureTimestamps` from the package index — *consumed by the sync store.*

## Tests (domain)

- [x] Unit tests for `projectMeasureTimestamps` — *see [tests.md](tests.md). Covers: forward projection, duration math, anchor preservation, pre-anchor measures untouched, edge cases (single measure, anchor at start, anchor at end).*

## State (Zustand — `features/sync/stores`)

- [x] `sync-store` gains `anchor: { measureId: string; start: number } | null` state and `projectFromAnchor(score, anchorMeasureId, anchorStart, orderedMeasureIds)` action — *calls domain projection, persists the resulting SyncMap, stores the anchor for regeneration.*
- [x] `sync-store` gains `regenerate(score, orderedMeasureIds)` action — *re-runs projection from the stored anchor; no-op if no anchor.*
- [x] `sync-store` `hydrate` loads the stored anchor alongside the SyncMap — *anchor survives page reload for regeneration.*

## Storage (`apps/web` — services)

- [x] Persist anchor data in the `sync` IndexedDB store alongside the SyncMap — *anchor is saved and loaded with the map; no new store needed.*

## UI (`apps/web/src/features/sync` + editor)

- [x] Per-measure "Set as anchor" action: when the user sets a measure's timestamp, also project forward — *combines the existing mark-at-position flow with projection; UX remains familiar.*
- [x] "Regenerate" button in the toolbar (shown when an anchor exists) — *re-projects from the stored anchor and persists.*
- [x] Wire anchor indicator into `MeasureSyncControls` — *the anchor measure is visually distinguished (e.g. anchor icon) so the user knows which measure drives projection.*
- [x] Accessibility pass — *anchor and regenerate controls are keyboard-operable with accessible labels.*

## Validation

- [x] Integration test for the critical flow — *set anchor → projection → SyncMap contains correct entries → `activeMeasureAt` resolves projected measures → seek works.*
- [x] Verify all [acceptance criteria](spec.md#acceptance-criteria) — *type-check, lint, tests and production build green.*
- [x] Sync docs — *[domain.md](../../architecture/domain.md), [roadmap.md](../../product/roadmap.md), [backlog.md](../../product/backlog.md) updated.*
