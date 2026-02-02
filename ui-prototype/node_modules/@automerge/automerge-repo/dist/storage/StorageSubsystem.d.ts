import * as A from "@automerge/automerge/slim/next";
import { type DocumentId } from "../types.js";
import { StorageAdapterInterface } from "./StorageAdapterInterface.js";
import { StorageId } from "./types.js";
/**
 * The storage subsystem is responsible for saving and loading Automerge documents to and from
 * storage adapter. It also provides a generic key/value storage interface for other uses.
 */
export declare class StorageSubsystem {
    #private;
    constructor(storageAdapter: StorageAdapterInterface);
    id(): Promise<StorageId>;
    /** Loads a value from storage. */
    load(
    /** Namespace to prevent collisions with other users of the storage subsystem. */
    namespace: string, 
    /** Key to load. Typically a UUID or other unique identifier, but could be any string. */
    key: string): Promise<Uint8Array | undefined>;
    /** Saves a value in storage. */
    save(
    /** Namespace to prevent collisions with other users of the storage subsystem. */
    namespace: string, 
    /** Key to load. Typically a UUID or other unique identifier, but could be any string. */
    key: string, 
    /** Data to save, as a binary blob. */
    data: Uint8Array): Promise<void>;
    /** Removes a value from storage. */
    remove(
    /** Namespace to prevent collisions with other users of the storage subsystem. */
    namespace: string, 
    /** Key to remove. Typically a UUID or other unique identifier, but could be any string. */
    key: string): Promise<void>;
    /**
     * Loads the Automerge document with the given ID from storage.
     */
    loadDoc<T>(documentId: DocumentId): Promise<A.Doc<T> | null>;
    /**
     * Saves the provided Automerge document to storage.
     *
     * @remarks
     * Under the hood this makes incremental saves until the incremental size is greater than the
     * snapshot size, at which point the document is compacted into a single snapshot.
     */
    saveDoc(documentId: DocumentId, doc: A.Doc<unknown>): Promise<void>;
    /**
     * Removes the Automerge document with the given ID from storage
     */
    removeDoc(documentId: DocumentId): Promise<void>;
    loadSyncState(documentId: DocumentId, storageId: StorageId): Promise<A.SyncState | undefined>;
    saveSyncState(documentId: DocumentId, storageId: StorageId, syncState: A.SyncState): Promise<void>;
}
//# sourceMappingURL=StorageSubsystem.d.ts.map