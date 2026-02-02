/* c8 ignore start */
import { EventEmitter } from "eventemitter3";
/** An interface representing some way to connect to other peers
 *
 * @remarks
 * The {@link Repo} uses one or more `NetworkAdapter`s to connect to other peers.
 * Because the network may take some time to be ready the {@link Repo} will wait
 * until the adapter emits a `ready` event before it starts trying to use it
 *
 * This utility class can be used as a base to build a custom network adapter. It
 * is most useful as a simple way to add the necessary event emitter functionality
 */
export class NetworkAdapter extends EventEmitter {
    peerId;
    peerMetadata;
}
