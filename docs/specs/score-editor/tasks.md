# Tasks — Score Editor (MVP)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Domain → Tests → Services → State →
UI → Export**. Each task is independently testable and carries a one-line
acceptance note. Never start from the UI.

## Domain (`packages/notation-engine`)

- [ ] Define `Score` entity (id, title, bpm, timeSignature, subdivision, measures) — *fields match [domain.md](../../architecture/domain.md).*
- [ ] Define `Measure` entity (id, notes) — *belongs to exactly one Score.*
- [ ] Define `Note` entity (instrument, position, velocity) — *belongs to exactly one Measure.*
- [ ] Define `Instrument` set (8 voices) — *exactly the 8 instruments in the spec.*
- [ ] Implement add / remove / duplicate measure operations — *duplicate copies notes.*
- [ ] Implement toggle-note operation — *no-op or rejects positions outside the subdivision.*
- [ ] Implement subdivision validation — *invariant: position respects subdivision.*

## Tests (domain)

- [ ] Unit tests for all domain operations and invariants — *behavior, not implementation; see [tests.md](tests.md).*

## Storage (`apps/web` — services)

- [ ] Define `scores` object store (key = score.id) — *serialises the domain Score, no parallel shape.*
- [ ] Implement save score — *writes current Score on each autosave trigger.*
- [ ] Implement load score — *reopens a saved score unchanged.*

## State (Zustand stores)

- [ ] Editor store holding current Score and edit actions — *delegates rules to the domain.*
- [ ] Project store (create / configure score) — *sets BPM, time signature, subdivision.*
- [ ] Wire autosave to edit actions — *fires on create / note change / remove / BPM / measure change.*

## UI (`apps/web/features`)

- [ ] Grid component — *renders the Score grid.*
- [ ] Measure component — *renders one bar; add / remove / duplicate controls.*
- [ ] Instrument row — *one row per instrument; cells toggle notes.*
- [ ] Project creation UI (BPM / time signature / subdivision) — *creates a configured score.*

## Export (`apps/web/features/export`)

- [ ] Export to PDF — *produces a PDF of the current Score.*
- [ ] Export to PNG — *produces a PNG of the current Score.*

## Validation

- [ ] Integration tests for critical flows — *create → edit → autosave → reopen → export.*
- [ ] Verify all [acceptance criteria](spec.md#acceptance-criteria) pass.
