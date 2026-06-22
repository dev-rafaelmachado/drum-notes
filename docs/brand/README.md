# Drum Notes — Brand

The visual identity for Drum Notes. Keep it warm, energetic and minimal — the
product is about *speed and simplicity*, and the brand should feel the same.

## Logo

| Asset | File | Use |
|-------|------|-----|
| Icon / mark | [`logo.svg`](logo.svg) | App icon, favicon, avatars, anywhere square. |
| Banner / lockup | [`banner.svg`](banner.svg) | README hero, social cards, slides. |

The mark is a drum with crossed sticks on a warm gradient tile. Give it room to
breathe — never crop the tile or recolor the gradient.

## Palette

| Token | Hex | Swatch | Use |
|-------|-----|--------|-----|
| Heat (amber) | `#FFB020` | ![](https://img.shields.io/badge/%20-FFB020?style=flat-square&color=FFB020) | Gradient start, highlights. |
| Strike (vermilion) | `#FF4D2E` | ![](https://img.shields.io/badge/%20-FF4D2E?style=flat-square&color=FF4D2E) | Primary accent, calls to action. |
| Ink | `#0B0B0F` | ![](https://img.shields.io/badge/%20-0B0B0F?style=flat-square&color=0B0B0F) | Text, dark surfaces. |
| Slate | `#9CA3AF` | ![](https://img.shields.io/badge/%20-9CA3AF?style=flat-square&color=9CA3AF) | Secondary text. |
| Paper | `#FFFFFF` | ![](https://img.shields.io/badge/%20-FFFFFF?style=flat-square&color=FFFFFF) | Light surfaces. |

The signature **`#FFB020 → #FF4D2E`** gradient (top-left → bottom-right) is the
brand's hero element.

## Gradient

```css
/* The Drum Notes brand gradient — always this angle, always heat → strike */
background-image: linear-gradient(135deg, #FFB020 0%, #FF4D2E 100%);
```

The gradient is a **brand accent, not a default surface**. Use it deliberately so
it keeps its impact.

**Do**

* The logo / brand mark and hero moments (banner, empty states, the primary "new
  score" call to action — **one** gradient moment per view).
* Playback emphasis — playhead, active-measure accent, progress fills — to make
  the "live" state feel energetic.
* Selected brand states where you want a spark, used sparingly.

**Don't**

* Cover large surfaces or page backgrounds with it.
* Put body text or essential labels on top of it (contrast/legibility).
* Apply it to every button — default interactive elements use the flat `Strike`
  (`primary`); the gradient is the exception, not the rule.
* Use it for destructive/error states (those stay a flat danger red).
* Recolour it or change the angle — it is always `135deg`, `heat → strike`.

## Typography

Free, open (OFL) faces — easy to self-host or load via Google Fonts, fitting an
open-source project.

| Role | Typeface | Use |
|------|----------|-----|
| **Display / headings** | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) | Titles, the wordmark, section headers, big numbers. Its mechanical, rhythmic letterforms echo precision and tempo. |
| **Body / UI** | [Inter](https://fonts.google.com/specimen/Inter) | Paragraphs, labels, controls, dense editor UI — neutral and highly legible. |
| **Numeric / mono** *(optional)* | [Space Mono](https://fonts.google.com/specimen/Space+Mono) | Tempo (BPM), timecodes, tabular figures — an "equipment readout" feel; pairs with Space Grotesk. |

Guidelines:

* **Pairing:** Space Grotesk for display, Inter for everything readable. Don't set
  long text in Space Grotesk.
* **Weights:** Display 500–700; body 400–600. Tighten letter-spacing on large
  display (`-0.02em`), default elsewhere.
* **Fallback stack:** `"Space Grotesk", "Inter", system-ui, sans-serif` (display)
  and `"Inter", system-ui, sans-serif` (body).

## Voice

Confident, friendly, drummer-to-drummer. Short sentences. No music-theory
gatekeeping. Tagline: **"Transcribe grooves at the speed of thought."**

## Applying the brand to the app

The app still uses the default shadcn theme. Translating this brand into product
UI (design tokens, accent palette, dark mode, on-brand exports) is planned as the
[Design System Migration](../specs/design-system/prd.md) (PRD) /
[ADR-012](../adr/012-design-system.md), tracked as `DESIGN-00x` in the
[backlog](../product/backlog.md#design-system).
