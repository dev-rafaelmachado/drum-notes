# Tasks — Waveform Display + Loop Regions (AUDIO-007)

Implementation breakdown for the [spec](spec.md). Ordered per the
[workflow](../../../.claude/workflow.md): **Service → State → UI**. No domain
changes are required (waveform data and the loop integration surface are entirely
app-layer). Each task is independently testable.

---

## Waveform Service (`apps/web/src/features/audio/services`)

- [x] `waveform-service.ts`:
  - `WAVEFORM_BUCKETS = 2000` constant
  - `generateWaveform(blob: Blob, buckets?: number): Promise<Float32Array>` —
    decodes via `AudioContext.decodeAudioData`, reads channel 0, downsamples to
    `buckets` `[min, max]` pairs; returns interleaved `Float32Array` of length
    `buckets * 2`.
  - `secondsToPixel(seconds: number, duration: number, width: number): number` —
    pure coordinate helper; clamps to `[0, width]`.
  - `pixelToSeconds(pixel: number, width: number, duration: number): number` —
    pure inverse; clamps to `[0, duration]`.

## State (`apps/web/src/features/audio/stores`)

- [x] `audio-store.ts` — add `waveformData: Float32Array | null` (default
  `null`) and `waveformStatus: "idle" | "generating" | "ready" | "error"`
  (default `"idle"`).
- [x] Add `generateWaveform(blob: Blob): Promise<void>` action — calls the
  service and sets `waveformData` / `waveformStatus`; any previous data is
  cleared before generation starts.
- [x] Clear `waveformData` and reset `waveformStatus` to `"idle"` on
  `remove()`.

## State (`apps/web/src/features/score-playback/stores`)

- [x] `playback-store.ts` — add `setLoop(range: LoopRange | null)` action: sets
  `loop` and forwards to `playbackEngine.setLoop`. This is the direct range
  setter intended for the waveform drag (the existing `toggleLoopMeasure`
  handles the single-measure-click UX).

## Tests

- [x] `waveform-service.test.ts` — unit tests for `secondsToPixel` and
  `pixelToSeconds` (pure math, no mocking needed). Covers zero duration, zero
  width, midpoint, clamping at boundaries.
- [x] `playback-store.test.ts` — add `setLoop` tests: sets store state,
  forwards range to engine, clears loop when called with null.

## Components (`apps/web/src/features/audio/components` + `hooks`)

- [x] `WaveformCanvas.tsx` — stateless canvas renderer. Props:
  `waveformData: Float32Array`, `duration: number`, `position: number`,
  `loopStart: number | null`, `loopEnd: number | null` (seconds),
  `measureTicks: number[]`,
  `onDragSelect: (t1: number, t2: number) => void`,
  `onClear: () => void`.
  Draws: waveform bars (neutral palette), loop-region overlay (violet,
  translucent), playhead line (blue), measure ticks (neutral-300), live drag
  overlay.

- [x] `useWaveformInteraction.ts` hook — manages mouse drag state on a canvas
  ref; fires `onDragSelect(t1, t2)` on mouse-up if horizontal movement ≥ 4px;
  fires `onClear()` on click (no drag). Returns `{ dragProps, dragOverlay }`.

- [x] `WaveformTrack.tsx` — connected container. Reads: `audio-store`
  (`waveformData`, `duration`, `position`, `waveformStatus`),
  `playback-store` (`loop`, `setLoop`, `clearLoop`), `sync-store` (`syncMap`),
  `editor-store` (`score`). Derives `loopStart`/`loopEnd` in seconds from
  `loop` + `syncMap` + `orderedMeasureIds`. On drag: maps seconds → measure
  indices via `activeMeasureAt` → calls `setLoop`; on clear: calls
  `clearLoop`.

## Integration

- [x] `AudioPanel.tsx` — when `hasTrack`, render `<WaveformTrack />` below the
  transport controls row as a full-width block. Trigger
  `audioStore.generateWaveform(blob)` via a `useEffect` when
  `status === "ready"` (requires loading the blob from the repository).

## Validation

- [x] Run `pnpm typecheck` and `pnpm lint` in `apps/web`; fix all errors.
- [x] Run `pnpm test` in `apps/web`; all tests green.
- [x] Update [ADR-013](../../adr/013-waveform.md), backlog, and roadmap.
