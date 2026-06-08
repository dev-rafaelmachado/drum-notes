# Coding Standards

## General Principles

Code should be:

* Simple
* Readable
* Testable
* Modular
* Predictable

Avoid unnecessary abstractions.

Avoid premature optimization.

Favor explicit code over clever code.

---

## Language

All code must be written in English.

Use English for:

* Variables
* Functions
* Classes
* Interfaces
* Types
* Comments

---

## Naming

Variables:
camelCase

Functions:
camelCase

Types:
PascalCase

Interfaces:
PascalCase

Enums:
PascalCase

Constants:
UPPER_SNAKE_CASE

---

## TypeScript

Always prefer explicit types.

Avoid:

* any
* unknown when not necessary

Prefer:

* type
* discriminated unions
* readonly structures

Use strict mode.

---

## React

Prefer functional components.

Prefer composition over inheritance.

Keep components focused.

Extract reusable logic into hooks.

Avoid business logic inside UI components.

---

## State Management

Rules:

1. Domain logic must not depend on React.

2. Zustand stores must orchestrate state.

3. Domain models must remain framework agnostic.

4. UI components consume stores.

---

## Architecture

Preferred structure:

feature/
├── components/
├── hooks/
├── stores/
├── services/
├── types/

Avoid generic folders like:

* utils
* helpers
* common

unless a clear shared purpose exists.

---

## Testing

All domain logic must have unit tests.

Critical user flows require integration tests.

Tests must verify behavior, not implementation details.

---

## Imports

Order:

1. External libraries
2. Shared modules
3. Feature modules
4. Relative imports

Avoid deep relative imports.

Prefer path aliases.

---

## Comments

Comments should explain:

* Why

Not:

* What

Code should already explain what it does.

---

## Performance

Optimize only after identifying a bottleneck.

Do not introduce complexity for hypothetical performance gains.

---

## Accessibility

Interactive elements must:

* Support keyboard navigation
* Include accessible labels
* Respect semantic HTML

Accessibility is not optional.
