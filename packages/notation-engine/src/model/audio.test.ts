import { describe, expect, it } from "vitest";

import { UnsupportedAudioTypeError } from "../errors";
import {
  createAudioReference,
  isSupportedAudioMimeType,
} from "./audio";

describe("isSupportedAudioMimeType", () => {
  it("accepts MP3 and WAV types", () => {
    expect(isSupportedAudioMimeType("audio/mpeg")).toBe(true);
    expect(isSupportedAudioMimeType("audio/wav")).toBe(true);
    expect(isSupportedAudioMimeType("audio/x-wav")).toBe(true);
  });

  it("rejects unsupported types", () => {
    expect(isSupportedAudioMimeType("audio/ogg")).toBe(false);
    expect(isSupportedAudioMimeType("video/mp4")).toBe(false);
    expect(isSupportedAudioMimeType("")).toBe(false);
  });
});

describe("createAudioReference", () => {
  it("builds a reference from supported metadata", () => {
    const ref = createAudioReference({
      fileName: "song.mp3",
      mimeType: "audio/mpeg",
      duration: 212.5,
    });

    expect(ref.id).toBeTruthy();
    expect(ref.fileName).toBe("song.mp3");
    expect(ref.mimeType).toBe("audio/mpeg");
    expect(ref.duration).toBe(212.5);
  });

  it("uses an explicit id when provided", () => {
    const ref = createAudioReference({
      id: "fixed-id",
      fileName: "loop.wav",
      mimeType: "audio/wav",
      duration: 4,
    });
    expect(ref.id).toBe("fixed-id");
  });

  it("rejects an unsupported MIME type", () => {
    expect(() =>
      createAudioReference({ fileName: "clip.ogg", mimeType: "audio/ogg", duration: 1 }),
    ).toThrow(UnsupportedAudioTypeError);
  });
});
