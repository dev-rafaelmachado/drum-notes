"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import type { Score } from "@drum-notes/notation-engine";

import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/features/audio/stores/audio-store";
import { useSyncStore } from "../stores/sync-store";

/**
 * Toolbar control to regenerate measure timestamp projections (AUDIO-006). Shown
 * only when a reference track is loaded and an anchor has been set; re-projects
 * every forward measure from the stored anchor using the project's current tempo.
 */
export function SyncProjectionControls({ score }: { readonly score: Score }): React.JSX.Element | null {
  const trackReady = useAudioStore((state) => state.status === "ready");
  const hasAnchor = useSyncStore((state) => state.anchor !== null);
  const regenerate = useSyncStore((state) => state.regenerate);

  if (!trackReady || !hasAnchor) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label="Regenerate projected timestamps from the anchor"
      title="Regenerate projection from the anchor"
      onClick={() => regenerate(score)}
    >
      <RefreshCw className="h-4 w-4" />
      Regenerate
    </Button>
  );
}
