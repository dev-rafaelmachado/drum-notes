# AI Context

## Project

Name: Drum Notes

Description:

Drum Notes is a drum notation editor focused on simplicity and speed.

The application allows drummers to create, edit, save and export drum scores without the complexity of traditional music notation software.

The product prioritizes usability over complete musical notation support.

---

## Product Vision

Enable drummers to quickly transcribe songs while listening to music.

The application should feel lightweight, intuitive and focused on drum notation only.

The long-term vision includes:

* Playback engine
* Audio synchronization
* BPM detection
* Audio analysis
* Mobile support
* Community score sharing

---

## Target Users

Primary:

* Beginner drummers
* Intermediate drummers
* Drum students

Secondary:

* Drum teachers
* Content creators
* Professional musicians

---

## Core Principles

1. Simplicity over completeness.

2. Drum-focused experience.

3. Fast interactions.

4. Offline-first whenever possible.

5. Domain-driven design.

6. Features must solve real drummer problems.

---

Frontend:

* Next.js
* React
* TypeScript
* TailwindCSS
* shadcn/ui

State:

* Zustand

Storage:

* IndexedDB

Testing:

* Vitest
* React Testing Library

---

## Domain

The core domain consists of:

Score
└── Measure
└── Note

Everything in the application should revolve around this domain model.

The domain model is the source of truth.

UI, persistence, playback and exports must consume the domain model instead of implementing independent structures.

---

## Documentation Sources

Architecture:
docs/architecture/*

Product:
docs/product/*

Specifications:
docs/specs/*

ADRs:
docs/adr/*

---

## AI Instructions

Before implementing any feature:

1. Read the relevant specification.
2. Read architecture documentation.
3. Verify acceptance criteria.
4. Verify existing domain models.
5. Reuse existing abstractions whenever possible.

Never create parallel implementations of an existing concept.

Always prefer extending existing domain models.

When documentation and code disagree:

Documentation is the source of truth unless explicitly marked as outdated.
