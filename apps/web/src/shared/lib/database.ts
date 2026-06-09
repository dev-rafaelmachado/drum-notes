import { openDB, type IDBPDatabase } from "idb";

/**
 * Shared IndexedDB connection for the offline-first app (see
 * docs/architecture/storage.md). One database holds every feature's store, so
 * the connection and schema upgrades are centralised here rather than opened
 * per feature.
 *
 * Stores:
 *   - `scores` (v1): the serialised domain Score, keyed by `score.id`.
 *   - `audio`  (v2): an uploaded audio blob, keyed by its AudioReference `id`
 *                    (see docs/adr/006-audio-storage.md).
 *   - `sync`   (v3): the score-to-audio SyncMap, keyed by `scoreId`, stored
 *                    separately from notation (see docs/adr/008-score-sync.md).
 */

export const DB_NAME = "drum-notes";
export const DB_VERSION = 3;

export const SCORES_STORE = "scores";
export const AUDIO_STORE = "audio";
export const SYNC_STORE = "sync";

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDb(): Promise<IDBPDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment."));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      // Upgrades are additive and guarded by `contains`, so a database at any
      // earlier version converges on the latest schema without touching data.
      upgrade(db) {
        if (!db.objectStoreNames.contains(SCORES_STORE)) {
          const scores = db.createObjectStore(SCORES_STORE, { keyPath: "id" });
          scores.createIndex("updatedAt", "updatedAt");
        }
        if (!db.objectStoreNames.contains(AUDIO_STORE)) {
          db.createObjectStore(AUDIO_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(SYNC_STORE)) {
          db.createObjectStore(SYNC_STORE, { keyPath: "scoreId" });
        }
      },
    });
  }
  return dbPromise;
}
