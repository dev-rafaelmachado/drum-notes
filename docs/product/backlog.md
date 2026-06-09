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

## AUDIO-004 - Score Playback

Status: Backlog

Description:
Play the written drum notation using drum samples. Reuses the instrument-audio
engine introduced by Instant Audio Feedback (below).

Features:

* Play
* Pause
* Stop
* BPM synchronization

Value:
Users can validate transcriptions before practicing.

Priority:
High

---

## AUDIO-004 - Instant Audio Feedback (SKI-10)

> Note: Linear reuses the AUDIO-004 code for this issue; it is a distinct feature
> from *Score Playback* above and shares the instrument-audio engine with it.

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
