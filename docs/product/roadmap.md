# Roadmap

This roadmap sequences the [vision pillars](vision.md#long-term-vision-pillars)
into delivery phases. Each phase builds on the canonical Score → Measure → Note
[domain model](../architecture/domain.md) — no phase introduces an alternative
score representation.

> **Current phase: Phase 0 — MVP (Score Editor).**

---

## Phases

| Phase | Name | Goal | Key features | Gating decisions |
|-------|------|------|--------------|------------------|
| **0** *(current)* | **MVP — Score Editor** | Create, edit, persist and export a drum score locally. | Project creation (BPM, time signature, subdivision); add/remove/duplicate measures; toggle notes per instrument; local autosave; export PDF + PNG. | [ADR-001 Zustand](../adr/001-zustand.md), [ADR-002 IndexedDB](../adr/002-indexeddb.md), [ADR-003 Score model](../adr/003-score-model.md) |
| **1** | **Playback** | Hear the transcribed score. | Tone.js playback of the score; tempo follows the score BPM; per-instrument sample mapping. | Tone.js Transport scheduling; sample-kit ADR. |
| **2** | **Audio Synchronization** | Align the score with the original recording. | Load a reference track; scrub score against audio; visual playhead. | Audio loading/format ADR. |
| **3** | **BPM Detection & Audio Analysis** | Assist transcription from the source recording. | Automatic tempo estimation; onset/transient hints. | Audio-analysis library ADR (required per tech-stack). |
| **4** | **Mobile** | Capture and review grooves away from the desk. | Responsive/native shell; touch-first editing. | Platform-specific app code only; domain stays platform-independent. |
| **5** | **Community Score Sharing** | Publish and discover scores. | Accounts; cloud sync; public score library. | Supabase backend + sync ADR; auth ADR. |

---

## Sequencing Principles

* **Domain stays stable.** New phases extend the domain model rather than
  forking it. The model must remain framework- and platform-agnostic so Phase 4
  (mobile) and Phase 5 (cloud) reuse it unchanged.
* **Each new architectural dependency requires an ADR** before implementation
  (see [tech-stack](../../.claude/tech-stack.md) — Tone.js, audio analysis,
  Supabase, monitoring are all explicitly ADR-gated).
* **Offline-first is preserved** through Phase 5: cloud sharing layers on top of
  local persistence, it does not replace it.

---

## Out of Scope for the MVP

Explicitly deferred to later phases (not abandoned): audio playback, audio
synchronization, BPM recognition, AI assistance, accounts/backend, score
sharing, and mobile apps. See the
[score-editor spec](../specs/score-editor/spec.md#out-of-scope) for the
authoritative MVP boundary.
