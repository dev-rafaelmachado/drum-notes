# Tasks — Audio Upload (AUDIO-001)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Domain → Tests → Storage → State →
UI**. Each task is independently testable and carries a one-line acceptance note.
Never start from the UI.

## Domain (`packages/notation-engine`)

- [ ] Define `AudioReference` type (`id`, `fileName`, `mimeType`, `duration`) — *plain metadata; no Browser APIs, no blob.*
- [ ] Add optional `audio?: AudioReference` to `Score` — *non-breaking extension; matches [domain.md](../../architecture/domain.md).*
- [ ] Define supported audio MIME types constant (MP3, WAV) — *single source for the accepted formats.*
- [ ] Implement `attachAudio` / `detachAudio` operations on `Score` — *return an updated Score; attaching replaces any existing reference.*
- [ ] Export new types/operations from the package index — *consumed by storage, state and UI.*

## Tests (domain)

- [ ] Unit tests for `attachAudio` / `detachAudio` and `AudioReference` invariants — *behavior, not implementation; see [tests.md](tests.md).*

## Storage (`apps/web` — services)

- [ ] Bump IndexedDB `DB_VERSION` 1 → 2 and add an `audio` object store (key = reference `id`) — *upgrade is additive; existing `scores` untouched.*
- [ ] Implement `saveAudioBlob` / `loadAudioBlob` / `deleteAudioBlob` in an `audio-repository` — *blob persists and reloads unchanged.*
- [ ] Delete the audio blob when its project is deleted — *no orphaned blobs after `deleteScore`.*
- [ ] Persist the `Score.audio` reference through existing autosave — *reference rides along in the `scores` store.*

## State (Zustand — `features/audio/stores`)

- [ ] `audio-store` holding upload, the active `AudioReference`, and transport state (status, position, duration, volume) — *delegates the Score change to the domain.*
- [ ] Upload action: validate type → store blob → `attachAudio` on the Score → autosave — *rejects unsupported types.*
- [ ] Transport actions: play / pause / stop / seek / setVolume — *orchestrate the Tone.js player; hold no business rules.*
- [ ] Hydrate audio on score open: read reference, load blob, prepare the player — *reopened project has its track ready.*

## Playback service (`features/audio/services`)

- [ ] Tone.js player wrapper (`audio-player`): load blob (object URL), play, pause, stop, seek, setVolume — *see [ADR-005](../../adr/005-audio-playback.md).*
- [ ] Position reporting loop feeding the store — *position updates continuously during playback and reflects seeks.*
- [ ] Dispose player and revoke the object URL on teardown — *no leaked nodes or URLs between tracks.*

## UI (`apps/web/src/features/audio/components`)

- [ ] `AudioUploader` — file input limited to MP3/WAV; shows rejection message — *uploads a supported file; rejects others.*
- [ ] `TransportControls` — play / pause / stop / seek buttons and scrubber — *all controls operate the audio.*
- [ ] `VolumeControl` — slider bound to `setVolume` — *changes apply immediately during playback.*
- [ ] `PositionDisplay` — current position / total duration — *updates during playback.*
- [ ] Mount the audio panel in the editor — *available alongside the score grid.*
- [ ] Accessibility pass — *keyboard operable, labelled controls, semantic HTML.*

## Validation

- [ ] Integration test for the critical flow — *store: upload → attach → autosave → reopen (mocked repos).*
- [ ] Verify all [acceptance criteria](spec.md#acceptance-criteria) — *type-check, lint, tests and production build green.*
- [ ] Sync docs — *[domain.md](../../architecture/domain.md), [storage.md](../../architecture/storage.md), [roadmap.md](../../product/roadmap.md), [backlog.md](../../product/backlog.md) updated.*
