# Tasks — Copy / Paste Measures (EDIT-003)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Domain → Tests → State → UI**. Each
task is independently testable.

## Domain (`packages/notation-engine`)

- [ ] `pasteMeasures(score, measures, atIndex)` in `operations/measures.ts` — *inserts new-id copies at `atIndex` (clamped to `[0, score.measures.length]`); notes shallow-copied; out-of-range notes dropped (`isValidPosition`); empty `measures` is a no-op.*
- [ ] Export `pasteMeasures` from the package index next to `duplicateMeasure`.

## Tests (domain)

- [ ] Unit tests for `pasteMeasures` in `operations/measures.test.ts` — *see [tests.md](tests.md).*

## State (Zustand — `features/editor/stores`)

- [ ] Add `selectedMeasureIds: ReadonlySet<string>`, `clipboard: readonly Measure[] | null`, `canPaste: boolean` to `EditorState`.
- [ ] `selectMeasure(measureId, shiftKey)` — *single-select replaces selection and sets anchor; shift-select extends range from anchor.*
- [ ] `clearSelection()` — *empties `selectedMeasureIds`; called by `loadScore`, `setCurrentScore`, `reset`.*
- [ ] `copySelectedMeasures()` — *copies selected measures in score order to `clipboard`; not an `edit()` call.*
- [ ] `pasteMeasures(atIndex?)` — *calls domain `pasteMeasures` via `edit()`; defaults to after the last selected measure or append.*
- [ ] Store tests — *copy stores clipboard without mutating score; paste inserts copies with new ids; paste is undoable; canPaste reflects clipboard.*

## UI (`apps/web/src/features/editor`)

- [ ] `useCopyPaste` hook — *`Ctrl/Cmd+C` copies when selection non-empty; `Ctrl/Cmd+V` pastes when `canPaste`; both suppressed when an editable element has focus.*
- [ ] `MeasureView` — *add `isSelected` + `onSelect` props; clicking the `h3` title calls `onSelect`; selected measure gets a green highlight ring.*
- [ ] `EditorMeasure` — *wire `isSelected` and `onSelect` from the editor store.*
- [ ] `ScoreEditor` — *mount `useCopyPaste`; pass copy/paste props to `EditorToolbar`.*
- [ ] `EditorToolbar` — *add Copy button (enabled when ≥ 1 measure selected) and Paste button (enabled when `canPaste`).*

## Validation

- [ ] Verify acceptance criteria — *lint, typecheck, all tests green.*
- [ ] Sync docs — *update backlog.md status to Specified.*
