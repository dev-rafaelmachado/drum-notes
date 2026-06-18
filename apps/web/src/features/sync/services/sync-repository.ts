import type { SyncMap } from "@drum-notes/notation-engine";

import { getDb, SYNC_STORE } from "@/shared/lib/database";

/**
 * Local persistence for the score-to-audio SyncMap (see docs/adr/008-score-sync.md).
 * Stored separately from notation, keyed by `scoreId`, so the two evolve
 * independently. Storage never enters the framework-agnostic domain.
 *
 * The projection anchor (AUDIO-006) is persisted in the same record so it
 * survives reload and can drive regeneration — no separate store needed.
 */

/** The measure whose timestamp drives projection, with its start in seconds. */
export type SyncAnchor = { readonly measureId: string; readonly start: number };

/** What is stored: the SyncMap plus its optional projection anchor. */
type StoredSync = SyncMap & { readonly anchor?: SyncAnchor | null };

export async function saveSyncMap(map: SyncMap, anchor: SyncAnchor | null = null): Promise<void> {
  const db = await getDb();
  await db.put(SYNC_STORE, { ...map, anchor });
}

export async function loadSyncMap(
  scoreId: string,
): Promise<{ map: SyncMap; anchor: SyncAnchor | null } | null> {
  const db = await getDb();
  const record = (await db.get(SYNC_STORE, scoreId)) as StoredSync | undefined;
  if (!record) {
    return null;
  }
  const { anchor = null, ...map } = record;
  return { map, anchor };
}

export async function deleteSyncMap(scoreId: string): Promise<void> {
  const db = await getDb();
  await db.delete(SYNC_STORE, scoreId);
}
