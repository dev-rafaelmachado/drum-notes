"use client";

import * as React from "react";
import { Music, Trash2 } from "lucide-react";
import type { AudioReference } from "@drum-notes/notation-engine";

import { Button } from "@/components/ui/button";
import { useAudioStore } from "../stores/audio-store";
import { AudioUploader } from "./AudioUploader";
import { TransportControls } from "./TransportControls";
import { VolumeControl } from "./VolumeControl";

/**
 * The project's reference-track panel. Hydrates the player from the score's
 * audio reference, then renders the uploader (no track) or the transport
 * controls (track ready). All state lives in the audio store.
 */
export function AudioPanel({
  audio,
}: {
  readonly audio: AudioReference | null;
}): React.JSX.Element {
  const status = useAudioStore((state) => state.status);
  const reference = useAudioStore((state) => state.reference);
  const errorMessage = useAudioStore((state) => state.errorMessage);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const position = useAudioStore((state) => state.position);
  const duration = useAudioStore((state) => state.duration);
  const volume = useAudioStore((state) => state.volume);

  const syncWithScore = useAudioStore((state) => state.syncWithScore);
  const upload = useAudioStore((state) => state.upload);
  const remove = useAudioStore((state) => state.remove);
  const play = useAudioStore((state) => state.play);
  const pause = useAudioStore((state) => state.pause);
  const stop = useAudioStore((state) => state.stop);
  const seek = useAudioStore((state) => state.seek);
  const setVolume = useAudioStore((state) => state.setVolume);

  React.useEffect(() => {
    // `audio` keeps a stable identity across unrelated edits, so this only
    // re-runs when the attached track actually changes.
    void syncWithScore(audio);
  }, [audio, syncWithScore]);

  const hasTrack = status === "ready" && reference !== null;

  return (
    <section
      aria-label="Reference track"
      className="rounded-lg border border-neutral-200 bg-white px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Music className="h-4 w-4 text-neutral-400" aria-hidden />

        {hasTrack ? (
          <>
            <span className="max-w-48 truncate text-sm font-medium" title={reference.fileName}>
              {reference.fileName}
            </span>
            <TransportControls
              isPlaying={isPlaying}
              position={position}
              duration={duration}
              onPlay={play}
              onPause={pause}
              onStop={stop}
              onSeek={seek}
            />
            <VolumeControl volume={volume} onVolumeChange={setVolume} />
            <AudioUploader onSelect={upload} label="Replace" />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove audio"
              onClick={() => void remove()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <span className="text-sm text-neutral-500">
              {status === "loading" ? "Loading audio…" : "No reference track"}
            </span>
            <div className="ml-auto">
              <AudioUploader onSelect={upload} />
            </div>
          </>
        )}
      </div>

      {errorMessage ? (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
