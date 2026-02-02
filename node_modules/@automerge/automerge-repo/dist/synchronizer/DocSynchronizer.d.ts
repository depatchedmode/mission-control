import { next as A } from "@automerge/automerge/slim";
import { DocHandle } from "../DocHandle.js";
import { EphemeralMessage, RepoMessage, RequestMessage, SyncMessage } from "../network/messages.js";
import { PeerId } from "../types.js";
import { Synchronizer } from "./Synchronizer.js";
type PeerDocumentStatus = "unknown" | "has" | "unavailable" | "wants";
interface DocSynchronizerConfig {
    handle: DocHandle<unknown>;
    peerId: PeerId;
    onLoadSyncState?: (peerId: PeerId) => Promise<A.SyncState | undefined>;
}
/**
 * DocSynchronizer takes a handle to an Automerge document, and receives & dispatches sync messages
 * to bring it inline with all other peers' versions.
 */
export declare class DocSynchronizer extends Synchronizer {
    #private;
    syncDebounceRate: number;
    constructor({ handle, peerId, onLoadSyncState }: DocSynchronizerConfig);
    get peerStates(): Record<PeerId, PeerDocumentStatus>;
    get documentId(): import("../types.js").DocumentId;
    hasPeer(peerId: PeerId): boolean;
    beginSync(peerIds: PeerId[]): Promise<void>;
    endSync(peerId: PeerId): void;
    receiveMessage(message: RepoMessage): void;
    receiveEphemeralMessage(message: EphemeralMessage): void;
    receiveSyncMessage(message: SyncMessage | RequestMessage): void;
    metrics(): {
        peers: PeerId[];
        size: {
            numOps: number;
            numChanges: number;
        };
    };
}
export {};
//# sourceMappingURL=DocSynchronizer.d.ts.map