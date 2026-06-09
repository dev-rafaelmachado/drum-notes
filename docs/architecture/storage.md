# Storage Architecture

Drum Notes is **offline-first**: the editor must work with no network. Local
persistence uses **IndexedDB** through the `idb` library. The decision is
recorded in [ADR-002](../adr/002-indexeddb.md).

Storage **consumes** the [domain model](domain.md) — it serialises Score /
Measure / Note, it does not define its own shape.

---

## Object Stores

The database holds the user's scores and any audio they upload.

| Store | Key | Value |
|-------|-----|-------|
| `scores` | `score.id` | The serialised Score (title, bpm, timeSignature, subdivision, measures → notes, optional audio reference). |
| `audio` | `audioReference.id` | The uploaded audio **blob** plus its mime type (see [ADR-006](../adr/006-audio-storage.md)). |

The `scores` value is a direct projection of the domain Score. There is no
secondary representation; loading reconstitutes the same model the editor uses.

The `audio` store holds the binary that the domain deliberately does **not**
carry: the Score keeps only an `AudioReference` (id, fileName, mimeType,
duration), and the bytes live here keyed by that reference `id`. The `audio`
store was added in DB version 2 as an additive upgrade (`scores` unchanged).
Deleting a score deletes its associated blob; replacing a score's audio deletes
the previous blob.

---

## Autosave

Persistence is automatic — the user never presses "Save". The current Score is
written on every meaningful change:

* on **project creation**
* on **adding / editing a note**
* on **removing a note**
* on **changing BPM**
* on **changing a measure** (add / remove / duplicate)
* on **attaching / detaching audio** (the Score's audio reference)

This guarantees the on-disk state always matches the editor state, satisfying
the "reopen a saved project unchanged" success criterion.

---

## Load / Reopen Flow

1. On open, read the Score by `id` from the `scores` store.
2. Deserialise into the domain model.
3. Hydrate the editor store with the Score.
4. The editor renders; subsequent edits autosave back to the same key.

---

## Offline-First Guarantees

* All reads and writes are local; no request blocks an edit.
* The app remains fully usable with no connectivity.
* Data survives reloads and browser restarts (IndexedDB is durable).

---

## Future: Cloud Sync

Phase 5 (community sharing) introduces **Supabase** as a sync target. The plan
preserves offline-first: local IndexedDB stays the working copy, and cloud sync
layers on top rather than replacing it. Introducing the backend and its sync
strategy will require its own ADR (see [roadmap](../product/roadmap.md)).
