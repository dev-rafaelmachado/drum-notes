# Domain Model

The domain model is the **single source of truth** for the application. UI,
persistence, playback and export all consume it; none of them may define an
independent score structure. This document is the canonical description of the
model; the decision behind it is recorded in
[ADR-003](../adr/003-score-model.md).

---

## Structure

```
Score
 └── Measure (ordered)
      └── Note
```

A **Score** contains an ordered list of **Measures**; each Measure contains a
set of **Notes**; each Note targets one **Instrument** at one **Position**.

---

## Entities

### Score

The top-level document.

| Field | Description |
|-------|-------------|
| `id` | Unique identifier. |
| `title` | Human-readable name. |
| `bpm` | Tempo in beats per minute. |
| `timeSignature` | Meter (e.g. `4/4`). |
| `subdivision` | Rhythmic grid resolution (e.g. 8th, 16th). Defines valid note positions. |
| `measures` | Ordered list of Measures. |

### Measure

One bar of the score.

| Field | Description |
|-------|-------------|
| `id` | Unique identifier. |
| `notes` | The notes contained in this measure. |

### Note

A single hit.

| Field | Description |
|-------|-------------|
| `instrument` | Which kit voice is struck. |
| `position` | Slot within the measure; must respect the score's subdivision. |
| `velocity` | How hard the note is struck (dynamics / future playback). |

### Instrument

The eight kit voices supported in the MVP:

`hiHat` · `ride` · `crash` · `snare` · `tom1` · `tom2` · `floorTom` · `kick`

Definitions for each are in the [glossary](../product/glossary.md#drum-terms).

---

## Invariants

These rules must always hold. They belong to the domain layer and are enforced
there — never in UI components.

1. **A Note belongs to exactly one Measure.**
2. **A Measure belongs to exactly one Score.**
3. **A Note's `position` must respect the Score's configured `subdivision`.**
   Positions outside the grid are invalid.
4. **There is exactly one score representation.** No feature may introduce a
   parallel or derived structure to stand in for Score / Measure / Note.
5. **The domain is framework-agnostic.** It must not import React, Browser APIs,
   storage, or UI code.

---

## Consumers

Every consumer reads from and writes to this model:

* **UI** ([frontend.md](frontend.md)) renders the model and dispatches edits.
* **Persistence** ([storage.md](storage.md)) serialises the model to IndexedDB.
* **Playback** (Phase 1) prepares Tone.js scheduling from the model.
* **Export** produces PDF/PNG from the model.

Because all consumers share one model, a change to the domain propagates
consistently — which is exactly why no alternative representation is permitted.

---

## Extending the Model

Prefer **extending** existing entities over creating new ones. Before adding a
concept, verify it cannot be expressed by Score / Measure / Note / Instrument.
Any structural change to the model requires updating this document and recording
an ADR.
