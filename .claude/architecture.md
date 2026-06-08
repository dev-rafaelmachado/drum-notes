# Architecture Rules

## Purpose

This document defines the architectural constraints of the project.

All contributors and AI agents must follow these rules.

These rules take precedence over implementation convenience.

---

# Architecture Style

The project follows a:

* Domain-Driven Design inspired architecture
* Monorepo architecture
* Feature-oriented frontend architecture
* Offline-first philosophy

---

# Dependency Direction

Allowed:

UI
↓
Application
↓
Domain

Not allowed:

Domain
↓
React

Domain
↓
Browser APIs

Domain
↓
Storage

Domain
↓
UI

The domain layer must remain framework agnostic.

---

# Source of Truth

The domain model is the source of truth.

All features must consume:

Score
Measure
Note

No feature may introduce alternative score representations.

---

# Package Responsibilities

packages/core

Responsibilities:

* Shared types
* Shared utilities
* Shared constants

Must not contain:

* React
* Browser APIs

---

packages/notation-engine

Responsibilities:

* Domain models
* Score manipulation
* Validation
* Playback preparation
* Export preparation

Must not contain:

* React
* UI logic

---

packages/ui

Responsibilities:

* Shared components
* Design system

Must not contain:

* Business logic
* Domain rules

---

apps/web

Responsibilities:

* User interface
* User interactions
* State orchestration

Must not contain:

* Core domain logic

---

# State Management

Rules:

Business rules belong to the domain.

Stores orchestrate state.

Components render state.

Never place business rules inside React components.

---

# Feature Development

Every feature must:

1. Have a specification.
2. Have acceptance criteria.
3. Reuse existing domain models.
4. Include tests.

No implementation should start without a specification.

---

# Documentation

Architecture changes require:

* ADR update
* Architecture documentation update

Code and documentation must remain synchronized.

---

# Future Compatibility

The architecture must support:

* Web
* Mobile
* Desktop

Domain code must remain platform-independent.

Platform-specific code belongs inside applications.

---

# AI Agent Directives

Before creating a new abstraction:

1. Search existing abstractions.
2. Verify domain compatibility.
3. Verify existing ADRs.

Prefer extending existing models over creating new ones.

Avoid duplicate concepts.

Favor consistency over innovation.
