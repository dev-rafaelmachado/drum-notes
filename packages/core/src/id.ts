/**
 * Generate a unique identifier. Framework-agnostic: relies on the standard
 * `crypto.randomUUID` available in both Node and browsers, with a fallback.
 */
export function createId(): string {
  const cryptoObj = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
