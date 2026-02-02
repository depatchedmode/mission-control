import { Chunk, StorageAdapterInterface, type StorageKey } from "../../src/index.js";
export declare class DummyStorageAdapter implements StorageAdapterInterface {
    #private;
    loadRange(keyPrefix: StorageKey): Promise<Chunk[]>;
    removeRange(keyPrefix: string[]): Promise<void>;
    load(key: string[]): Promise<Uint8Array | undefined>;
    save(key: string[], binary: Uint8Array): Promise<void>;
    remove(key: string[]): Promise<void>;
    keys(): string[];
}
//# sourceMappingURL=DummyStorageAdapter.d.ts.map