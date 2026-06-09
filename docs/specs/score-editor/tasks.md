# Tasks — Score Editor (MVP)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Domain → Tests → Services → State →
UI → Export**. Each task is independently testable and carries a one-line
acceptance note. Never start from the UI.

## Domain (`packages/notation-engine`)

- [x] Define `Score` entity (id, title, bpm, timeSignature, subdivision, measures) — *fields match [domain.md](../../architecture/domain.md).*
- [x] Define `Measure` entity (id, notes) — *belongs to exactly one Score.*
- [x] Define `Note` entity (instrument, position, velocity) — *belongs to exactly one Measure.*
- [x] Define `Instrument` set (8 voices) — *exactly the 8 instruments in the spec.*
- [x] Implement add / remove / duplicate measure operations — *duplicate copies notes.*
- [x] Implement toggle-note operation — *rejects positions outside the subdivision.*
- [x] Implement subdivision validation — *invariant: position respects subdivision.*

## Tests (domain)

- [x] Unit tests for all domain operations and invariants — *behavior, not implementation; see [tests.md](tests.md). 24 tests.*

## Storage (`apps/web` — services)

- [x] Define `scores` object store (key = score.id) — *serialises the domain Score, no parallel shape.*
- [x] Implement save score — *writes current Score on each autosave trigger.*
- [x] Implement load / list / delete score — *reopens a saved score unchanged.*

## State (Zustand stores)

- [x] Editor store holding current Score and edit actions — *delegates rules to the domain.*
- [x] Project creation flow (create / configure score) — *sets BPM, time signature, subdivision.*
- [x] Wire autosave to edit actions — *fires on note change / remove / BPM / measure change.*

## UI (`apps/web/features`)

- [x] Grid component (`ScoreEditor` + `MeasureGrid`) — *renders the Score grid.*
- [x] Measure component — *renders one bar; add / remove / duplicate controls.*
- [x] Instrument row — *one row per instrument; cells toggle notes.*
- [x] Project creation UI (BPM / time signature / subdivision) — *creates a configured score.*

## Export (`apps/web/features/export`)

- [x] Export to PDF — *produces a PDF of the current Score (pdf-lib).*
- [x] Export to PNG — *produces a PNG of the current Score (canvas).*

## Validation

- [x] Integration test for the critical flow — *store: create → edit → autosave (mocked repo).*
- [x] Verify all [acceptance criteria](spec.md#acceptance-criteria) — *type-check, lint, 27 tests, production build all green.*
