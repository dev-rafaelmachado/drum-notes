# Test Cases — Audio Upload (AUDIO-001)

Given/When/Then cases covering the [acceptance criteria](spec.md#acceptance-criteria).
Tests verify behavior, not implementation details.

---

## Upload Supported File

Given a project with no audio
When the user uploads an MP3 (or WAV) file
Then the audio is attached to the project and its reference (fileName, mimeType,
duration) is recorded on the Score.

## Reject Unsupported File

Given a project
When the user selects a file that is not MP3 or WAV
Then the file is rejected with a clear message;
And the project's audio is unchanged.

## Replace Existing Audio

Given a project that already has an audio reference
When the user uploads a new supported file
Then the new reference replaces the previous one;
And the previous blob is removed from storage.

## Audio Persists Across Reopen

Given a project with an uploaded audio that was autosaved
When the user reopens the project
Then the audio reference is restored and the blob loads from storage —
the track is still attached.

## Play

Given a project with audio at the start position
When the user presses Play
Then playback starts and the position advances.

## Pause

Given audio that is playing
When the user presses Pause
Then playback stops and the position is kept where it was.

## Stop

Given audio that is playing or paused
When the user presses Stop
Then playback stops and the position resets to the start.

## Seek

Given a project with audio
When the user seeks to a position within [0, duration]
Then playback continues (or remains ready) from that position.

## Position Display

Given audio that is playing
When playback advances
Then the displayed current position updates continuously and the total
duration is shown.

## Volume Affects Playback Immediately

Given audio that is playing
When the user changes the volume
Then the output level changes immediately, without restarting playback.

## Deleting Project Removes Audio

Given a project with an associated audio blob
When the project is deleted
Then its audio blob is removed from storage (no orphan).
