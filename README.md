<div align="center">

<img src="docs/brand/banner.svg" alt="Drum Notes — transcribe grooves at the speed of thought" width="760" />

<br/>

**A drum-notation editor focused on simplicity and speed.**
Create, edit, save and export drum scores — fully offline, no music-theory degree required.

<br/>

[![Status](https://img.shields.io/badge/status-alpha-FF4D2E?style=flat-square)](docs/product/roadmap.md)
[![License](https://img.shields.io/badge/license-MIT-0B0B0F?style=flat-square)](LICENSE)
[![Offline first](https://img.shields.io/badge/offline-first-22C55E?style=flat-square)](docs/architecture/storage.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-FFB020?style=flat-square)](#-contributing)

[**Vision**](docs/product/vision.md) · [**Roadmap**](docs/product/roadmap.md) · [**Architecture**](docs/architecture/overview.md) · [**Docs**](#-documentation) · [**Brand**](docs/brand)

</div>

---

## ✦ Why Drum Notes?

Traditional notation software is built for orchestras, not for the drummer trying
to capture a groove before it slips away. **Drum Notes** strips it down to what
matters: a fast grid, eight kit voices, and a score that saves itself.

> 🥁 Hear a fill, grab it. No menus, no staff-paper ceremony, no internet.

<br/>

## ⚡ Features

- **🎛️ Grid editor** — toggle hits on a step grid across the 8 standard kit voices (hi-hat, ride, crash, snare, tom 1, tom 2, floor tom, kick).
- **🎼 Tempo & meter** — set BPM, time signature and subdivision; the grid adapts.
- **🧱 Measures** — add, duplicate and remove bars to build a song fast.
- **💾 Offline-first autosave** — every edit persists locally to IndexedDB. Close the tab, come back, it's there.
- **▶️ Playback & metronome** — hear the score and keep time, powered by Tone.js.
- **🎧 Reference audio + sync** — attach a track and map measures to timestamps to transcribe along.
- **📄 Export** — render clean **PDF** and **PNG** scores to print or share.

<br/>

## 🛠️ Built With

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-1B1B22?style=for-the-badge)
![Tone.js](https://img.shields.io/badge/Tone.js-1B1B22?style=for-the-badge)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

A pnpm + Turborepo monorepo. The domain is **framework-agnostic** so it can ride
to web, mobile and desktop unchanged.

<br/>

## 🚀 Getting Started

**Prerequisites:** Node **20+** (a `.nvmrc` pins `22.17.0`) and **pnpm** (via `corepack`).

```bash
nvm use            # picks up .nvmrc
corepack enable    # makes pnpm available at the pinned version
pnpm install
pnpm dev           # runs the web app with Turbopack
```

Then open **http://localhost:3000**.

### Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Run the web app (`next dev --turbopack`). |
| `pnpm build` | Build all packages and the app via Turborepo. |
| `pnpm type-check` | Type-check every workspace. |
| `pnpm test` | Run Vitest across workspaces. |
| `pnpm lint` | Lint the whole repo (ESLint flat config). |
| `pnpm format` | Format with Prettier. |

<br/>

## 🗂️ Project Structure

```
drum-notes/
├─ apps/
│  └─ web/                 # Next.js app — UI + state orchestration
├─ packages/
│  ├─ core/                # shared types, utilities, constants (framework-agnostic)
│  ├─ notation-engine/     # the canonical domain: Score → Measure → Note
│  └─ ui/                  # shared components / design system
├─ docs/
│  ├─ product/             # vision · roadmap · glossary
│  ├─ architecture/        # overview · domain · frontend · storage
│  ├─ adr/                 # architecture decision records
│  ├─ specs/               # feature specifications
│  └─ brand/               # logo, banner & brand guide
└─ .claude/                # authoritative engineering rules
```

The **`notation-engine`** is the heart: one canonical `Score → Measure → Note`
model that the UI, persistence, playback and export all consume — never a
parallel representation. See [domain](docs/architecture/domain.md) and
[ADR-003](docs/adr/003-score-model.md).

<br/>

## 🗺️ Roadmap

- [x] Score editor — grid, instruments, measures, tempo & meter
- [x] Offline autosave (IndexedDB)
- [x] PDF / PNG export
- [x] Metronome & score playback (Tone.js)
- [x] Reference audio upload & measure sync
- [ ] Per-note durations & richer notation
- [ ] BPM detection from audio
- [ ] Mobile app
- [ ] Community score sharing

Full plan in [docs/product/roadmap.md](docs/product/roadmap.md).

<br/>

## 🎨 Brand

Drum Notes is warm, energetic and minimal. The signature gradient is the hero.

![Heat](https://img.shields.io/badge/Heat-FFB020?style=for-the-badge&labelColor=FFB020&color=FFB020)
![Strike](https://img.shields.io/badge/Strike-FF4D2E?style=for-the-badge&labelColor=FF4D2E&color=FF4D2E)
![Ink](https://img.shields.io/badge/Ink-0B0B0F?style=for-the-badge&labelColor=0B0B0F&color=0B0B0F)

Logo, banner, full palette and voice live in [**docs/brand**](docs/brand).

<br/>

## 📚 Documentation

| Area | Links |
|------|-------|
| **Product** | [Vision](docs/product/vision.md) · [Roadmap](docs/product/roadmap.md) · [Glossary](docs/product/glossary.md) |
| **Architecture** | [Overview](docs/architecture/overview.md) · [Domain](docs/architecture/domain.md) · [Frontend](docs/architecture/frontend.md) · [Storage](docs/architecture/storage.md) |
| **Decisions** | [ADRs](docs/adr) |
| **Specs** | [docs/specs](docs/specs) |
| **Engineering rules** | [.claude](.claude) |

<br/>

## 🤝 Contributing

This is a personal project under active development — issues, ideas and PRs are
welcome. It follows **spec-driven development**: no code before a spec, and
architecture changes are recorded as an [ADR](docs/adr). Start with
[.claude/workflow.md](.claude/workflow.md).

<br/>

## 📄 License

[MIT](LICENSE) © Rafael Machado

<div align="center">
<br/>
<sub>Made with 🥁 and TypeScript.</sub>
</div>
