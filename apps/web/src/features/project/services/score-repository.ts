import type { Score } from "@drum-notes/notation-engine";

import { AUDIO_STORE, getDb, SCORES_STORE, SYNC_STORE } from "@/shared/lib/database";

/**
 * Local-first persistence for scores, backed by IndexedDB (see
 * docs/architecture/storage.md and docs/adr/002-indexeddb.md). The stored value
 * is the serialised domain Score plus a timestamp for ordering — storage
 * consumes the model, it does not define an alternative shape.
 */

type StoredScore = Score & { readonly updatedAt: number };

/** Lightweight projection for listing saved scores without loading every note. */
export type ScoreSummary = {
  readonly id: string;
  readonly title: string;
  readonly bpm: number;
  readonly measureCount: number;
  readonly updatedAt: number;
};

export async function saveScore(score: Score): Promise<void> {
  const db = await getDb();
  const record: StoredScore = { ...score, updatedAt: Date.now() };
  await db.put(SCORES_STORE, record);
}

export async function loadScore(id: string): Promise<Score | null> {
  const db = await getDb();
  const record = (await db.get(SCORES_STORE, id)) as StoredScore | undefined;
  if (!record) {
    return null;
  }
  const { updatedAt: _updatedAt, ...score } = record;
  return score;
}

export async function listScores(): Promise<ScoreSummary[]> {
  const db = await getDb();
  const records = (await db.getAll(SCORES_STORE)) as StoredScore[];
  return records
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((record) => ({
      id: record.id,
      title: record.title,
      bpm: record.bpm,
      measureCount: record.measures.length,
      updatedAt: record.updatedAt,
    }));
}

export async function deleteScore(id: string): Promise<void> {
  const db = await getDb();
  // Remove associated data first so deleting a project leaves no orphans: the
  // audio blob (ADR-006) and the sync map (ADR-008).
  const record = (await db.get(SCORES_STORE, id)) as StoredScore | undefined;
  if (record?.audio) {
    await db.delete(AUDIO_STORE, record.audio.id);
  }
  await db.delete(SYNC_STORE, id);
  await db.delete(SCORES_STORE, id);
}
