import type { SyncMap } from "@drum-notes/notation-engine";

import { getDb, SYNC_STORE } from "@/shared/lib/database";

/**
 * Local persistence for the score-to-audio SyncMap (see docs/adr/008-score-sync.md).
 * Stored separately from notation, keyed by `scoreId`, so the two evolve
 * independently. Storage never enters the framework-agnostic domain.
 */

export async function saveSyncMap(map: SyncMap): Promise<void> {
  const db = await getDb();
  await db.put(SYNC_STORE, map);
}

export async function loadSyncMap(scoreId: string): Promise<SyncMap | null> {
  const db = await getDb();
  const record = (await db.get(SYNC_STORE, scoreId)) as SyncMap | undefined;
  return record ?? null;
}

export async function deleteSyncMap(scoreId: string): Promise<void> {
  const db = await getDb();
  await db.delete(SYNC_STORE, scoreId);
}
