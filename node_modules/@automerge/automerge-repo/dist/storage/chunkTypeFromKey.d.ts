import type { StorageKey, ChunkType } from "./types.js";
/**
 * Keys for storing Automerge documents are of the form:
 * ```ts
 * [documentId, "snapshot", hash]  // OR
 * [documentId, "incremental", hash]
 * ```
 * This function returns the chunk type ("snapshot" or "incremental") if the key is in one of these
 * forms.
 */
export declare function chunkTypeFromKey(key: StorageKey): ChunkType | null;
//# sourceMappingURL=chunkTypeFromKey.d.ts.map