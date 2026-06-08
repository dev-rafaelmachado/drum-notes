# Tech Stack

## Overview

This document defines the approved technologies for the project.

AI agents should prefer these technologies unless an ADR explicitly approves alternatives.

---

# Frontend

Framework:

* Next.js

Language:

* TypeScript

UI:

* React

Styling:

* TailwindCSS

Component Library:

* shadcn/ui

Icons:

* Lucide React

---

# State Management

Primary:

* Zustand

Usage:

* Global editor state
* Project state
* User preferences

Do not introduce:

* Redux
* MobX
* Recoil

without an ADR.

---

# Forms

Preferred:

* React Hook Form

Validation:

* Zod

---

# Data Persistence

Current:

* IndexedDB

Libraries:

* idb

Future:

* Supabase

---

# Testing

Unit Tests:

* Vitest

Component Tests:

* React Testing Library

End-to-End:

* Playwright

---

# Audio

Playback:

* Tone.js

Audio Scheduling:

* Tone.js Transport

Audio Analysis:

* Future ADR required

---

# PDF Generation

Preferred:

* pdf-lib

Alternative:

* jsPDF

Requires ADR approval.

---

# Build System

Package Manager:

* pnpm

Monorepo:

* Turborepo

---

# Linting

* ESLint
* Prettier

---

# CI/CD

Source Control:

* GitHub

Automation:

* GitHub Actions

Deployment:

* Vercel

---

# Monitoring

Future:

* Sentry

Requires ADR approval.

---

# Package Usage Guidelines

Before adding a dependency:

1. Verify existing alternatives.
2. Prefer built-in APIs.
3. Prefer current stack.
4. Create ADR if introducing new architectural dependency.

Avoid dependency proliferation.

Every dependency must provide clear value.
