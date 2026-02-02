import type { StorageAdapterInterface } from "../../storage/StorageAdapterInterface.js";
export declare function runStorageAdapterTests(_setup: SetupFn, title?: string): void;
export type SetupFn = () => Promise<{
    adapter: StorageAdapterInterface;
    teardown?: () => void;
}>;
//# sourceMappingURL=storage-adapter-tests.d.ts.map