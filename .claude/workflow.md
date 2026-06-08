# Workflow

## Development Philosophy

The project follows a Spec-Driven Development workflow.

Code should never be the first artifact created.

Every feature begins with a specification.

---

## Feature Lifecycle

Idea
↓
PRD
↓
Specification
↓
Tasks
↓
Implementation
↓
Testing
↓
Review
↓
Release

---

## Step 1 - Product Definition

Create or update:

docs/product/

Define:

* Problem
* Users
* Goals
* Success metrics

---

## Step 2 - Feature Specification

Create:

docs/specs/feature-name/

Required files:

spec.md
tasks.md
tests.md

---

## Step 3 - Architecture Validation

Before implementation:

Verify:

* Existing domain model
* Existing abstractions
* Existing services

Avoid introducing duplicate concepts.

---

## Step 4 - Task Breakdown

Each task should:

* Be independently executable
* Be independently testable
* Have clear acceptance criteria

Large tasks should be split.

---

## Step 5 - Implementation

Implementation order:

1. Domain
2. Tests
3. Services
4. State
5. UI

Never start from the UI.

---

## Step 6 - Validation

Verify:

* Acceptance criteria
* Existing tests
* New tests
* Documentation updates

---

## Step 7 - Documentation

If behavior changes:

Update:

* Spec
* Architecture
* ADRs

Documentation must evolve with code.

---

## AI Agent Rules

Before writing code:

1. Read context.md
2. Read coding-standards.md
3. Read workflow.md
4. Read relevant spec.md
5. Read related ADRs

Never implement undocumented features.

Never bypass acceptance criteria.

Never create architecture decisions without recording an ADR.

Always keep documentation synchronized with implementation.
