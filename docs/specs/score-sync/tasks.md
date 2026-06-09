# Tasks — Score Synchronization (AUDIO-003)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Domain → Tests → Storage → State →
UI**. Each task is independently testable and carries a one-line acceptance note.
Never start from the UI.

## Domain (`packages/notation-engine`)

- [x] Define `MeasureTimestamp` (`measureId`, `start`, `end`) and `SyncMap` (`scoreId`, `entries`) in a `sync` module — *references measure ids only; no notation change, no Browser APIs.*
- [x] `createSyncMap` / `setMeasureTimestamp` / `removeMeasureTimestamp` — *set replaces an existing entry; entries kept ordered by `start`.*
- [x] Validate timestamps (`start >= 0`, `start < end`) with an `InvalidTimestampError` — *invalid ranges are rejected.*
- [x] `activeMeasureAt(map, seconds)` and `measureStart(map, measureId)` — *pure resolution: returns the measure whose `[start, end)` contains the time; `start` for seek.*
- [x] Export the new types/operations from the package index — *consumed by storage, state and UI.*

## Tests (domain)

- [x] Unit tests for set/replace/remove, timestamp validation, and `activeMeasureAt` boundaries — *behavior, not implementation; see [tests.md](tests.md).*

## Storage (`apps/web` — services)

- [x] Bump IndexedDB `DB_VERSION` 2 → 3 and add a `sync` object store (key = `scoreId`) — *additive upgrade; `scores` and `audio` untouched.*
- [x] `sync-repository`: `saveSyncMap` / `loadSyncMap` / `deleteSyncMap` — *the map persists and reloads unchanged, separate from notation.*
- [x] Delete the sync map when its project is deleted — *no orphaned sync data after `deleteScore`.*

## State (Zustand — `features/sync/stores`)

- [x] `sync-store` holding the current `SyncMap`, with `hydrate(scoreId)`, `setMeasureTimestamp`, `removeMeasureTimestamp` — *edits autosave to the `sync` store; delegates rules to the domain.*
- [x] Active-measure derivation from the audio player's position — *selector/hook combining `audio-store` position with `activeMeasureAt`.*
- [x] Seek-to-measure action — *resolves `measureStart` and calls the audio store's `seek` ([audio-upload](../audio-upload/spec.md)).*

## UI (`apps/web/src/features/sync` + editor)

- [x] Active-measure highlight on `MeasureView` — *`isActive` styling conveyed beyond colour alone.*
- [x] Auto-scroll effect — *active measure is scrolled into view as it changes.*
- [x] Per-measure sync controls (shown when a track is loaded): set start at current position, jump to measure, clear — *associate, seek-to-measure, and remove a mapping.*
- [x] Wire the active measure id and controls through `ScoreEditor` — *highlight, scroll and seek run during playback.*
- [x] Accessibility pass — *keyboard-operable controls; active measure announced, not colour-only.*

## Validation

- [x] Integration test for the critical flow — *store: set timestamp → autosave → `activeMeasureAt` yields the id; seek-to-measure calls audio `seek` (mocked repos/stores).*
- [x] Verify all [acceptance criteria](spec.md#acceptance-criteria) — *type-check, lint, tests and production build green.*
- [x] Sync docs — *[domain.md](../../architecture/domain.md), [storage.md](../../architecture/storage.md), [roadmap.md](../../product/roadmap.md), [backlog.md](../../product/backlog.md) updated.*
