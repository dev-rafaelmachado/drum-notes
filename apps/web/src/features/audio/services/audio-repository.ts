import { AUDIO_STORE, getDb } from "@/shared/lib/database";

/**
 * Local persistence for uploaded audio blobs (see docs/adr/006-audio-storage.md).
 * The domain Score holds only an AudioReference (metadata); the bytes live here,
 * keyed by that reference `id`. Storage never enters the framework-agnostic
 * domain.
 */

export type StoredAudio = {
  readonly id: string;
  readonly blob: Blob;
  readonly mimeType: string;
  readonly fileName: string;
};

export async function saveAudioBlob(audio: StoredAudio): Promise<void> {
  const db = await getDb();
  await db.put(AUDIO_STORE, audio);
}

export async function loadAudioBlob(id: string): Promise<StoredAudio | null> {
  const db = await getDb();
  const record = (await db.get(AUDIO_STORE, id)) as StoredAudio | undefined;
  return record ?? null;
}

export async function deleteAudioBlob(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(AUDIO_STORE, id);
}
