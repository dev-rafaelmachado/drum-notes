# Tests — Waveform Display + Loop Regions (AUDIO-007)

Covers the [acceptance criteria](spec.md#acceptance-criteria). Tests verify
behaviour, not implementation details.

---

## Unit — `waveform-service.test.ts`

**`secondsToPixel`**

| Scenario | Input | Expected |
|----------|-------|----------|
| Position at start | `seconds=0, duration=60, width=600` | `0` |
| Position at end | `seconds=60, duration=60, width=600` | `600` |
| Midpoint | `seconds=30, duration=60, width=600` | `300` |
| Zero duration (guard) | `duration=0` | `0` (no division by zero) |
| Clamp over end | `seconds=70, duration=60, width=600` | `600` |
| Clamp below start | `seconds=-5, duration=60, width=600` | `0` |

**`pixelToSeconds`**

| Scenario | Input | Expected |
|----------|-------|----------|
| Pixel at start | `pixel=0, width=600, duration=60` | `0` |
| Pixel at end | `pixel=600, width=600, duration=60` | `60` |
| Midpoint | `pixel=300, width=600, duration=60` | `30` |
| Zero width (guard) | `width=0` | `0` |
| Round-trip | `pixelToSeconds(secondsToPixel(t, d, w), w, d) ≈ t` | original `t` |

---

## Unit — `playback-store.test.ts` (additions)

**`setLoop`**

| Scenario | Action | Expected |
|----------|--------|----------|
| Set a range | `setLoop({ start: 1, end: 3 })` | `store.loop === { start: 1, end: 3 }`, `engine.setLoop` called with range |
| Clear the loop | `setLoop(null)` | `store.loop === null`, `engine.setLoop(null)` called |
| Overwrite existing | set `{0,2}` then `setLoop({3,5})` | `store.loop === { start: 3, end: 5 }` |

---

## Integration — `WaveformTrack.test.tsx`

**Drag → loop sync (SyncMap present)**

Setup: mock `useAudioStore` with `waveformData` and `duration=60`;
mock `useSyncStore` with a SyncMap mapping two measures;
mock `usePlaybackStore` with `setLoop` spy; render `<WaveformTrack />`.

| Scenario | Action | Expected |
|----------|--------|----------|
| Drag covering two mapped measures | fire mousedown→mousemove→mouseup over waveform canvas pixels corresponding to mapped measure range | `setLoop` called with correct `{ start, end }` indices |
| Drag outside all mapped measures | drag over unmapped region | `setLoop` not called |
| Click (no drag) | mousedown + mouseup at same pixel | `clearLoop` called |

**No SyncMap degradation**

Setup: mock `useSyncStore` with `syncMap: null`.

| Scenario | Expected |
|----------|----------|
| Drag over waveform | `setLoop` not called |

---

## Manual / browser verification

1. Load a score with a reference track → waveform strip appears in audio panel.
2. Play the reference audio → playhead line moves smoothly.
3. Set measure timestamps (via sync panel) → tick marks appear on waveform.
4. Drag a region over two mapped measures → measure headers show loop indicator;
   play score → transport loops those measures.
5. Loop set via measure headers → waveform overlay appears at corresponding
   timestamps.
6. Click without dragging → loop clears on both waveform and measure headers.
7. Remove reference audio → waveform strip disappears.
