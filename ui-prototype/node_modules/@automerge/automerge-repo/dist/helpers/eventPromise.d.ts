import { EventEmitter } from "eventemitter3";
/** Returns a promise that resolves when the given event is emitted on the given emitter. */
export declare const eventPromise: (emitter: EventEmitter, event: string) => Promise<any>;
export declare const eventPromises: (emitters: EventEmitter[], event: string) => Promise<any[]>;
//# sourceMappingURL=eventPromise.d.ts.map