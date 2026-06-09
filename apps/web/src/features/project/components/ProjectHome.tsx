"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Score } from "@drum-notes/notation-engine";

import {
  deleteScore,
  listScores,
  type ScoreSummary,
} from "../services/score-repository";
import { NewScoreForm } from "./NewScoreForm";
import { ScoreList } from "./ScoreList";

export function ProjectHome(): React.JSX.Element {
  const router = useRouter();
  const [scores, setScores] = React.useState<ScoreSummary[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      setScores(await listScores());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreated = React.useCallback(
    (score: Score) => {
      router.push(`/editor/${score.id}`);
    },
    [router],
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      await deleteScore(id);
      await refresh();
    },
    [refresh],
  );

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Drum Notes</h1>
        <p className="text-sm text-neutral-500">
          Create, edit and export drum scores. Everything is saved locally in your browser.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-700">New score</h2>
        <NewScoreForm onCreated={handleCreated} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-700">Your scores</h2>
        {loading ? (
          <p className="text-sm text-neutral-400">Loading…</p>
        ) : (
          <ScoreList scores={scores} onDelete={handleDelete} />
        )}
      </section>
    </main>
  );
}
