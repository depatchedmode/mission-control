import type { StorageAdapterInterface } from "../../storage/StorageAdapterInterface.js";
export declare function runStorageAdapterTests(setup: SetupFn, title?: string): void;
export type SetupFn = () => Promise<{
    adapter: StorageAdapterInterface;
    teardown?: () => void | Promise<void>;
}>;
//# sourceMappingURL=storage-adapter-tests.d.ts.map