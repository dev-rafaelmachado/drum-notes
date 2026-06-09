import { openDB, type IDBPDatabase } from "idb";
import type { Score } from "@drum-notes/notation-engine";

/**
 * Local-first persistence for scores, backed by IndexedDB (see
 * docs/architecture/storage.md and docs/adr/002-indexeddb.md). The stored value
 * is the serialised domain Score plus a timestamp for ordering — storage
 * consumes the model, it does not define an alternative shape.
 */

const DB_NAME = "drum-notes";
const DB_VERSION = 1;
const STORE = "scores";

type StoredScore = Score & { readonly updatedAt: number };

/** Lightweight projection for listing saved scores without loading every note. */
export type ScoreSummary = {
  readonly id: string;
  readonly title: string;
  readonly bpm: number;
  readonly measureCount: number;
  readonly updatedAt: number;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment."));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("updatedAt", "updatedAt");
        }
      },
    });
  }
  return dbPromise;
}

export async function saveScore(score: Score): Promise<void> {
  const db = await getDb();
  const record: StoredScore = { ...score, updatedAt: Date.now() };
  await db.put(STORE, record);
}

export async function loadScore(id: string): Promise<Score | null> {
  const db = await getDb();
  const record = (await db.get(STORE, id)) as StoredScore | undefined;
  if (!record) {
    return null;
  }
  const { updatedAt: _updatedAt, ...score } = record;
  return score;
}

export async function listScores(): Promise<ScoreSummary[]> {
  const db = await getDb();
  const records = (await db.getAll(STORE)) as StoredScore[];
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
  await db.delete(STORE, id);
}
