"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Clipboard, Copy, Plus, Redo2, Undo2 } from "lucide-react";
import {
  formatTimeSignature,
  SUBDIVISION_LABELS,
  type Score,
} from "@drum-notes/notation-engine";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ExportButtons } from "@/features/export/components/ExportButtons";
import { MetronomePanel } from "@/features/metronome/components/MetronomePanel";
import { ScorePlaybackControls } from "@/features/score-playback/components/ScorePlaybackControls";
import { SpeedControl } from "@/features/score-playback/components/SpeedControl";
import { SyncProjectionControls } from "@/features/sync/components/SyncProjectionControls";
import type { SaveStatus } from "../stores/editor-store";

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "All changes saved",
  error: "Save failed",
};

type EditorToolbarProps = {
  readonly score: Score;
  readonly saveStatus: SaveStatus;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly canCopy: boolean;
  readonly canPaste: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onTitleChange: (title: string) => void;
  readonly onBpmChange: (bpm: number) => void;
  readonly onAddMeasure: () => void;
  readonly onCopy: () => void;
  readonly onPaste: () => void;
};

export function EditorToolbar({
  score,
  saveStatus,
  canUndo,
  canRedo,
  canCopy,
  canPaste,
  onUndo,
  onRedo,
  onTitleChange,
  onBpmChange,
  onAddMeasure,
  onCopy,
  onPaste,
}: EditorToolbarProps): React.JSX.Element {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-6 py-3">
        <Link
          href="/"
          aria-label="Back to scores"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <Button
          variant="ghost"
          size="icon"
          disabled={!canUndo}
          onClick={onUndo}
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={!canRedo}
          onClick={onRedo}
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={!canCopy}
          onClick={onCopy}
          aria-label="Copy selected measures"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={!canPaste}
          onClick={onPaste}
          aria-label="Paste measures"
        >
          <Clipboard className="h-4 w-4" />
        </Button>

        <Input
          aria-label="Score title"
          value={score.title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="h-9 w-56 font-medium"
        />

        <div className="flex items-center gap-2">
          <Label htmlFor="bpm">BPM</Label>
          <Input
            id="bpm"
            type="number"
            min={1}
            max={400}
            value={score.bpm}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value) && value > 0) {
                onBpmChange(value);
              }
            }}
            className="h-9 w-20"
          />
        </div>

        <span className="text-sm text-neutral-500">
          {formatTimeSignature(score.timeSignature)} · {SUBDIVISION_LABELS[score.subdivision]}
        </span>

        <ScorePlaybackControls score={score} />

        <SpeedControl />

        <MetronomePanel bpm={score.bpm} timeSignature={score.timeSignature} />

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-neutral-400">{SAVE_LABELS[saveStatus]}</span>
          <SyncProjectionControls score={score} />
          <Button variant="outline" size="sm" onClick={onAddMeasure}>
            <Plus className="h-4 w-4" />
            Measure
          </Button>
          <ExportButtons score={score} />
        </div>
      </div>
    </header>
  );
}
