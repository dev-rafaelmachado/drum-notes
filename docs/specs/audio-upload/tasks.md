# Tasks — Audio Upload (AUDIO-001)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Domain → Tests → Storage → State →
UI**. Each task is independently testable and carries a one-line acceptance note.
Never start from the UI.

## Domain (`packages/notation-engine`)

- [x] Define `AudioReference` type (`id`, `fileName`, `mimeType`, `duration`) — *plain metadata; no Browser APIs, no blob.*
- [x] Add optional `audio?: AudioReference` to `Score` — *non-breaking extension; matches [domain.md](../../architecture/domain.md).*
- [x] Define supported audio MIME types constant (MP3, WAV) — *single source for the accepted formats.*
- [x] Implement `attachAudio` / `detachAudio` operations on `Score` — *return an updated Score; attaching replaces any existing reference.*
- [x] Export new types/operations from the package index — *consumed by storage, state and UI.*

## Tests (domain)

- [x] Unit tests for `attachAudio` / `detachAudio` and `AudioReference` invariants — *behavior, not implementation; see [tests.md](tests.md).*

## Storage (`apps/web` — services)

- [x] Bump IndexedDB `DB_VERSION` 1 → 2 and add an `audio` object store (key = reference `id`) — *upgrade is additive; existing `scores` untouched.*
- [x] Implement `saveAudioBlob` / `loadAudioBlob` / `deleteAudioBlob` in an `audio-repository` — *blob persists and reloads unchanged.*
- [x] Delete the audio blob when its project is deleted — *no orphaned blobs after `deleteScore`.*
- [x] Persist the `Score.audio` reference through existing autosave — *reference rides along in the `scores` store.*

## State (Zustand — `features/audio/stores`)

- [x] `audio-store` holding upload, the active `AudioReference`, and transport state (status, position, duration, volume) — *delegates the Score change to the domain.*
- [x] Upload action: validate type → store blob → `attachAudio` on the Score → autosave — *rejects unsupported types.*
- [x] Transport actions: play / pause / stop / seek / setVolume — *orchestrate the Tone.js player; hold no business rules.*
- [x] Hydrate audio on score open: read reference, load blob, prepare the player — *reopened project has its track ready.*

## Playback service (`features/audio/services`)

- [x] Tone.js player wrapper (`audio-player`): load blob (object URL), play, pause, stop, seek, setVolume — *see [ADR-005](../../adr/005-audio-playback.md).*
- [x] Position reporting loop feeding the store — *position updates continuously during playback and reflects seeks.*
- [x] Dispose player and revoke the object URL on teardown — *no leaked nodes or URLs between tracks.*

## UI (`apps/web/src/features/audio/components`)

- [x] `AudioUploader` — file input limited to MP3/WAV; shows rejection message — *uploads a supported file; rejects others.*
- [x] `TransportControls` — play / pause / stop / seek buttons and scrubber — *all controls operate the audio.*
- [x] `VolumeControl` — slider bound to `setVolume` — *changes apply immediately during playback.*
- [x] `PositionDisplay` — current position / total duration — *updates during playback.*
- [x] Mount the audio panel in the editor — *available alongside the score grid.*
- [x] Accessibility pass — *keyboard operable, labelled controls, semantic HTML.*

## Validation

- [x] Integration test for the critical flow — *store: upload → attach → autosave → reopen (mocked repos).*
- [x] Verify all [acceptance criteria](spec.md#acceptance-criteria) — *type-check, lint, tests and production build green.*
- [x] Sync docs — *[domain.md](../../architecture/domain.md), [storage.md](../../architecture/storage.md), [roadmap.md](../../product/roadmap.md), [backlog.md](../../product/backlog.md) updated.*
