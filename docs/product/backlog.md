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
