import { next as A } from "@automerge/automerge/slim";
import { EventEmitter } from "eventemitter3";
import { DocumentId, PeerId } from "./types.js";
import { RemoteHeadsChanged, RemoteSubscriptionControlMessage } from "./network/messages.js";
import { StorageId } from "./index.js";
export type RemoteHeadsSubscriptionEventPayload = {
    documentId: DocumentId;
    storageId: StorageId;
    remoteHeads: A.Heads;
    timestamp: number;
};
export type NotifyRemoteHeadsPayload = {
    targetId: PeerId;
    documentId: DocumentId;
    storageId: StorageId;
    heads: A.Heads;
    timestamp: number;
};
type RemoteHeadsSubscriptionEvents = {
    "remote-heads-changed": (payload: RemoteHeadsSubscriptionEventPayload) => void;
    "change-remote-subs": (payload: {
        peers: PeerId[];
        add?: StorageId[];
        remove?: StorageId[];
    }) => void;
    "notify-remote-heads": (payload: NotifyRemoteHeadsPayload) => void;
};
export declare class RemoteHeadsSubscriptions extends EventEmitter<RemoteHeadsSubscriptionEvents> {
    #private;
    subscribeToRemotes(remotes: StorageId[]): void;
    unsubscribeFromRemotes(remotes: StorageId[]): void;
    handleControlMessage(control: RemoteSubscriptionControlMessage): void;
    /** A peer we are not directly connected to has changed their heads */
    handleRemoteHeads(msg: RemoteHeadsChanged): void;
    /** A peer we are directly connected to has updated their heads */
    handleImmediateRemoteHeadsChanged(documentId: DocumentId, storageId: StorageId, heads: A.Heads): void;
    addGenerousPeer(peerId: PeerId): void;
    removePeer(peerId: PeerId): void;
    subscribePeerToDoc(peerId: PeerId, documentId: DocumentId): void;
}
export {};
//# sourceMappingURL=RemoteHeadsSubscriptions.d.ts.map