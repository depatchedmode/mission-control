import { EventEmitter } from "eventemitter3";
import debug from "debug";
export class RemoteHeadsSubscriptions extends EventEmitter {
    // Storage IDs we have received remote heads from
    #knownHeads = new Map();
    // Storage IDs we have subscribed to via Repo.subscribeToRemoteHeads
    #ourSubscriptions = new Set();
    // Storage IDs other peers have subscribed to by sending us a control message
    #theirSubscriptions = new Map();
    // Peers we will always share remote heads with even if they are not subscribed
    #generousPeers = new Set();
    // Documents each peer has open, we need this information so we only send remote heads of documents that the peer knows
    #subscribedDocsByPeer = new Map();
    #log = debug("automerge-repo:remote-heads-subscriptions");
    subscribeToRemotes(remotes) {
        this.#log("subscribeToRemotes", remotes);
        const remotesToAdd = [];
        for (const remote of remotes) {
            if (!this.#ourSubscriptions.has(remote)) {
                this.#ourSubscriptions.add(remote);
                remotesToAdd.push(remote);
            }
        }
        if (remotesToAdd.length > 0) {
            this.emit("change-remote-subs", {
                add: remotesToAdd,
                peers: Array.from(this.#generousPeers),
            });
        }
    }
    unsubscribeFromRemotes(remotes) {
        this.#log("subscribeToRemotes", remotes);
        const remotesToRemove = [];
        for (const remote of remotes) {
            if (this.#ourSubscriptions.has(remote)) {
                this.#ourSubscriptions.delete(remote);
                if (!this.#theirSubscriptions.has(remote)) {
                    remotesToRemove.push(remote);
                }
            }
        }
        if (remotesToRemove.length > 0) {
            this.emit("change-remote-subs", {
                remove: remotesToRemove,
                peers: Array.from(this.#generousPeers),
            });
        }
    }
    handleControlMessage(control) {
        const remotesToAdd = [];
        const remotesToRemove = [];
        const addedRemotesWeKnow = [];
        this.#log("handleControlMessage", control);
        if (control.add) {
            for (const remote of control.add) {
                let theirSubs = this.#theirSubscriptions.get(remote);
                if (this.#ourSubscriptions.has(remote) || theirSubs) {
                    addedRemotesWeKnow.push(remote);
                }
                if (!theirSubs) {
                    theirSubs = new Set();
                    this.#theirSubscriptions.set(remote, theirSubs);
                    if (!this.#ourSubscriptions.has(remote)) {
                        remotesToAdd.push(remote);
                    }
                }
                theirSubs.add(control.senderId);
            }
        }
        if (control.remove) {
            for (const remote of control.remove) {
                const theirSubs = this.#theirSubscriptions.get(remote);
                if (theirSubs) {
                    theirSubs.delete(control.senderId);
                    // if no one is subscribed anymore remove remote
                    if (theirSubs.size == 0 && !this.#ourSubscriptions.has(remote)) {
                        remotesToRemove.push(remote);
                    }
                }
            }
        }
        if (remotesToAdd.length > 0 || remotesToRemove.length > 0) {
            this.emit("change-remote-subs", {
                peers: Array.from(this.#generousPeers),
                add: remotesToAdd,
                remove: remotesToRemove,
            });
        }
        // send all our stored heads of documents the peer knows for the remotes they've added
        for (const remote of addedRemotesWeKnow) {
            const subscribedDocs = this.#subscribedDocsByPeer.get(control.senderId);
            if (subscribedDocs) {
                for (const documentId of subscribedDocs) {
                    const knownHeads = this.#knownHeads.get(documentId);
                    if (!knownHeads) {
                        continue;
                    }
                    const lastHeads = knownHeads.get(remote);
                    if (lastHeads) {
                        this.emit("notify-remote-heads", {
                            targetId: control.senderId,
                            documentId,
                            heads: lastHeads.heads,
                            timestamp: lastHeads.timestamp,
                            storageId: remote,
                        });
                    }
                }
            }
        }
    }
    /** A peer we are not directly connected to has changed their heads */
    handleRemoteHeads(msg) {
        this.#log("handleRemoteHeads", msg);
        const changedHeads = this.#changedHeads(msg);
        // Emit a remote-heads-changed event to update local dochandles
        for (const event of changedHeads) {
            if (this.#ourSubscriptions.has(event.storageId)) {
                this.emit("remote-heads-changed", event);
            }
        }
        // Notify generous peers of these changes regardless of if they are subscribed to us
        for (const event of changedHeads) {
            for (const peer of this.#generousPeers) {
                // don't emit event to sender if sender is a generous peer
                if (peer === msg.senderId) {
                    continue;
                }
                this.emit("notify-remote-heads", {
                    targetId: peer,
                    documentId: event.documentId,
                    heads: event.remoteHeads,
                    timestamp: event.timestamp,
                    storageId: event.storageId,
                });
            }
        }
        // Notify subscribers of these changes
        for (const event of changedHeads) {
            const theirSubs = this.#theirSubscriptions.get(event.storageId);
            if (theirSubs) {
                for (const peerId of theirSubs) {
                    if (this.#isPeerSubscribedToDoc(peerId, event.documentId)) {
                        this.emit("notify-remote-heads", {
                            targetId: peerId,
                            documentId: event.documentId,
                            heads: event.remoteHeads,
                            timestamp: event.timestamp,
                            storageId: event.storageId,
                        });
                    }
                }
            }
        }
    }
    /** A peer we are directly connected to has updated their heads */
    handleImmediateRemoteHeadsChanged(documentId, storageId, heads) {
        this.#log("handleLocalHeadsChanged", documentId, storageId, heads);
        const remote = this.#knownHeads.get(documentId);
        const timestamp = Date.now();
        if (!remote) {
            this.#knownHeads.set(documentId, new Map([[storageId, { heads, timestamp }]]));
        }
        else {
            const docRemote = remote.get(storageId);
            if (!docRemote || docRemote.timestamp < Date.now()) {
                remote.set(storageId, { heads, timestamp: Date.now() });
            }
        }
        const theirSubs = this.#theirSubscriptions.get(storageId);
        if (theirSubs) {
            for (const peerId of theirSubs) {
                if (this.#isPeerSubscribedToDoc(peerId, documentId)) {
                    this.emit("notify-remote-heads", {
                        targetId: peerId,
                        documentId: documentId,
                        heads: heads,
                        timestamp: timestamp,
                        storageId: storageId,
                    });
                }
            }
        }
    }
    addGenerousPeer(peerId) {
        this.#log("addGenerousPeer", peerId);
        this.#generousPeers.add(peerId);
        if (this.#ourSubscriptions.size > 0) {
            this.emit("change-remote-subs", {
                add: Array.from(this.#ourSubscriptions),
                peers: [peerId],
            });
        }
        for (const [documentId, remote] of this.#knownHeads) {
            for (const [storageId, { heads, timestamp }] of remote) {
                this.emit("notify-remote-heads", {
                    targetId: peerId,
                    documentId: documentId,
                    heads: heads,
                    timestamp: timestamp,
                    storageId: storageId,
                });
            }
        }
    }
    removePeer(peerId) {
        this.#log("removePeer", peerId);
        const remotesToRemove = [];
        this.#generousPeers.delete(peerId);
        this.#subscribedDocsByPeer.delete(peerId);
        for (const [storageId, peerIds] of this.#theirSubscriptions) {
            if (peerIds.has(peerId)) {
                peerIds.delete(peerId);
                if (peerIds.size == 0) {
                    remotesToRemove.push(storageId);
                    this.#theirSubscriptions.delete(storageId);
                }
            }
        }
        if (remotesToRemove.length > 0) {
            this.emit("change-remote-subs", {
                remove: remotesToRemove,
                peers: Array.from(this.#generousPeers),
            });
        }
    }
    subscribePeerToDoc(peerId, documentId) {
        let subscribedDocs = this.#subscribedDocsByPeer.get(peerId);
        if (!subscribedDocs) {
            subscribedDocs = new Set();
            this.#subscribedDocsByPeer.set(peerId, subscribedDocs);
        }
        subscribedDocs.add(documentId);
        const remoteHeads = this.#knownHeads.get(documentId);
        if (remoteHeads) {
            for (const [storageId, lastHeads] of remoteHeads) {
                const subscribedPeers = this.#theirSubscriptions.get(storageId);
                if (subscribedPeers && subscribedPeers.has(peerId)) {
                    this.emit("notify-remote-heads", {
                        targetId: peerId,
                        documentId,
                        heads: lastHeads.heads,
                        timestamp: lastHeads.timestamp,
                        storageId,
                    });
                }
            }
        }
    }
    #isPeerSubscribedToDoc(peerId, documentId) {
        const subscribedDocs = this.#subscribedDocsByPeer.get(peerId);
        return subscribedDocs && subscribedDocs.has(documentId);
    }
    /** Returns the (document, storageId) pairs which have changed after processing msg */
    #changedHeads(msg) {
        const changedHeads = [];
        const { documentId, newHeads } = msg;
        for (const [storageId, { heads, timestamp }] of Object.entries(newHeads)) {
            if (!this.#ourSubscriptions.has(storageId) &&
                !this.#theirSubscriptions.has(storageId)) {
                continue;
            }
            let remote = this.#knownHeads.get(documentId);
            if (!remote) {
                remote = new Map();
                this.#knownHeads.set(documentId, remote);
            }
            const docRemote = remote.get(storageId);
            if (docRemote && docRemote.timestamp >= timestamp) {
                continue;
            }
            else {
                remote.set(storageId, { timestamp, heads });
                changedHeads.push({
                    documentId,
                    storageId: storageId,
                    remoteHeads: heads,
                    timestamp,
                });
            }
        }
        return changedHeads;
    }
}
