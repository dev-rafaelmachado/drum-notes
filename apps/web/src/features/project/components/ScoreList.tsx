"use client";

import * as React from "react";
import Link from "next/link";
import { Music, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ScoreSummary } from "../services/score-repository";

type ScoreListProps = {
  readonly scores: readonly ScoreSummary[];
  readonly onDelete: (id: string) => void;
};

export function ScoreList({ scores, onDelete }: ScoreListProps): React.JSX.Element {
  if (scores.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
        No saved scores yet. Create your first one above.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {scores.map((score) => (
        <li key={score.id} className="flex items-center gap-3 px-4 py-3">
          <Music className="h-4 w-4 shrink-0 text-neutral-400" />
          <Link href={`/editor/${score.id}`} className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-neutral-800">
              {score.title}
            </span>
            <span className="block text-xs text-neutral-500">
              {score.bpm} BPM · {score.measureCount}{" "}
              {score.measureCount === 1 ? "measure" : "measures"}
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${score.title}`}
            onClick={() => onDelete(score.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
