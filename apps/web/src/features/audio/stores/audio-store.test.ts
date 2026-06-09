import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/audio-player", () => ({
  audioPlayer: {
    setHandlers: vi.fn(),
    setVolume: vi.fn(),
    load: vi.fn().mockResolvedValue(120),
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    stop: vi.fn(),
    seek: vi.fn(),
    dispose: vi.fn(),
  },
}));

vi.mock("../services/audio-repository", () => ({
  saveAudioBlob: vi.fn().mockResolvedValue(undefined),
  loadAudioBlob: vi.fn(),
  deleteAudioBlob: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/project/services/score-repository", () => ({
  saveScore: vi.fn().mockResolvedValue(undefined),
  loadScore: vi.fn(),
}));

import { createScore } from "@drum-notes/notation-engine";

import { useEditorStore } from "@/features/editor/stores/editor-store";
import * as repository from "../services/audio-repository";
import { useAudioStore } from "./audio-store";

function mp3(name = "song.mp3"): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type: "audio/mpeg" });
}

beforeEach(() => {
  vi.clearAllMocks();
  useEditorStore.getState().reset();
  useEditorStore.getState().setCurrentScore(createScore());
  useAudioStore.setState({
    status: "empty",
    reference: null,
    errorMessage: null,
    isPlaying: false,
    position: 0,
    duration: 0,
  });
});

describe("audio store", () => {
  it("uploads a supported file, persists the blob and attaches it to the score", async () => {
    await useAudioStore.getState().upload(mp3());

    const audioState = useAudioStore.getState();
    expect(audioState.status).toBe("ready");
    expect(audioState.reference?.fileName).toBe("song.mp3");
    expect(audioState.duration).toBe(120);

    expect(repository.saveAudioBlob).toHaveBeenCalledTimes(1);

    const attached = useEditorStore.getState().score!.audio;
    expect(attached?.id).toBe(audioState.reference!.id);
    expect(attached?.mimeType).toBe("audio/mpeg");
  });

  it("rejects an unsupported file without touching storage or the score", async () => {
    const txt = new File(["nope"], "notes.txt", { type: "text/plain" });
    await useAudioStore.getState().upload(txt);

    expect(useAudioStore.getState().status).toBe("empty");
    expect(useAudioStore.getState().errorMessage).toMatch(/MP3 or WAV/);
    expect(repository.saveAudioBlob).not.toHaveBeenCalled();
    expect(useEditorStore.getState().score!.audio).toBeUndefined();
  });

  it("removes the audio, deleting the blob and detaching it from the score", async () => {
    await useAudioStore.getState().upload(mp3());
    const id = useAudioStore.getState().reference!.id;

    await useAudioStore.getState().remove();

    expect(repository.deleteAudioBlob).toHaveBeenCalledWith(id);
    expect(useAudioStore.getState().status).toBe("empty");
    expect(useAudioStore.getState().reference).toBeNull();
    expect(useEditorStore.getState().score!.audio).toBeUndefined();
  });

  it("replaces an existing track and deletes the previous blob", async () => {
    await useAudioStore.getState().upload(mp3("first.mp3"));
    const firstId = useAudioStore.getState().reference!.id;

    await useAudioStore.getState().upload(mp3("second.mp3"));

    expect(useAudioStore.getState().reference?.fileName).toBe("second.mp3");
    expect(repository.deleteAudioBlob).toHaveBeenCalledWith(firstId);
    expect(useEditorStore.getState().score!.audio?.fileName).toBe("second.mp3");
  });
});
