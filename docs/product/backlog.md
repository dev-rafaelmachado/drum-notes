# Product Ideas Backlog

## NOTATION-001 - Note Duration Editor

Status: Backlog

Description:
Allow users to switch between note durations when editing a score.

Examples:

* Whole note
* Half note
* Quarter note
* Eighth note
* Sixteenth note

Value:
Improves notation flexibility and allows more accurate transcriptions.

Priority:
High

---

## AUDIO-001 - Audio Upload

Status: Specified — see [audio-upload spec](../specs/audio-upload/spec.md)

Description:
Allow users to upload audio files to the project.

Supported formats:

* MP3
* WAV

Controls:

* Play
* Pause
* Stop
* Seek
* Volume

Value:
Users can transcribe songs without switching applications.

Priority:
High

---

## AUDIO-002 - Project Metronome

Status: Specified — see [metronome spec](../specs/metronome/spec.md)

Description:
Provide a metronome synchronized with the project BPM.

Features:

* Start / Stop
* Adjustable volume
* Accent on first beat

Value:
Improves practice and transcription accuracy.

Priority:
High

---

## AUDIO-003 - Score Synchronization

Status: Specified — see [score-sync spec](../specs/score-sync/spec.md)

Description:
Synchronize score measures with audio playback.

Features:

* Current measure indicator
* Automatic scrolling
* Playback position tracking

Value:
Allows users to follow the score while listening to the song.

Priority:
High

---

## AUDIO-004 - Instant Audio Feedback (SKI-10)

Status: Specified — see [instant-feedback spec](../specs/instant-feedback/spec.md)

Description:
Play the corresponding drum sound the moment a note is added or clicked, for
instant validation while writing notation.

Features:

* Sound on adding a note
* Sound on clicking an existing note
* All eight instruments
* Reusable `play(instrument)` engine

Value:
Confirms by ear that notes land on the right instrument, speeding up editing.

Priority:
High

---

## AUDIO-005 - Score Playback (SKI-11)

Status: Specified — see [score-playback spec](../specs/score-playback/spec.md)

Description:
Play the written drum notation back with drum sounds — start / pause / resume /
stop, follow the project BPM, highlight measures and notes as they play, and
begin from any measure. Reuses the instrument-audio engine from AUDIO-004 and is
generated directly from the Score → Measure → Note model. Realises roadmap
Phase 1 (Playback).

Features:

* Play / Pause / Resume / Stop
* BPM synchronization
* Correct drum sound per instrument
* Active-measure and note highlighting during playback
* Playback from a selected measure

Value:
Users can validate transcriptions by ear before practicing.

Priority:
High

## AUDIO-006 - Measure Timestamp Projection

Status: Specified — see [measure-timestamp-projection spec](../specs/measure-timestamp-projection/spec.md)

Description:
Sync a song to the score by defining one anchor measure's start timestamp and
automatically projecting every forward measure from the project's BPM and time
signature. Projected entries are stored as regular `SyncMap` entries (building on
AUDIO-003) and behave identically to manual mappings — highlight, seek, scroll.
The anchor persists for one-click regeneration. Realises roadmap Phase 2
(Audio Synchronization).

Features:

* Anchor a measure at a manual or captured timestamp
* Forward projection of all subsequent measures from the tempo
* Manual override of any projected timestamp
* Regenerate all projections from the stored anchor

Value:
Removes repetitive bar-by-bar mapping for songs recorded to a stable tempo.

Priority:
Medium


## Editing Experience

### EDIT-001 — Undo / Redo

Status: Ideas

Description:
Allow users to undo and redo any editing action (toggle note, add/remove
measure, change BPM, etc.) with a full history stack.

Features:

* Undo the last action (Ctrl+Z / Cmd+Z)
* Redo the last undone action (Ctrl+Shift+Z / Cmd+Shift+Z)
* History stack survives autosave (no data loss on reload)
* Visual undo/redo buttons in the toolbar

Value:
Universal editor need — one misclick currently has no recovery. Eliminates
frustration and encourages experimentation.

Priority:
High

---

### EDIT-002 — Keyboard Shortcuts

Status: Ideas

Description:
Add keyboard shortcuts for the most common editing and playback actions so
users can work without reaching for the mouse.

Features:

* Space — play / pause toggle
* Backspace — stop playback
* Arrow keys — navigate between measures
* Number keys (1-8) — select instrument
* Delete — remove selected notes in active measure
* Ctrl+Z / Ctrl+Shift+Z — undo / redo (pairs with EDIT-001)

Value:
Dramatically speeds up transcription for power users. Standard expectation
in any editor.

Priority:
High

---

### EDIT-003 — Copy / Paste Measures

Status: Ideas

Description:
Select one or more measures, copy them, and paste at any position in the
score. Builds on the existing `duplicateMeasure` domain operation but allows
non-adjacent placement.

Features:

* Select measures (click header / shift-click range)
* Copy selected measures to clipboard
* Paste at a chosen position (insert or overwrite)
* Copy across projects (paste into a different score)

Value:
Essential for building patterns from existing bars. Currently users must
manually recreate similar patterns note-by-note.

Priority:
Medium

---

### EDIT-004 — Drag-and-Drop Measure Reordering

Status: Ideas

Description:
Reorder measures by dragging them in the editor. Uses the existing
`removeMeasure` + `addMeasure` domain operations under the hood.

Features:

* Drag handle on each measure header
* Visual drop indicator between measures
* Keyboard alternative (move measure left/right)
* Undoable reorder

Value:
Lets users restructure a song without deleting and recreating measures.
Common in tab editors.

Priority:
Medium

---

## Practice Suite

### PRACT-001 — Loop Playback + Speed Control (SKI-17)

Status: Specified — see [loop-speed-control spec](../specs/loop-speed-control/spec.md)

Description:
Loop a range of measures during playback and adjust playback speed. These
two features share the same UI surface in the transport controls and serve
the core practice use case. Built on AUDIO-005 score playback: the loop window
is a pure projection of the playback schedule and speed scales the transport
rate (pitch unchanged); both are session-only. Realises roadmap Phase 1
(Playback) practice tooling and is the foundation for PRACT-002 and AUDIO-007.

Features:

* **Loop**: set loop start/end measures; playback repeats the section
* **Speed control**: 0.5x / 0.75x / 1x / 1.5x / 2x playback rate
* Speed scales the transport rate (via `Transport.bpm` in Tone v15, no pitch change)
* Loop and speed persist per session (not saved to score)
* Visual loop region indicator on the measure headers

Value:
Looping lets drummers practice a section repeatedly. Speed control lets
them slow down difficult passages. Together they are the #1 practice
feature in drum tab apps.

Priority:
High

---

### PRACT-002 — Practice Mode (Auto-Advance)

Status: Ideas

Description:
An advanced practice mode that combines looping with automatic speed
adjustment. Starts slow and gradually increases tempo each loop iteration
until the target BPM is reached.

Features:

* Configure start BPM, target BPM, and increment per cycle
* Auto-speed-up after each successful loop
* Optional metronome click during loop (syncs with AUDIO-002)
* Progress indicator (current BPM / target BPM)
* Pause/reset controls

Value:
A structured practice routine without leaving the app. No other drum
notation tool does this well. Builds on PRACT-001 as the foundation.

Dependencies:
Requires PRACT-001 (loop + speed control).

Priority:
Medium

---

### PRACT-003 — Mute / Solo Instruments

Status: Ideas

Description:
Toggle individual instruments on or off during playback. Mute hides an
instrument's sound; solo plays only that instrument.

Features:

* Per-row mute/solo toggle (speaker icon on `InstrumentRow`)
* Solo overrides mute (soloing one mutes all others)
* Mute/solo state is session-only (not saved to score)
* Works with both score playback (AUDIO-005) and reference track

Value:
Lets drummers isolate parts (e.g., hear only kick + snare patterns) or
remove a part to play along. Standard feature in DAWs and practice tools.

Priority:
Medium

---

## Notation

### NOTATION-001 — Note Duration Editor

Status: Backlog — see [official backlog](backlog.md#notation-001--note-duration-editor)

Description:
Allow users to switch between note durations when editing a score. The
`NoteDuration` domain type already exists in the codebase.

Priority:
High

---

### NOTATION-002 — Velocity Editing

Status: Ideas

Description:
Allow users to set the velocity (dynamics) of individual notes. The domain
already stores `Note.velocity` (0..1) but the UI only toggles on/off.

Features:

* Right-click or shift-click a note to open a velocity picker
* Visual indicator of velocity (opacity or size of the note dot)
* Velocity affects playback volume (already in `instrument-player`)
* Default velocity for new notes (configurable per score)

Value:
Enables dynamic expression — accents, ghost notes, crescendos. Makes
transcriptions more musically accurate.

Priority:
Medium

---

### NOTATION-003 — Repeat Signs / Navigation Markings

Status: Ideas

Description:
Add repeat barlines, D.S. al Coda, first/second endings, and other
navigation markings to the score. These are measure-level metadata that
affect how the score is read and played back.

Features:

* Repeat start/end barlines on measures
* D.S. al Fine / D.C. al Coda navigation
* First and second ending brackets
* Playback engine respects repeat structure (plays repeated sections)

Value:
Makes the notation engine complete for real songs. Most drum transcriptions
use repeat signs to avoid writing redundant bars.

Priority:
Low

---

## Audio Enhancement

### AUDIO-007 — Waveform Display + Loop Regions

Status: Ideas

Description:
Display the reference track's waveform above the measures and let users
define loop regions by dragging on the waveform. Combines two related
features that share the same audio visualization surface.

Features:

* **Waveform**: draw the audio waveform in a strip above the measure grid
* Computed from the stored audio blob using Web Audio API AnalyserNode
* Scroll-synced with the measures
* Playhead position indicator on the waveform
* **Loop regions**: drag to select a region on the waveform
* Region highlights loop start/end in the transport
* Loops sync with PRACT-001 loop playback

Value:
Waveform gives visual context for synchronization (see where beats fall).
Loop regions provide an alternative way to define practice sections by
dragging on the audio rather than selecting measures. Both enhance the
reference track experience.

Dependencies:
Benefits from PRACT-001 (loop playback) for loop region playback.

Priority:
Medium

---

## Export & Interchange

### EXPORT-001 — MIDI Export

Status: Ideas

Description:
Export the score as a Standard MIDI File (.mid) that can be opened in any
DAW, notation software, or drum machine.

Features:

* Channel 10 (percussion) per GM drum mapping
* Note-on velocity from `Note.velocity`
* Timing from `PlaybackSchedule` (tempo, subdivision)
* Configurable file name (defaults to score title)

Value:
Lets users import their drum-notes scores into DAWs (Logic, Ableton,
FL Studio) for further production or practice backing tracks.

Priority:
Medium

---

### EXPORT-002 — MusicXML Export

Status: Ideas

Description:
Export the score as a MusicXML file — the standard interchange format for
music notation software.

Features:

* Percussion clef with correct notehead placement
* Time signature, BPM, and subdivision metadata
* Compatible with MuseScore, Sibelius, Finale, Dorico
* Round-trip: import back into drum-notes (future feature)

Value:
The universal language of notation software. Lets users move scores
between drum-notes and professional notation tools. High value for
teachers producing printed material.

Priority:
Low
