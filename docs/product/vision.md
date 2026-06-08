# Product Vision

## Summary

Drum Notes is a drum-notation editor focused on simplicity and speed. It lets
drummers create, edit, save and export drum scores without the complexity of
traditional music-notation software. The product deliberately prioritizes
usability over complete musical-notation support.

---

## Problem

Drummers who want to study a song today must choose between:

* Transcribing the song entirely by ear, with nothing written down.
* Using pen and paper, which is slow and hard to revise.
* Learning complex music-notation software built for full orchestral scores.

All three make quick, focused study slow and unintuitive. There is no
lightweight tool built specifically for the way a drummer thinks about a groove.

---

## Vision Statement

Enable drummers to quickly transcribe songs while listening to music.

The application should feel lightweight, intuitive and focused on drum notation
only — never a general-purpose notation editor.

---

## Target Users

### Primary

* Beginner drummers
* Intermediate drummers
* Drum students

### Secondary

* Drum teachers
* Content creators
* Professional musicians producing didactic material

---

## Product Principles

1. **Simplicity over completeness.** We do not chase full music-notation
   parity; we serve the drummer's real workflow.
2. **Drum-focused experience.** Every feature must make sense for a drum kit.
3. **Fast interactions.** Transcribing a groove should take seconds, not menus.
4. **Offline-first whenever possible.** The editor works without a network.
5. **Domain-driven design.** The Score → Measure → Note model is the single
   source of truth.
6. **Features must solve real drummer problems.** No feature ships just because
   it is technically possible.

---

## Long-Term Vision Pillars

The MVP is a score editor, but the product is designed to grow toward a
study-and-practice companion:

* **Playback engine** — hear the transcribed score (Tone.js).
* **Audio synchronization** — line the score up with the original track.
* **BPM detection** — infer tempo automatically from audio.
* **Audio analysis** — assist transcription by analysing the source recording.
* **Mobile support** — capture and review grooves away from the desk.
* **Community score sharing** — publish and discover scores.

Each pillar is sequenced in the [roadmap](roadmap.md) and gated by its own
architecture decision.

---

## What Success Looks Like

* A user can create a complete drum score from scratch.
* A user can export that score to PDF and PNG.
* A user can reopen a locally-saved project unchanged.
* Creating a simple score takes under five minutes.

See the [score-editor specification](../specs/score-editor/spec.md) for the
concrete MVP acceptance criteria, and the [glossary](glossary.md) for shared
vocabulary.
