"use client";

import * as React from "react";
import Link from "next/link";
import { buildScoreLayout, type Instrument } from "@drum-notes/notation-engine";

import { AudioPanel } from "@/features/audio/components/AudioPanel";
import { instrumentPlayer } from "@/features/instrument-audio/services/instrument-player";
import { useSyncStore } from "@/features/sync/stores/sync-store";
import { useEditorStore } from "../stores/editor-store";
import { EditorToolbar } from "./EditorToolbar";
import { EditorMeasure } from "./EditorMeasure";

export function ScoreEditor({ scoreId }: { scoreId: string }): React.JSX.Element {
  const score = useEditorStore((state) => state.score);
  const loadStatus = useEditorStore((state) => state.loadStatus);
  const saveStatus = useEditorStore((state) => state.saveStatus);
  const loadScore = useEditorStore((state) => state.loadScore);
  const setTitle = useEditorStore((state) => state.setTitle);
  const setBpm = useEditorStore((state) => state.setBpm);
  const addMeasure = useEditorStore((state) => state.addMeasure);
  const removeMeasure = useEditorStore((state) => state.removeMeasure);
  const duplicateMeasure = useEditorStore((state) => state.duplicateMeasure);
  const toggleNote = useEditorStore((state) => state.toggleNote);
  const hydrateSync = useSyncStore((state) => state.hydrate);

  const handleToggle = React.useCallback(
    (measureId: string, instrument: Instrument, position: number) => {
      toggleNote(measureId, instrument, position);
      // Instant, fire-and-forget audio feedback (AUDIO-004) — never blocks the edit.
      instrumentPlayer.play(instrument);
    },
    [toggleNote],
  );

  React.useEffect(() => {
    // Load only when the open score differs from the requested one.
    if (!score || score.id !== scoreId) {
      void loadScore(scoreId);
    }
  }, [scoreId, score, loadScore]);

  React.useEffect(() => {
    // Hydrate the score's synchronization map alongside the score.
    void hydrateSync(scoreId);
  }, [scoreId, hydrateSync]);

  if (loadStatus === "loading" || loadStatus === "idle") {
    return <CenteredMessage>Loading score…</CenteredMessage>;
  }

  if (loadStatus === "not-found") {
    return (
      <CenteredMessage>
        Score not found.{" "}
        <Link href="/" className="underline">
          Back to scores
        </Link>
      </CenteredMessage>
    );
  }

  if (loadStatus === "error" || !score) {
    return <CenteredMessage>Could not open this score.</CenteredMessage>;
  }

  const layout = buildScoreLayout(score);
  const orderedMeasureIds = layout.measures.map((measure) => measure.id);

  return (
    <div className="min-h-screen bg-neutral-50">
      <EditorToolbar
        score={score}
        saveStatus={saveStatus}
        onTitleChange={setTitle}
        onBpmChange={setBpm}
        onAddMeasure={addMeasure}
      />
      <main className="mx-auto max-w-5xl space-y-4 px-6 py-6">
        <AudioPanel audio={score.audio ?? null} />
        {layout.measures.map((measure, index) => (
          <EditorMeasure
            key={measure.id}
            measure={measure}
            index={index}
            stepsPerBeat={layout.stepsPerBeat}
            canRemove={layout.measures.length > 1}
            orderedMeasureIds={orderedMeasureIds}
            onToggle={handleToggle}
            onDuplicate={duplicateMeasure}
            onRemove={removeMeasure}
          />
        ))}
      </main>
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
      {children}
    </div>
  );
}
