# ADR-011 — Loop Playback and Variable Speed on the Shared Transport

## Status

Accepted

## Context

[PRACT-001 Loop Playback + Speed Control](../specs/loop-speed-control/spec.md)
adds a practice workflow on top of score playback: repeat a range of measures
continuously and change the playback tempo without changing pitch. It is the
foundation of the Practice Suite and must remain usable by
[PRACT-002](../product/backlog.md) (auto-advancing tempo) and
[AUDIO-007](../product/backlog.md) (waveform loop regions).

The issue is prescriptive: speed must use the Tone.js Transport `playbackRate`,
it must integrate with [AUDIO-005 score playback](../specs/score-playback/spec.md),
loop/speed are **session-only** (never saved to the score), and the loop region
must be shown on the score.

Constraints / precedent:

* Playback is a **pure projection** of the domain model
  ([ADR-010](010-score-playback.md)): `buildPlaybackSchedule(score)` yields timed
  notes, `measureStarts`, `measureDuration` and `duration`. No parallel notation
  model may be introduced.
* The metronome ([ADR-007](007-metronome.md)) and score playback share the single
  global `Tone.Transport`; they are **mutually exclusive** ([ADR-010](010-score-playback.md)).
* AUDIO-005 schedules each note with `Transport.scheduleOnce` and polls
  `Transport.seconds` for the measure/step highlight.

## Decision

* **The loop window is a pure domain projection.** `packages/notation-engine`
  gains `loopRegion(schedule, startIndex, endIndex)` → `{ start, end }` seconds,
  computed as `[measureStarts[lo], measureStarts[hi] + measureDuration)`. It
  normalises reversed indices and clamps to the measure count. Like
  `buildPlaybackSchedule`, it adds **no** new notation representation — the loop
  is expressed purely in measure indices and the existing schedule.

* **Loop uses the Transport's native loop.** The engine sets `Transport.loop`,
  `Transport.loopStart` and `Transport.loopEnd` from `loopRegion`. To make notes
  re-fire every iteration, notes are scheduled with **`Transport.schedule`**
  (loop-aware) instead of `scheduleOnce`; non-loop playback is unchanged because
  the transport stops at `duration`, firing each note once.

* **Speed scales the Transport tempo (playback-rate semantics).** A fixed set of
  rates (0.5×/0.75×/1×/1.5×/2×) scales the transport's playback rate. In Tone v15
  the Transport exposes its rate through `Transport.bpm` (there is no separate
  `playbackRate` field), so speed is applied as `bpm = score.bpm × rate`. Notes
  are scheduled at speed-invariant musical positions (each schedule-seconds value
  is divided by the rate at schedule time, which cancels the rate baked into the
  bpm), so changing the rate **only rescales wall-clock** — the musical timeline
  and the measure/step highlight are unchanged, and because drum voices are
  **synthesised** and triggered on that timeline, **pitch is unaffected** with no
  time-stretch DSP. The rate can change live while playing (set `bpm`, no
  rescheduling).

* **The highlight math is unchanged.** `Transport.seconds` is transport-timeline
  position, so the existing measure/step derivation stays correct at any
  `playbackRate` and wraps naturally within the loop. The only change is that the
  rAF tick must **not** auto-stop at `duration` while looping (the transport never
  reaches it).

* **Loop and speed are session state in the playback store.** They live in the
  Zustand `playback-store` as `loop` (measure indices) and `speed`, default
  `null`/`1`. They are **never** serialised to the Score or IndexedDB, so the
  domain model and persisted documents are untouched (session persistence = store
  memory; a reload resets to defaults).

* **Single transport owner preserved.** Loop/speed apply to the same global
  Transport score playback already owns; mutual exclusion with the metronome is
  unchanged.

## Consequences

* Practising a passage needs no new model and no storage migration; loop/speed
  ride entirely on transport state and a pure window projection.
* The loop window and speed are unit-testable without a browser (domain math +
  store with a mocked engine); real looping and `playbackRate` are verified by
  ear in the app.
* Switching notes to `Transport.schedule` makes loop iterations re-trigger
  correctly; the trade-off is that scheduled events persist until `cancel(0)` on
  stop (already performed).
* Exposing `loop`/`speed` as store state gives PRACT-002 and AUDIO-007 a ready
  integration surface.
* Session-only scope means loop/speed do not survive reload — an accepted limit
  for a practice aid (the issue forbids saving them to the score).

## Alternatives considered

* **Re-scheduling notes manually on each loop via a clock callback** — duplicates
  what `Transport.loop` already does and risks drift; rejected for the native
  transport loop with `Transport.schedule`.
* **Time-stretching the synthesised output with a DSP node** — unnecessary for
  synth voices (pitch is already independent of timeline rate) and heavier;
  rejected for `playbackRate`.
* **Persisting loop/speed on the Score** — explicitly out of scope and would
  pollute the canonical model with transient practice state; rejected for
  session-only store state.
* **A separate loop "selection" model** — would be a parallel representation;
  rejected in favour of plain measure indices projected through the schedule.
