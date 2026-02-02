import type { NetworkAdapterInterface } from "../../network/NetworkAdapterInterface.js";
/**
 * Runs a series of tests against a set of three peers, each represented by one or more instantiated
 * network adapters.
 *
 * The adapter `setup` function should return an object with the following properties:
 *
 * - `adapters`: A tuple representing three peers' network configuration. Each element can be either
 *   a single adapter or an array of adapters. Each will be used to instantiate a Repo for that
 *   peer.
 * - `teardown`: An optional function that will be called after the tests have run. This can be used
 *   to clean up any resources that were created during the test.
 */
export declare function runNetworkAdapterTests(_setup: SetupFn, title?: string): void;
type Network = NetworkAdapterInterface | NetworkAdapterInterface[];
export type SetupFn = () => Promise<{
    adapters: [Network, Network, Network];
    teardown?: () => void;
}>;
export {};
//# sourceMappingURL=network-adapter-tests.d.ts.map