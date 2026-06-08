# Glossary

Shared vocabulary for the project. Domain terms map directly to the canonical
[domain model](../architecture/domain.md); drum terms ensure non-drummer
contributors share the same language.

---

## Domain Terms

| Term | Definition |
|------|------------|
| **Score** | The top-level document a user creates and edits. Owns a title, BPM, time signature, subdivision and an ordered list of measures. The single source of truth for everything the app renders, persists, plays or exports. |
| **Measure** | One bar of the score. Owns an ordered set of notes. Belongs to exactly one Score. |
| **Note** | A single hit: a given instrument struck at a given position with a given velocity. Belongs to exactly one Measure. |
| **Instrument** | One voice of the drum kit a note can be assigned to. The MVP supports eight (see drum terms below). |
| **Position** | The slot within a measure where a note falls. Must respect the score's configured subdivision. |
| **Velocity** | How hard a note is struck (e.g. accent vs. ghost note). Reserved for dynamics and future playback. |
| **Subdivision** | The rhythmic grid resolution of a measure (e.g. 8th notes, 16th notes). Defines the valid positions a note may occupy. |
| **Time Signature** | The meter of the score (e.g. 4/4). Determines how many beats a measure contains. |
| **BPM** | Beats per minute — the score's tempo. Drives future playback and audio sync. |

---

## Drum Terms

The eight instruments supported in the MVP, top to bottom on a typical kit:

| Term | Definition |
|------|------------|
| **Hi-Hat** | Pair of cymbals played with a pedal or sticks; the most common timekeeping voice. |
| **Ride** | Large cymbal used for sustained timekeeping patterns. |
| **Crash** | Cymbal used for accents and section transitions. |
| **Snare** | The sharp, central drum; typically the backbeat. |
| **Tom 1** | High-pitched rack tom, used in fills. |
| **Tom 2** | Mid-pitched rack tom, used in fills. |
| **Floor Tom** | Low-pitched standing tom, used in fills. |
| **Kick** | Bass drum played with a foot pedal; the low-end pulse. |

---

## Process Terms

| Term | Definition |
|------|------------|
| **Spec-Driven Development** | The project workflow: no code before a specification exists. See [workflow](../../.claude/workflow.md). |
| **ADR** | Architecture Decision Record — a dated, immutable note capturing one architectural decision and its rationale. See [docs/adr](../adr). |
