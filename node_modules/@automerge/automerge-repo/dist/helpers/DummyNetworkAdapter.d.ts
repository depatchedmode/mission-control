import { Message, NetworkAdapter, PeerId } from "../../src/index.js";
export declare class DummyNetworkAdapter extends NetworkAdapter {
    #private;
    isReady(): boolean;
    whenReady(): Promise<void>;
    forceReady(): void;
    constructor(opts?: Options);
    connect(peerId: PeerId): void;
    disconnect(): void;
    peerCandidate(peerId: PeerId): void;
    send(message: Message): void;
    receive(message: Message): void;
    static createConnectedPair({ latency }?: {
        latency?: number;
    }): DummyNetworkAdapter[];
}
type SendMessageFn = (message: Message) => void;
type Options = {
    startReady?: boolean;
    sendMessage?: SendMessageFn;
};
export {};
//# sourceMappingURL=DummyNetworkAdapter.d.ts.map