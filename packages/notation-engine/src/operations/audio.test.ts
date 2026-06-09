import { describe, expect, it } from "vitest";

import { createAudioReference } from "../model/audio";
import { attachAudio, detachAudio } from "./audio";
import { createScore } from "./create-score";

function reference(fileName: string) {
  return createAudioReference({ fileName, mimeType: "audio/mpeg", duration: 120 });
}

describe("attachAudio", () => {
  it("attaches a reference to a score", () => {
    const score = createScore();
    const ref = reference("song.mp3");
    const next = attachAudio(score, ref);
    expect(next.audio).toEqual(ref);
  });

  it("replaces an existing reference", () => {
    const first = reference("first.mp3");
    const second = reference("second.mp3");
    const score = attachAudio(createScore(), first);
    const next = attachAudio(score, second);
    expect(next.audio).toEqual(second);
  });

  it("does not mutate the original score", () => {
    const score = createScore();
    attachAudio(score, reference("song.mp3"));
    expect(score.audio).toBeUndefined();
  });
});

describe("detachAudio", () => {
  it("removes the reference", () => {
    const score = attachAudio(createScore(), reference("song.mp3"));
    const next = detachAudio(score);
    expect(next.audio).toBeUndefined();
  });

  it("is a no-op when there is no audio", () => {
    const score = createScore();
    expect(detachAudio(score).audio).toBeUndefined();
  });
});
